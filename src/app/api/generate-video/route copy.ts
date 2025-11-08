import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import videoshow from 'videoshow';
import wav from 'wav';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function generateScript(markdown: string): Promise<string> {
  const prompt = `Convert the following markdown content into a natural, engaging narration script for a video slideshow.\nKeep it concise (2-3 sentences per slide). Remove markdown syntax. Return plain text suitable for text-to-speech.\n\nMarkdown:\n${markdown}`;

  const response = await genAI.models.generateContent({ model: 'gemini-2.5-flash-lite', contents: prompt });
  const text = (response as any).text ?? (typeof (response as any)?.response?.text === 'function' ? (response as any).response.text() : '');
  return String(text || '').trim();
}

async function generateAudio(text: string, outputPath: string): Promise<number> {
  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });

  const anyResp = response as any;
  try { console.log('[GenAI TTS] response summary keys:', Object.keys(anyResp || {}).slice(0, 20)); } catch {}

  // Extract base64 audio/pcm per docs
  let b64: string | undefined = anyResp?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  b64 = b64 || anyResp?.candidates?.[0]?.content?.parts?.[0]?.data;
  b64 = b64 || anyResp?.data;
  if (!b64) {
    const preview = JSON.stringify(Object.keys(anyResp || {}).slice(0, 10));
    throw new Error('No audio data returned from GenAI TTS — response keys: ' + preview);
  }

  const audioBuffer = Buffer.from(b64, 'base64');
  if (!audioBuffer || audioBuffer.length === 0) throw new Error('Received empty audio buffer from GenAI');

  // Detect format by magic bytes
  const head = audioBuffer.slice(0, 4);
  const headStr = head.toString('ascii');
  const isWav = headStr === 'RIFF';
  const isId3 = audioBuffer.slice(0, 3).toString() === 'ID3';
  const isMp3Frame = audioBuffer[0] === 0xff && (audioBuffer[1] & 0xe0) === 0xe0;

  const tmpWav = outputPath.replace(/\.mp3$/i, '.wav');

  if (isWav) {
    await writeFile(tmpWav, audioBuffer);
  } else if (isId3 || isMp3Frame) {
    // Already MP3
    await writeFile(outputPath, audioBuffer);
    return Math.max(3, Math.ceil(text.length / 140));
  } else {
    // Assume PCM bytes -> write WAV using wav.FileWriter
    await new Promise<void>((resolve, reject) => {
      try {
        const writer = new wav.FileWriter(tmpWav, { channels: 1, sampleRate: 24000, bitDepth: 16 });
        writer.on('finish', () => resolve());
        writer.on('error', (err: any) => reject(err));
        writer.write(audioBuffer);
        writer.end();
      } catch (e) {
        reject(e as any);
      }
    });
  }

  // If we created tmpWav, transcode to MP3
  if (!isId3 && !isMp3Frame) {
    await new Promise<void>((resolve, reject) => {
      const args = ['-y', '-i', tmpWav, '-codec:a', 'libmp3lame', '-qscale:a', '2', outputPath];
      const ff = spawn('ffmpeg', args, { stdio: 'inherit' });
      ff.on('error', (err) => reject(err));
      ff.on('exit', async (code) => {
        try { await unlink(tmpWav).catch(() => {}); } catch {}
        if (code === 0) resolve(); else reject(new Error('ffmpeg exited with code ' + code));
      });
    });
  }

  return Math.max(3, Math.ceil(text.length / 140));
}

async function createVideo(
  imageBuffers: { data: Buffer; name: string }[],
  audioPath: string,
  outputPath: string,
  audioDurationSeconds: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (imageBuffers.length === 0) return reject(new Error('No images provided'));

    const secondsPerImage = Math.ceil(audioDurationSeconds / imageBuffers.length);
    const images = imageBuffers.map((img) => ({ path: img.name, duration: secondsPerImage }));

    const opts = {
      fps: 25,
      transition: true,
      transitionDuration: 1,
      videoBitrate: 1024,
      audioBitrate: '128k',
      audioChannels: 2,
      loop: audioDurationSeconds,
    } as any;

    const tempDir = path.join(process.cwd(), 'public', 'temp_video');
    if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

    const tempImages = imageBuffers.map((img, i) => path.join(tempDir, `img_${i}.jpg`));

    (async () => {
      try {
        await Promise.all(imageBuffers.map((img, i) => writeFile(tempImages[i], img.data)));
        images.forEach((img, i) => (img.path = tempImages[i]));

        videoshow(images, opts)
          .audio(audioPath)
          .save(outputPath)
          .on('error', async (err: any) => {
            await Promise.all(tempImages.map((p) => unlink(p).catch(() => {})));
            reject(err);
          })
          .on('end', async () => {
            await Promise.all(tempImages.map((p) => unlink(p).catch(() => {})));
            resolve();
          });
      } catch (err) {
        reject(err);
      }
    })();
  });
}

export async function POST(req: Request) {
  const tempDir = path.join(process.cwd(), 'public', 'temp_video');
  const audioPath = path.join(tempDir, 'narration.mp3');
  const outputVideoPath = path.join(tempDir, `video_${Date.now()}.mp4`);

  try {
    if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

    const form = await req.formData();
    const content = form.get('content') as string;
    const images = form.getAll('images') as File[];

    if (!content || content.trim().length === 0) return NextResponse.json({ ok: false, error: 'Content is required' }, { status: 400 });
    if (images.length === 0) return NextResponse.json({ ok: false, error: 'At least one image is required' }, { status: 400 });

    console.log(`[Generate Video] Content: ${content.slice(0, 50)}...`);
    console.log(`[Generate Video] Images: ${images.length}`);

    console.log('[Generate Video] Generating script with Gemini...');
    const script = await generateScript(content);
    console.log(`[Generate Video] Script generated: ${script.slice(0, 100)}...`);

    console.log('[Generate Video] Generating audio...');
    const audioDuration = await generateAudio(script, audioPath);
    console.log(`[Generate Video] Audio generated (duration: ${audioDuration}s)`);

    console.log('[Generate Video] Preparing images...');
    const imageBuffers: { data: Buffer; name: string }[] = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const buffer = await img.arrayBuffer();
      imageBuffers.push({ data: Buffer.from(buffer), name: img.name || `image_${i}` });
    }
    console.log(`[Generate Video] ${imageBuffers.length} images prepared`);

    console.log('[Generate Video] Creating video...');
    await createVideo(imageBuffers, audioPath, outputVideoPath, audioDuration);
    console.log(`[Generate Video] Video created: ${outputVideoPath}`);

    if (audioPath) await unlink(audioPath).catch(() => {});

    return NextResponse.json({ ok: true, videoPath: outputVideoPath, audioPath, script: script.slice(0, 200), imagesCount: images.length, duration: audioDuration });
  } catch (err: any) {
    console.error('[Generate Video] Error:', err);
    await unlink(audioPath).catch(() => {});
    await unlink(outputVideoPath).catch(() => {});
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}

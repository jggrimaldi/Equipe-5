import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import videoshow from 'videoshow';
// Use require to avoid missing TypeScript type declarations for 'wav'
const wav = require('wav');
import sharp from 'sharp';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function generateScript(markdown: string, imagesCount: number): Promise<string> {
  const prompt = `WRITE IN PORTUGUESE! You are a storytelling assistant. Convert the following markdown into EXACTLY ${imagesCount} ordered sections for a slideshow. Each section must be an object with keys: \"section_time\" (number of seconds for comfortable reading), \"section_text\" (a short, engaging caption for the slide), and \"section_transcription\" (what the narrator should say for that slide). Write the sections in a storytelling manner. RETURN ONLY a single JSON object with a top-level \"sections\" array. Example: {\"sections\":[{\"section_time\":4,\"section_text\":\"Intro\",\"section_transcription\":\"Welcome...\"}]}\n\nMarkdown:\n${markdown}`;

  const response = await genAI.models.generateContent({ model: 'gemini-2.5-flash-lite', contents: prompt });
  const raw = (response as any).text ?? (typeof (response as any)?.response?.text === 'function' ? (response as any).response.text() : undefined);
  const text = String(raw || '').trim();
  let parsed: any = null;
  try { parsed = JSON.parse(text); } catch (e) {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try { parsed = JSON.parse(m[0]); } catch {}
    }
  }

  if (parsed && Array.isArray(parsed.sections)) {
    let sections = parsed.sections;
    if (sections.length < imagesCount) {
      const last = sections[sections.length - 1] || { section_time: Math.max(3, Math.ceil((markdown.length || 0) / 140)), section_text: '', section_transcription: '' };
      while (sections.length < imagesCount) sections.push(last);
    } else if (sections.length > imagesCount) {
      sections = sections.slice(0, imagesCount);
    }
    return JSON.stringify({ sections });
  }

  const parts = (markdown || '').split(/\n\n+/).filter(Boolean);
  const fallback: any[] = [];
  for (let i = 0; i < imagesCount; i++) {
    const t = parts[i] || parts[parts.length - 1] || markdown.slice(0, 120);
    const cleaned = String(t).replace(/[#*_`]/g, '').trim();
    const estimated = Math.max(3, Math.ceil(cleaned.length / 140));
    fallback.push({ section_time: estimated, section_text: cleaned.slice(0, 200), section_transcription: cleaned });
  }
  return JSON.stringify({ sections: fallback });
}

// TODO: FIX
async function generateAudio(text: string, outputPath: string): Promise<number> {
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

  const b64 = anyResp?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) {
    const preview = JSON.stringify(Object.keys(anyResp || {}).slice(0, 20));
    throw new Error('No audio data at expected path. Response keys: ' + preview);
  }

  const pcmBuffer = Buffer.from(b64, 'base64');
  if (!pcmBuffer || pcmBuffer.length === 0) throw new Error('Received empty PCM buffer from GenAI');

  const tmpWav = outputPath.replace(/\.mp3$/i, '.wav');

  async function saveWaveFile(filename: string, pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2) {
    return new Promise<void>((resolve, reject) => {
      try {
        const writer = new wav.FileWriter(filename, { channels, sampleRate: rate, bitDepth: sampleWidth * 8 });
        writer.on('finish', resolve);
        writer.on('error', reject);
        writer.write(pcmData);
        writer.end();
      } catch (e) {
        reject(e as any);
      }
    });
  }

  await saveWaveFile(tmpWav, pcmBuffer, 1, 24000, 2);

  await new Promise<void>((resolve, reject) => {
    const args = ['-y', '-i', tmpWav, '-codec:a', 'libmp3lame', '-qscale:a', '2', outputPath];
    console.log('[GenAI TTS] running ffmpeg', args.join(' '));
    const ff = spawn('ffmpeg', args, { stdio: 'inherit' });
    ff.on('error', (err) => reject(err));
    ff.on('exit', async (code) => {
      try { await unlink(tmpWav).catch(() => {}); } catch {}
      if (code === 0) resolve(); else reject(new Error('ffmpeg exited with code ' + code));
    });
  });

  return Math.max(3, Math.ceil(text.length / 140));
}

async function createVideo(
  imageBuffers: { data: Buffer; name: string }[],
  sections: { section_time: number; section_text: string; section_transcription: string }[],
  audioPath: string | undefined,
  outputPath: string,
  audioDurationSeconds: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (imageBuffers.length === 0) return reject(new Error('No images provided'));

    // Map sections to images (matching order). If counts differ, use fallbacks.
    const sanitizeCaption = (s: string) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 250);
    const images = imageBuffers.map((img, i) => {
      const section = sections[i] || sections[sections.length - 1] || { section_text: '', section_time: Math.ceil(audioDurationSeconds / imageBuffers.length), section_transcription: '' };
      const loop = Math.max(1, Math.ceil(section.section_time));
      const captionStart = 1000; // ms
      const captionEnd = Math.max(loop * 1000 - 1000, 500); // ms
      return { path: img.name, loop, caption: sanitizeCaption(section.section_text), captionStart, captionEnd } as any;
    });

    const opts = {
      fps: 25,
      transition: true,
      transitionDuration: 1,
      videoBitrate: 1024,
      audioBitrate: '128k',
      audioChannels: 2,
      loop: audioDurationSeconds,
      // Subtitle / caption settings from videoshow README
      captionDelay: 1000,
      useSubRipSubtitles: false,
      subtitleStyle: {
        Fontname: 'Verdana',
        Fontsize: '26',
        PrimaryColour: '11861244',
        SecondaryColour: '11861244',
        TertiaryColour: '11861244',
        BackColour: '-2147483640',
        Bold: '2',
        Italic: '0',
        BorderStyle: '2',
        Outline: '2',
        Shadow: '3',
        Alignment: '1',
        MarginL: '40',
        MarginR: '60',
        MarginV: '40',
      },
      videoCodec: 'libx264',
      format: 'mp4',
      pixelFormat: 'yuv420p',
    } as any;

    const tempDir = path.join(process.cwd(), 'public', 'temp_video');
    if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

    // Preserve original extensions when writing temp images
    const tempImages = imageBuffers.map((img, i) => {
      const ext = path.extname(img.name) || '.jpg';
      return path.join(tempDir, `img_${i}${ext}`);
    });

    (async () => {
      try {
        await Promise.all(imageBuffers.map((img, i) => writeFile(tempImages[i], img.data)));
        images.forEach((img, i) => (img.path = tempImages[i]));

        // Verify temp images were written and log sizes
        const sizes = await Promise.all(tempImages.map(async (p) => {
          try { const st = await (await import('fs/promises')).stat(p); return { path: p, size: st.size }; } catch (e) { return { path: p, size: 0 }; }
        }));
        console.log('[Generate Video] temp images sizes:', sizes);
        const anyZero = sizes.some((s) => s.size === 0);
        if (anyZero) {
          await Promise.all(tempImages.map((p) => unlink(p).catch(() => {})));
          return reject(new Error('One or more temp images are empty — aborting videoshow')); 
        }

        // Resize all images to the same dimensions (use the first image as target) via sharp
        const firstMeta = await sharp(tempImages[0]).metadata();
        const targetW = firstMeta.width || 1280;
        const targetH = firstMeta.height || 720;
        const tempResized = tempImages.map((p, i) => {
          const ext = path.extname(p) || '.jpg';
          return path.join(tempDir, `img_${i}_resized${ext}`);
        });

        for (let i = 0; i < tempImages.length; i++) {
          await sharp(tempImages[i])
            .resize({ width: targetW, height: targetH, fit: 'contain', background: { r: 0, g: 0, b: 0 } })
            .toFile(tempResized[i]);
        }

        // Replace tempImages references with resized images for probing and videoshow
        const finalImages = tempResized;

        // Probe each image with ffmpeg to capture any decode errors before running videoshow
        const probeImage = (file: string) => {
          return new Promise<string>((resolve) => {
            try {
              const proc = spawn('ffmpeg', ['-v', 'error', '-i', file, '-f', 'null', '-']);
              let stderr = '';
              proc.stderr.on('data', (d) => { stderr += d.toString(); });
              proc.on('close', (code) => { resolve(stderr || String(code)); });
              proc.on('error', (err) => { resolve(String(err)); });
            } catch (e: any) {
              resolve(String(e?.message || e));
            }
          });
        };

        const probeResults = await Promise.all(finalImages.map((p) => probeImage(p)));
        console.log('[Generate Video] ffmpeg probe results:', probeResults);
        const bad = probeResults.find((r) => r && r.length > 0 && !/^0$/.test(r));
        if (bad) {
          await Promise.all(finalImages.map((p) => unlink(p).catch(() => {})));
          await Promise.all(tempImages.map((p) => unlink(p).catch(() => {})));
          return reject(new Error('ffmpeg probe failed for one or more images: ' + bad));
        }

        // Point images to the resized files
        images.forEach((img, i) => (img.path = finalImages[i]));

        console.log('[Generate Video] videoshow inputs:', { images: images.length, audioPath: !!audioPath, outputPath });
        const vs = videoshow(images, opts);
        if (audioPath) vs.audio(audioPath);

        const emitter: any = (vs as any).save(outputPath);
        emitter.on('start', (command: string) => {
          console.log('[Generate Video] ffmpeg started:', command);
        });
        emitter.on('error', async (err: any, stdout?: string, stderr?: string) => {
          console.error('[Generate Video] videoshow error:', err);
          console.error('[Generate Video] ffmpeg stderr:', stderr);
          await Promise.all(finalImages.map((p) => unlink(p).catch(() => {})));
          await Promise.all(tempImages.map((p) => unlink(p).catch(() => {})));
          reject(new Error(`videoshow/ffmpeg failed: ${String(err)}\nffmpeg stderr:\n${stderr}`));
        });
        emitter.on('end', async () => {
          await Promise.all(finalImages.map((p) => unlink(p).catch(() => {})));
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
  const script = await generateScript(content, images.length);
  console.log(`[Generate Video] Script generated: ${script.slice(0,100)}...`);

    // Parse structured sections from the JSON response (section_time, section_text, section_transcription)
    let sections: { section_time: number; section_text: string; section_transcription: string }[] = [];
    try {
      const parsed = JSON.parse(script);
      sections = Array.isArray(parsed.sections) ? parsed.sections : [];
    } catch (e) {
      console.warn('[Generate Video] Could not parse sections JSON, falling back to plain split');
      const fallback = (script || content).split(/\n\n+/).filter(Boolean).map((t: string) => ({ section_time: Math.max(3, Math.ceil(t.length / 140)), section_text: t.replace(/[#*_`]/g, '').trim(), section_transcription: t.replace(/[#*_`]/g, '').trim() }));
      sections = fallback;
    }

    // Audio generation disabled for now — use AI-provided section_time for timing
    const fullText = sections.map((s) => s.section_transcription).join('\n\n');
    const sectionsTotal = sections.reduce((acc, s) => acc + (s.section_time || 0), 0) || Math.max(3, Math.ceil(fullText.length / 140));
    const audioDurationFinal = sectionsTotal;
    console.log(`[Generate Video] Audio generation disabled; using sections total: ${audioDurationFinal}s`);

    console.log('[Generate Video] Preparing images...');
    const imageBuffers: { data: Buffer; name: string }[] = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const buffer = await img.arrayBuffer();
      imageBuffers.push({ data: Buffer.from(buffer), name: img.name || `image_${i}` });
    }
    console.log(`[Generate Video] ${imageBuffers.length} images prepared`);

  console.log('[Generate Video] Creating video (no audio)...');
  await createVideo(imageBuffers, sections, undefined, outputVideoPath, audioDurationFinal);
  console.log(`[Generate Video] Video created: ${outputVideoPath}`);

  return NextResponse.json({ ok: true, videoPath: outputVideoPath, audioPath: null, script: script.slice(0, 200), imagesCount: images.length, duration: audioDurationFinal, sections });
  } catch (err: any) {
    console.error('[Generate Video] Error:', err);
    await unlink(outputVideoPath).catch(() => {});
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}

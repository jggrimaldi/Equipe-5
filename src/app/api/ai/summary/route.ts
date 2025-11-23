import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { markdown } = body;

    if (!markdown || typeof markdown !== 'string') {
      return NextResponse.json({ error: 'Missing markdown' }, { status: 400 });
    }

    // Call generateText to generate a summary with Gemini 2.5 Flash Lite
    const { text: summary } = await generateText({
      model: google('gemini-2.5-flash-lite'),
      prompt: `Você é um especialista em criar resumos jornalísticos concisos e informativos. 

Leia o artigo em Markdown abaixo e crie um resumo em Markdown que:
1. Capture os pontos-chave do artigo
2. Tenha entre 150-300 palavras
3. Use formatação markdown apropriada (títulos, listas, negrito, etc.)
4. Seja escrito em português brasileiro
5. Seja estruturado e fácil de ler

ARTIGO:

${markdown}

Gere APENAS o resumo em Markdown, sem explicações adicionais.`,
      maxTokens: 500,
    });

    return NextResponse.json({ summary });
  } catch (err: any) {
    console.error('summary route error', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate summary' }, { status: 500 });
  }
}

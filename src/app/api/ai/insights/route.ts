import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const SuggestionsSchema = z.array(
  z.object({
    title: z.string().describe('Título curto da sugestão'),
    description: z.string().describe('Descrição curta com a recomendação'),
  })
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { markdown } = body;

    if (!markdown || typeof markdown !== 'string') {
      return NextResponse.json({ error: 'Missing markdown' }, { status: 400 });
    }

    // Call generateObject to request a structured JSON array of suggestions in Portuguese
    const { object: suggestions } = await generateObject({
      model: google('gemini-2.5-flash-lite'),
      output: 'array',
      prompt: `Leia o artigo em Markdown abaixo e gere uma lista de sugestões de layout e melhorias. Responda em português. Retorne APENAS um array JSON. Cada item deve ter os campos: title (título curto) e description (descrição curta). ARTICLE:\n\n${markdown}`,
      schema: SuggestionsSchema,
      maxOutputTokens: 800,
    });

    return NextResponse.json({ suggestions });
  } catch (err: any) {
    console.error('insights route error', err);
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500 });
  }
}

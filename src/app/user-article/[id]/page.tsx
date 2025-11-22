import React from 'react';
import Image from 'next/image';
import Logo from '../../../../public/logo.png';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { UserTracker } from '@/components/UserTracker';
import { SidebarMenu } from '@/components/SidebarMenu';
import { UOLBar } from '@/components/UOLBar';
import { ArticleContentWrapper } from '@/components/ArticleContentWrapper';
import type { Metadata } from 'next';

// Types
interface ArticleData {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  author: string | null;
  category: string | null;
  views: number;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
}

const DEFAULT_IMAGE = "https://jc.uol.com.br/img/logo.svg";

// Helper to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate reading time (approximately 200 words per minute)
const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readingTime); // Minimum 1 minute
};

// Fetch related articles logic (adapted for Server Component)
async function fetchRelatedArticles(
  currentArticleId: string,
  currentArticleCategory: string | null
): Promise<ArticleData[]> {
  try {
    // Simple fetch for related articles (same category or recent)
    // This is a simplified version of the complex logic to ensure speed and SSR reliability

    // 1. Fetch same category
    let related: ArticleData[] = [];

    if (currentArticleCategory) {
      const { data: sameCat } = await supabase
        .from('articles')
        .select('*')
        .neq('id', currentArticleId)
        .eq('category', currentArticleCategory)
        .order('views', { ascending: false })
        .limit(4);

      if (sameCat) related = [...related, ...sameCat];
    }

    // 2. If not enough, fetch recent
    if (related.length < 4) {
      const { data: recent } = await supabase
        .from('articles')
        .select('*')
        .neq('id', currentArticleId)
        .order('created_at', { ascending: false })
        .limit(4 - related.length);

      if (recent) {
        // Filter duplicates
        const existingIds = new Set(related.map(a => a.id));
        const uniqueRecent = recent.filter(a => !existingIds.has(a.id));
        related = [...related, ...uniqueRecent];
      }
    }

    return related;
  } catch (err) {
    console.error('Error fetching related articles:', err);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (!article) {
    return {
      title: 'Notícia não encontrada',
      description: 'A notícia que você está procurando não existe ou foi removida.'
    };
  }

  const displayTitle = article.title ? article.title.substring(1).trim() : 'Sem título';
  const imageUrl = article.image_url || "https://jc.uol.com.br/img/logo.svg";
  const description = article.excerpt || (article.content ? article.content.substring(0, 160) : 'Leia mais sobre este artigo.');
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/user-article/${id}`;

  return {
    title: displayTitle,
    description: description,
    openGraph: {
      title: displayTitle,
      description: description,
      url: url,
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: displayTitle,
        }
      ],
      authors: article.author ? [article.author] : undefined,
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
      tags: article.category ? [article.category] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description: description,
      images: [imageUrl],
      creator: article.author || undefined,
    },
  };
}

export default async function UserArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch Article Data
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notícia não encontrada</h1>
          <p className="text-gray-600 mb-6">A notícia que você está procurando não existe ou foi removida.</p>
          <Link href="/user-article" className="text-red-600 hover:underline">Voltar para a Home</Link>
        </div>
      </div>
    );
  }

  const articleData = article as ArticleData;

  // Process title: remove first char and trim
  const displayTitle = articleData.title ? articleData.title.substring(1).trim() : '';

  // 3. Fetch Related Articles
  const relatedArticles = await fetchRelatedArticles(id, articleData.category);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <UOLBar />

      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <SidebarMenu />
            <Link href="/user-article" className="hover:opacity-80 transition-opacity">
              <Image src={Logo} alt="Logo" width={160} priority />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Article Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            {displayTitle}
          </h1>

          {/* Article Metadata */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            {articleData.excerpt && (
              <p className="text-lg text-gray-700 mb-4 italic">
                {articleData.excerpt}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <time dateTime={articleData.created_at}>
                {formatDate(articleData.created_at)}
              </time>
              <span>•</span>
              <span>{calculateReadingTime(articleData.content)} min de leitura</span>
              {articleData.author && (
                <>
                  <span>•</span>
                  <span>Por {articleData.author}</span>
                </>
              )}
            </div>
          </div>

          {/* Social Share Buttons (Mock) */}
          <div className="flex items-center gap-2 mb-8">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Compartilhar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
              WhatsApp
            </button>
          </div>

          {/* Featured Image */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-8 group">
            <img
              src={articleData.image_url || DEFAULT_IMAGE}
              alt={articleData.title}
              className="w-full h-full object-cover"
            />
          </div>

        </div>

        {/* Content - Client Component for Section Tracking */}
        <ArticleContentWrapper article={articleData} relatedArticles={relatedArticles} />

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-12 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>© 2025 SJCC. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

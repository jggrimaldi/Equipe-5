"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Logo from '../../../../public/logo.png';
import { supabase } from '@/lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { useUserTracking } from '@/hooks/use-user-tracking';

interface ArticleData {
  id: string;
  title: string;
  content: string;
  author: string | null;
  created_at: string;
  updated_at: string;
  views?: number;
}

interface SectionBlock {
  type: 'heading' | 'content';
  content: string;
}

export default function UserArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [article, setArticle] = React.useState<ArticleData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [readingTime, setReadingTime] = React.useState(0);
  const [sections, setSections] = React.useState<SectionBlock[]>([]);
  
  // Initialize user tracking
  const { userId, isTracking } = useUserTracking({ articleId: id });

  React.useEffect(() => {
    if (!id) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('id, title, content, author, created_at, updated_at')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Supabase error', error);
          return;
        }

        if (mounted) {
          setArticle(data as ArticleData);
          // Calculate reading time (average 200 words per minute)
          const wordCount = data.content?.split(/\s+/).length || 0;
          setReadingTime(Math.ceil(wordCount / 200));
          
          // Parse sections from content (excluding first heading which is title)
          const contentWithoutFirstHeading = data.content
            ? data.content.replace(/^#+\s+.+\n?/, '')
            : '';
          
          const lines = contentWithoutFirstHeading.split('\n');
          const parsedSections: SectionBlock[] = [];
          let currentContent = '';
          
          for (const line of lines) {
            if (line.match(/^#+\s+/)) {
              // It's a heading
              if (currentContent.trim()) {
                parsedSections.push({ type: 'content', content: currentContent.trim() });
                currentContent = '';
              }
              parsedSections.push({ type: 'heading', content: line });
            } else {
              currentContent += line + '\n';
            }
          }
          
          if (currentContent.trim()) {
            parsedSections.push({ type: 'content', content: currentContent.trim() });
          }
          
          setSections(parsedSections);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Carregando notícia...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notícia não encontrada</h1>
          <p className="text-gray-600 mb-6">A notícia que você está procurando não existe ou foi removida.</p>
         
        </div>
      </div>
    );
  }

  // Display title: remove the first character and trim the remaining string
  const displayTitle = article.title && article.title.length > 0 
    ? article.title.slice(1).trim() 
    : article.title || '';

  // Remove the first heading from content to avoid rendering title twice
  const contentWithoutFirstHeading = article.content
    ? article.content.replace(/^#+\s+.+\n?/, '')
    : '';

  const publishDate = article.created_at 
    ? new Date(article.created_at).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const updateDate = article.updated_at && article.updated_at !== article.created_at
    ? new Date(article.updated_at).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/user-article" className="flex items-center gap-2 hover:opacity-80 transition">
            <Image src={Logo} alt="Logo" width={120} />
          </Link>
         
        </div>
      </header>

      {/* Article Container */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Ad Space */}
          <aside className="col-span-2 sticky top-24 h-96">
            <div className="bg-gray-300 rounded-lg w-full h-full flex items-center justify-center">
              <span className="text-gray-500 text-sm">Anuncio</span>
            </div>
          </aside>

          {/* Article */}
          <div className="col-span-8">
        {/* Article Header */}
        <article className="bg-white rounded-2xl  p-10 mb-8">
          {/* Title */}
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {displayTitle}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m7 8H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z" />
              </svg>
              <time dateTime={article.created_at}>{publishDate}</time>
            </div>

            {updateDate && (
              <div className="flex items-center gap-2 text-gray-500">
                <span>•</span>
                <span>Atualizado em {updateDate}</span>
              </div>
            )}

            {article.author && (
              <div className="flex items-center gap-2">
                <span>•</span>
                <span className="text-gray-700 font-medium">{article.author}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span>•</span>
              <span className="text-gray-500">{readingTime} min de leitura</span>
            </div>
          </div>

          {/* Article Content */}
          <div className="mt-8">
            {sections.map((section, index) => (
              <React.Fragment key={index}>
                {section.type === 'heading' ? (
                  <div className="prose prose-lg max-w-none markdown-body text-gray-700">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({node, ...props}) => (
                          <img {...props} className="rounded-lg shadow-md my-6 max-w-full h-auto" alt={props.alt} />
                        ),
                        a: ({node, ...props}) => (
                          <a {...props} className="text-red-600 hover:text-red-700 underline transition" />
                        ),
                      }}
                    > 
                      {section.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="prose prose-lg max-w-none markdown-body text-gray-700">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({node, ...props}) => (
                          <img {...props} className="rounded-lg shadow-md my-6 max-w-full h-auto" alt={props.alt} />
                        ),
                        a: ({node, ...props}) => (
                          <a {...props} className="text-red-600 hover:text-red-700 underline transition" />
                        ),
                      }}
                    > 
                      {section.content}
                    </ReactMarkdown>
                  </div>
                )}
                
                {/* Show "Notícias Relacionadas" after every 2 sections (index 1, 3, 5, etc) */}
                {((index + 1) % 2 === 0) && (
                  <div className="my-8 bg-gray-300 rounded-lg p-6 flex items-center justify-center h-96">
                    <span className="text-gray-500 text-lg font-semibold">Notícias Relacionadas</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Final Related News Section at the end */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gray-300 rounded-lg p-6 flex items-center justify-center h-96">
              <span className="text-gray-500 text-lg font-semibold">Notícias Relacionadas</span>
            </div>
          </div>
        </article>
          </div>

          {/* Right Ad Space */}
          <aside className="col-span-2 sticky top-24 h-96">
            <div className="bg-gray-300 rounded-lg w-full h-full flex items-center justify-center">
              <span className="text-gray-500 text-sm">Ad Space</span>
            </div>
          </aside>
        </div>
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

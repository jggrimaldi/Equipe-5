"use client";

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SectionTracker } from './SectionTracker';
import { useUserTracking } from '@/hooks/use-user-tracking';

const DEFAULT_IMAGE = "https://jc.uol.com.br/img/logo.svg";

interface ArticleData {
  id: string;
  title: string;
  content: string;
  author: string | null;
  category: string | null;
  views: number;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
  excerpt?: string;
}

interface RelatedArticleData extends ArticleData {}

interface UserArticleContentProps {
  article: ArticleData;
  relatedArticles: RelatedArticleData[];
}

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

export function UserArticleContent({ article, relatedArticles }: UserArticleContentProps) {
  const { userId } = useUserTracking({ articleId: article.id });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayTitle = article.title ? article.title.substring(1).trim() : '';

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Article Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          {displayTitle}
        </h1>

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
            src={article.image_url || DEFAULT_IMAGE}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content with Section Tracking */}
      {mounted && userId ? (
        <SectionTracker userId={userId}>
          <article className="max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => <h1 className="text-3xl font-black text-gray-900 mt-10 mb-6 leading-tight" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3" {...props} />,
                p: ({ node, ...props }) => <p className="text-lg text-gray-700 leading-relaxed mb-6" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700 marker:text-red-600 ml-4" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-700 marker:text-red-600 font-medium ml-4" {...props} />,
                li: ({ node, ...props }) => <li className="pl-2" {...props} />,
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-red-600 pl-6 py-3 my-8 bg-gray-50 italic text-gray-700 rounded-r-lg shadow-sm" {...props} />
                ),
                a: ({ node, ...props }) => <a className="text-red-600 font-medium hover:text-red-800 hover:underline transition-colors decoration-red-300 underline-offset-2" {...props} />,
                img: ({ node, ...props }) => (
                  <div className="my-10">
                    <img className="rounded-xl shadow-lg w-full object-cover" {...props} alt={props.alt || 'Article Image'} />
                    {props.alt && <p className="text-sm text-gray-500 mt-3 text-center italic">{props.alt}</p>}
                  </div>
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-10 rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
                tbody: ({ node, ...props }) => <tbody className="bg-white divide-y divide-gray-200" {...props} />,
                tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 transition-colors" {...props} />,
                th: ({ node, ...props }) => <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider" {...props} />,
                td: ({ node, ...props }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700" {...props} />,
                code: ({ node, ...props }) => (
                  <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200" {...props} />
                ),
                pre: ({ node, ...props }) => (
                  <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto mb-8 text-sm font-mono shadow-inner" {...props} />
                ),
                hr: ({ node, ...props }) => <hr className="my-10 border-gray-200" {...props} />,
              }}
            >
              {article.content}
            </ReactMarkdown>
          </article>
        </SectionTracker>
      ) : (
        <article className="max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => <h1 className="text-3xl font-black text-gray-900 mt-10 mb-6 leading-tight" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3" {...props} />,
              p: ({ node, ...props }) => <p className="text-lg text-gray-700 leading-relaxed mb-6" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700 marker:text-red-600 ml-4" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-700 marker:text-red-600 font-medium ml-4" {...props} />,
              li: ({ node, ...props }) => <li className="pl-2" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-red-600 pl-6 py-3 my-8 bg-gray-50 italic text-gray-700 rounded-r-lg shadow-sm" {...props} />
              ),
              a: ({ node, ...props }) => <a className="text-red-600 font-medium hover:text-red-800 hover:underline transition-colors decoration-red-300 underline-offset-2" {...props} />,
              img: ({ node, ...props }) => (
                <div className="my-10">
                  <img className="rounded-xl shadow-lg w-full object-cover" {...props} alt={props.alt || 'Article Image'} />
                  {props.alt && <p className="text-sm text-gray-500 mt-3 text-center italic">{props.alt}</p>}
                </div>
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-10 rounded-lg border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200" {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
              tbody: ({ node, ...props }) => <tbody className="bg-white divide-y divide-gray-200" {...props} />,
              tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 transition-colors" {...props} />,
              th: ({ node, ...props }) => <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider" {...props} />,
              td: ({ node, ...props }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700" {...props} />,
              code: ({ node, ...props }) => (
                <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200" {...props} />
              ),
              pre: ({ node, ...props }) => (
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto mb-8 text-sm font-mono shadow-inner" {...props} />
              ),
              hr: ({ node, ...props }) => <hr className="my-10 border-gray-200" {...props} />,
            }}
          >
            {article.content}
          </ReactMarkdown>
        </article>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-16 pt-10 border-t border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">
            Leia Também
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedArticles.map(related => (
              <a key={related.id} href={`/user-article/${related.id}`} className="group block">
                <div className="flex gap-4 items-start">
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={related.image_url || DEFAULT_IMAGE}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                      {related.category || 'Notícia'}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-red-600 transition-colors line-clamp-3 leading-snug mt-1">
                      {related.title.substring(1).trim()}
                    </h3>
                    <span className="text-xs text-gray-400 mt-2 block">
                      {formatDate(related.created_at)}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

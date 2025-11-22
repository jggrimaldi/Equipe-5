'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SectionTracker } from './SectionTracker';
import { useUserTracking } from '@/hooks/use-user-tracking';

const DEFAULT_IMAGE = "https://jc.uol.com.br/img/logo.svg";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

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
}

export function ArticleContentWrapper({ article, relatedArticles }: { article: ArticleData; relatedArticles: ArticleData[] }) {
  const { userId } = useUserTracking({ articleId: article.id });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !userId) {
    return (
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
    );
  }

  return (
    <SectionTracker userId={userId} articleId={article.id}>
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

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-16 pt-10 border-t border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">
            Leia Também
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedArticles.map(related => (
              <Link key={related.id} href={`/user-article/${related.id}`} className="group block">
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
              </Link>
            ))}
          </div>
        </div>
      )}
    </SectionTracker>
  );
}

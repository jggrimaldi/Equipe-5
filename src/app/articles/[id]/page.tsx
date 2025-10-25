"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Logo from '../../../../public/logo.png';
import { supabase } from '@/lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [article, setArticle] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

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

        if (mounted) setArticle(data);
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
    return <div className="p-6">Carregando...</div>;
  }

  if (!article) {
    return <div className="p-6">Notícia não encontrada.</div>;
  }

  // content is saved as GFM markdown in the `content` column
  const markdown = article.content || '';

  // display title: remove the first character and trim the remaining string
  const displayTitle = article.title && article.title.length > 0 ? article.title.slice(1).trim() : article.title || '';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Image src={Logo} alt="Logo" width={140} />
          <h2 className="text-xl font-semibold">Detalhes da Notícia</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">Salvo há 2 minutos</div>
          <button
            onClick={() => router.push(`/new-article?id=${article.id}`)}
            className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
          >
            Editar
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="h-56 bg-gray-100 w-full relative">
              {article.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={article.image_url} alt={article.title} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">Sem Imagem</div>
              )}
            </div>
            <div className="p-6">

               <div className="prose max-w-none markdown-body text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}> 
                  {markdown}
                </ReactMarkdown>
               </div>

              <div className="mt-6 text-sm text-gray-400 flex items-center justify-between">
                <div>Publicado em: {article.created_at ? new Date(article.created_at).toLocaleDateString() : '—'}</div>
                <div className="flex items-center gap-2">{(article.views ?? 0).toLocaleString()} views</div>
              </div>
            </div>
          </div>
        </div>

        <aside className="col-span-1">
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <h3 className="font-medium mb-3">Demografia</h3>
            <div className="text-sm text-gray-500">(placeholder for charts)</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm mt-4">
            <h3 className="font-medium mb-3">Horários de Pico</h3>
            <div className="text-sm text-gray-500">(placeholder for bar chart)</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import Logo from "../../public/logo.png";
import { supabase, Article } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
const Home = () => {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(12);

        if (error) {
          console.error("Supabase error", error);
        } else if (mounted && Array.isArray(data)) {
          setArticles(data as Article[]);
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
  }, []);

  return (
    <div className="">
      <header className="flex justify-between items-center px-8 h-16 bg-white">
        <div className="flex items-center gap-4">
          <Image src={Logo} alt="Logo" width={140} />
          <h1 className="text-lg font-semibold">Notícias Publicadas</h1>
        </div>
        <div>
          <button
          data-testid="criar-noticia"
            onClick={() => router.push("/new-article")}
            className="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700"
          >
            + Criar Nova Noticia
          </button>
        </div>
      </header>

      <main className="mt-6">
        <div className="grid grid-cols-3 gap-6">
          {loading && (
            <div className="col-span-3 text-sm text-gray-500">
              Carregando...
            </div>
          )}

          {!loading && articles.length === 0 && (
            <div className="col-span-3 text-sm text-gray-500">
              Nenhuma notícia encontrada.
            </div>
          )}

          {articles.map((a) => (
            <Link key={a.id} href={`/articles/${a.id}`} data-testid="noticia" className="no-underline">
              <article
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-border"
              >
              <div className="h-40 bg-gray-100 w-full relative">
                {a.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.image_url}
                    alt={a.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    Sem Imagem
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="[&>h1]:text-red-500 [&>h1]:font-semibold [&>h1]:text-2xl">
                  <Markdown remarkPlugins={[remarkGfm]}>{a.title}</Markdown>
                </div>

                <div className="flex items-center justify-between text-sm text-black/70">
                  <div>
                    Publicado em:{" "}
                    {a.created_at
                      ? new Date(a.created_at).toLocaleDateString()
                      : "—"}
                  </div>
                </div>
              </div>
              </article>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;

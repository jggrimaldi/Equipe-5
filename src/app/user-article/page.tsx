import React from "react";
import Image from "next/image";
import Logo from "../../../public/logo.png";
import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';
import { UserTracker } from "@/components/UserTracker";
import { SidebarMenu } from "@/components/SidebarMenu";
import { UOLBar } from "@/components/UOLBar";

// Types
interface Article {
  id: string;
  title: string;
  excerpt?: string | null;
  created_at: string;
  image_url?: string | null;
  views?: number;
  category?: string | null;
  author?: string | null;
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

const DEFAULT_IMAGE = "https://jc.uol.com.br/img/logo.svg";

// Components
const TrendingCard = ({ article, rank }: { article: Article; rank?: number }) => (
  <Link href={`/user-article/${article.id}`} className="group block mb-6 last:mb-0">
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
      <img
        src={article.image_url || DEFAULT_IMAGE}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />

      <div className="absolute top-3 left-3">
        <span className="inline-block px-2 py-1 bg-black/30 backdrop-blur-md border border-white/30 rounded text-[10px] font-bold text-white uppercase tracking-wider">
          {article.category || 'Em Alta'}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        {rank && (
          <div className="text-5xl font-black text-white/10 absolute -top-8 right-2 pointer-events-none">
            {rank}
          </div>
        )}
        <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-red-200 transition-colors drop-shadow-sm">
          {article.title.substring(1).trim()}
        </h3>
        <p className="text-[10px] text-gray-300 flex items-center gap-1">
          {formatDate(article.created_at)}
        </p>
      </div>
    </div>
  </Link>
);

const ArticleCardGrid = ({ article }: { article: Article }) => (
  <Link href={`/user-article/${article.id}`} className="group block h-full">
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <img
          src={article.image_url || DEFAULT_IMAGE}
          alt={article.title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
          {article.category || 'Notícia'}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-xl text-gray-900 group-hover:text-red-600 transition-colors leading-tight mb-3">
          {article.title.substring(1).trim()}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1 leading-relaxed">
          {article.excerpt || "Clique para ler a matéria completa e conferir todos os detalhes..."}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50 mt-auto">
          <span>{formatDate(article.created_at)}</span>
          <span className="flex items-center gap-1 text-red-600 font-medium group-hover:translate-x-1 transition-transform">
            Ler mais →
          </span>
        </div>
      </div>
    </div>
  </Link>
);

const RecommendedCard = ({ article }: { article: Article }) => (
  <Link href={`/user-article/${article.id}`} className="group block mb-6 last:mb-0">
    <div className="flex flex-col gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
      <div className="relative aspect-video w-full flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 shadow-sm">
        <img
          src={article.image_url || DEFAULT_IMAGE}
          alt={article.title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <span className="inline-block px-1.5 py-0.5 bg-black/80 backdrop-blur-sm rounded text-[8px] font-bold text-white uppercase tracking-wider">
            {article.category || 'Recomendado'}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm text-gray-900 group-hover:text-red-600 transition-colors line-clamp-3 leading-snug">
          {article.title.substring(1).trim()}
        </h3>
        <p className="text-[10px] text-gray-400 mt-2">
          {formatDate(article.created_at)}
        </p>
      </div>
    </div>
  </Link>
);

const BottomGridCard = ({ article }: { article: Article }) => (
  <Link href={`/user-article/${article.id}`} className="group block">
    <div className="relative h-64 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <img
        src={article.image_url || DEFAULT_IMAGE}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <span className="inline-block px-2 py-1 bg-red-600 rounded text-[10px] font-bold uppercase tracking-wider mb-2">
          {article.category || 'Geral'}
        </span>
        <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-red-200 transition-colors">
          {article.title.substring(1).trim()}
        </h3>
        <p className="text-xs text-gray-300 line-clamp-1">
          {formatDate(article.created_at)}
        </p>
      </div>
    </div>
  </Link>
);

export default async function UserArticles({ searchParams }: { searchParams: { category?: string } }) {
  const selectedCategory = searchParams?.category;

  // 1. Fetch Trending (Top 3 views last 24h)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  let trendingQuery = supabase
    .from("articles")
    .select("*")
    .gte('created_at', yesterday.toISOString())
    .order("views", { ascending: false })
    .limit(3);

  if (selectedCategory) {
    trendingQuery = trendingQuery.eq('category', selectedCategory);
  }

  let { data: trendingData } = await trendingQuery;
  let trendingArticles = (trendingData as Article[]) || [];

  // Fallback for trending
  if (trendingArticles.length < 3) {
    let fallbackQuery = supabase
      .from("articles")
      .select("*")
      .order("views", { ascending: false })
      .limit(3 - trendingArticles.length);

    if (selectedCategory) {
      fallbackQuery = fallbackQuery.eq('category', selectedCategory);
    }

    const { data: fallbackData } = await fallbackQuery;

    if (fallbackData) {
      // Deduplicate fallback by ID first
      const existingIds = new Set(trendingArticles.map(a => a.id));
      const uniqueFallback = (fallbackData as Article[]).filter(a => !existingIds.has(a.id));
      trendingArticles = [...trendingArticles, ...uniqueFallback];
    }
  }

  // Track used Titles to prevent duplicates (content-based deduplication)
  const usedTitles = new Set<string>();

  // Filter Trending Articles for unique titles and populate usedTitles
  const uniqueTrending: Article[] = [];
  trendingArticles.forEach(article => {
    const normalizedTitle = article.title.trim().toLowerCase();
    if (!usedTitles.has(normalizedTitle)) {
      usedTitles.add(normalizedTitle);
      uniqueTrending.push(article);
    }
  });
  trendingArticles = uniqueTrending;

  // 2. Fetch Main Content
  let mainQuery = supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (selectedCategory) {
    mainQuery = mainQuery.eq('category', selectedCategory);
  }

  const { data: mainData } = await mainQuery;
  let rawMainArticles = (mainData as Article[]) || [];

  // Deduplicate and Filter Main Articles
  const mainArticles: Article[] = [];
  rawMainArticles.forEach(article => {
    const normalizedTitle = article.title.trim().toLowerCase();
    if (!usedTitles.has(normalizedTitle) && mainArticles.length < 20) {
      mainArticles.push(article);
      usedTitles.add(normalizedTitle);
    }
  });

  // Group by category for the grid
  const articlesByCategory: Record<string, Article[]> = {};

  mainArticles.forEach(a => {
    const cat = a.category || 'Outros';
    if (!articlesByCategory[cat]) articlesByCategory[cat] = [];
    if (articlesByCategory[cat].length < 4) {
      articlesByCategory[cat].push(a);
    }
  });

  // 3. Fetch Recommended
  let recommendedQuery = supabase
    .from("articles")
    .select("*")
    .order("views", { ascending: false })
    .limit(20);

  if (selectedCategory) {
    recommendedQuery = recommendedQuery.eq('category', selectedCategory);
  }

  const { data: recommendedData } = await recommendedQuery;
  let rawRecommended = (recommendedData as Article[]) || [];

  const recommendedArticles: Article[] = [];
  rawRecommended.forEach(article => {
    const normalizedTitle = article.title.trim().toLowerCase();
    if (!usedTitles.has(normalizedTitle) && recommendedArticles.length < 5) {
      recommendedArticles.push(article);
      usedTitles.add(normalizedTitle);
    }
  });

  // 4. Fetch Bottom Grid
  let bottomQuery = supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (selectedCategory) {
    bottomQuery = bottomQuery.eq('category', selectedCategory);
  }

  const { data: bottomData } = await bottomQuery;
  let rawBottom = (bottomData as Article[]) || [];

  const bottomArticles: Article[] = [];
  rawBottom.forEach(article => {
    const normalizedTitle = article.title.trim().toLowerCase();
    if (!usedTitles.has(normalizedTitle) && bottomArticles.length < 4) {
      bottomArticles.push(article);
      usedTitles.add(normalizedTitle);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <UserTracker />
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

      <main className="max-w-7xl mx-auto px-6 py-10">
        {selectedCategory && (
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
              {selectedCategory}
            </h1>
            <div className="h-1 w-20 bg-red-600 mt-2"></div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-8 lg:gap-12">

          {/* Main Content Area (Trending + Categories) - 75% */}
          <section className="col-span-12 lg:col-span-9">

            {/* Trending Section */}
            <div className="mb-16">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingArticles.map((article, index) => (
                  <TrendingCard key={article.id} article={article} rank={index + 1} />
                ))}
              </div>
              {trendingArticles.length === 0 && (
                <p className="text-sm text-gray-500 italic">Nenhuma notícia em alta nesta categoria.</p>
              )}
            </div>
            <div className="mb-8 -mt-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center border border-gray-200 shadow-inner">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Publicidade</span>
              <div className="h-48 w-full bg-white mt-4 rounded-lg flex items-center justify-center text-gray-300 text-sm border border-gray-100 shadow-sm">
                Espaço Publicitário
              </div>
            </div>
            {/* Categorized Articles Grid */}
            {Object.entries(articlesByCategory).map(([category, articles]) => (
              <div key={category} className="mb-16 last:mb-0">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-semibold tracking-tight relative">
                    <span className="relative z-10">{category}</span>
                    <span className="absolute bottom-1 left-0 w-full h-3 bg-red-100 -z-0 transform -rotate-1"></span>
                  </h2>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                  {articles.map(article => (
                    <ArticleCardGrid key={article.id} article={article} />
                  ))}
                </div>
              </div>
            ))}

            {mainArticles.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="text-4xl mb-4">📰</div>
                <p className="text-gray-500 font-medium">Nenhuma notícia encontrada.</p>
                <p className="text-xs text-gray-400 mt-2">Tente selecionar outra categoria.</p>
              </div>
            )}
          </section>

          {/* Right Column: Recommended (25%) */}
          <aside className="col-span-12 lg:col-span-3 lg:border-l lg:border-gray-200 lg:pl-8">
            <div className="sticky top-28">
              <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200">
                <h2 className="text-xs font-bold uppercase ">
                  {selectedCategory ? 'Recomendados' : 'Para Você'}
                </h2>
              </div>
              <div className="space-y-4">
                {recommendedArticles.map(article => (
                  <RecommendedCard key={article.id} article={article} />
                ))}
                {recommendedArticles.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Nenhuma recomendação disponível.</p>
                )}
              </div>

              {/* Ad Space */}
              <div className="mt-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center border border-gray-200 shadow-inner">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Publicidade</span>
                <div className="h-48 w-full bg-white mt-4 rounded-lg flex items-center justify-center text-gray-300 text-sm border border-gray-100 shadow-sm">
                  Espaço Publicitário
                </div>
              </div>
            </div>
          </aside>

        </div>

        {/* Bottom Grid Section */}
        {bottomArticles.length > 0 && (
          <section className="mt-20 pt-12 border-t border-gray-200">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Mais Notícias
              </h2>
              <div className="h-px bg-gray-200 flex-1"></div>
              <Link href="#" className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
                Ver todas <span className="text-lg">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bottomArticles.map(article => (
                <BottomGridCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

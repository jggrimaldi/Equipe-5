"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Logo from '../../../../public/logo.png';
import { supabase } from '@/lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, ChevronDown } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface ArticleData {
  id: string;
  title: string;
  content: string;
  author: string | null;
  created_at: string;
  updated_at: string;
  image_url?: string;
  excerpt?: string;
  category?: string;
}

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  visitsByDay: Array<{ date: string; visits: number }>;
  peakHours: Array<{ hour: number; visits: number }>;
  visitsByGeolocation: Array<{
    city: string;
    country: string;
    visits: number;
  }>;
}

interface SectionStatistic {
  sectionTitle: string;
  sectionLevel: string;
  uniqueUsers: number;
  totalViews: number;
  averageViewsPerUser: number;
}

const chartConfig = {
  visits: {
    label: 'Visitas',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [article, setArticle] = React.useState<ArticleData | null>(null);
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
  const [sectionStats, setSectionStats] = React.useState<SectionStatistic[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(true);
  const [sectionStatsLoading, setSectionStatsLoading] = React.useState(true);
  const [showChartsPanel, setShowChartsPanel] = React.useState(true);
  const [showGeolocationPanel, setShowGeolocationPanel] = React.useState(true);
  const [showSectionsPanel, setShowSectionsPanel] = React.useState(true);
  const [showArticle, setShowArticle] = React.useState(true);
  const [showGraphs, setShowGraphs] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
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

  React.useEffect(() => {
    if (!id) return;
    let mounted = true;

    const loadAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const response = await fetch(`/api/analytics/${id}`);
        const data = await response.json();

        if (mounted) {
          setAnalytics(data);
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        if (mounted) setAnalyticsLoading(false);
      }
    };

    loadAnalytics();
    return () => {
      mounted = false;
    };
  }, [id]);

  React.useEffect(() => {
    if (!id) return;
    let mounted = true;

    const loadSectionStats = async () => {
      setSectionStatsLoading(true);
      try {
        const response = await fetch(`/api/section-statistics/${id}`);
        const data = await response.json();

        if (mounted) {
          setSectionStats(data.sections || []);
        }
      } catch (err) {
        console.error('Error loading section statistics:', err);
      } finally {
        if (mounted) setSectionStatsLoading(false);
      }
    };

    loadSectionStats();
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

  const markdown = article.content || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between h-16 px-8 bg-white border-b border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <Image src={Logo} alt="Logo" width={140} />
          <h2 className="text-xl font-semibold">Detalhes da Notícia</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/new-article?id=${article.id}`)}
            className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
          >
            Editar
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8">
        <div className="flex gap-6 flex-1 w-full">
          {/* Article Section */}
          <div className={`${showArticle ? 'flex-1' : 'w-10'} transition-all duration-300`}>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 h-full">
              {!showArticle ? (
                <div className="flex items-center justify-center h-full">
                  <button
                    onClick={() => setShowArticle(!showArticle)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Mostrar artigo"
                  >
                    <Eye size={20} className="text-gray-600" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-lg">Artigo</h3>
                    <button
                      onClick={() => setShowArticle(!showArticle)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Alternar visibilidade do artigo"
                    >
                      <Eye size={20} className="text-gray-600" />
                    </button>
                  </div>

                  {article.image_url && (
                    <img src={article.image_url} alt={article.title} className="w-full h-64 object-cover" />
                  )}

                  <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                    <h1 className="text-2xl font-bold mb-4">{article.title}</h1>

                    <div className="prose max-w-none markdown-body text-gray-700">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {markdown}
                      </ReactMarkdown>
                    </div>

                    {article.excerpt && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-700"><strong>Resumo:</strong> {article.excerpt}</p>
                      </div>
                    )}

                    <div className="mt-6 text-sm text-gray-500 flex items-center justify-between border-t pt-4">
                      <div>Publicado em: {article.created_at ? new Date(article.created_at).toLocaleDateString('pt-BR') : '—'}</div>
                      {article.category && <span className="bg-gray-100 px-3 py-1 rounded text-xs text-gray-600">{article.category}</span>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Analytics Section */}
          <aside className={`${showGraphs ? 'flex-1' : 'w-10'} transition-all duration-300`}>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 h-full flex flex-col">
              {!showGraphs ? (
                <div className="flex items-center justify-center h-full">
                  <button
                    onClick={() => setShowGraphs(!showGraphs)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Mostrar análises"
                  >
                    <Eye size={20} className="text-gray-600" />
                  </button>
                </div>
              ) : (
                <div className="h-full overflow-y-auto flex flex-col">
                  {analyticsLoading ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">Carregando análises...</p>
                    </div>
                  ) : analytics ? (
                    <>
                      {/* Analytics Header */}
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Análises</h3>
                      </div>

                      {/* Charts Panel */}
                      <div className="border-b border-gray-100">
                        <button
                          onClick={() => setShowChartsPanel(!showChartsPanel)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <h4 className="font-medium text-sm">Gráficos</h4>
                          <ChevronDown
                            size={20}
                            className={`transition-transform duration-300 ${showChartsPanel ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {showChartsPanel && (
                          <div className="px-4 pb-4 space-y-4">
                            {/* Summary Card */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                              <h5 className="font-medium mb-3 text-sm">Resumo</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total de Visitas:</span>
                                  <span className="font-bold text-red-600">{analytics.totalVisits}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Visitantes Únicos:</span>
                                  <span className="font-bold text-red-600">{analytics.uniqueVisitors}</span>
                                </div>
                              </div>
                            </div>

                            {/* Peak Hours Chart */}
                            {analytics.peakHours && analytics.peakHours.length > 0 ? (
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm">Horários de Pico</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                    <BarChart data={analytics.peakHours}>
                                      <CartesianGrid vertical={false} />
                                      <XAxis
                                        dataKey="hour"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value: number) => `${String(value).padStart(2, '0')}h`}
                                      />
                                      <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                      />
                                      <Bar
                                        dataKey="visits"
                                        fill="var(--color-visits)"
                                        radius={[8, 8, 0, 0]}
                                      />
                                    </BarChart>
                                  </ChartContainer>
                                </CardContent>
                              </Card>
                            ) : (
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-sm text-gray-500">
                                Nenhuma visita registrada
                              </div>
                            )}

                            {/* Visits by Day Chart */}
                            {analytics.visitsByDay && analytics.visitsByDay.length > 0 ? (
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm">Visitas por Dia</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                    <BarChart data={analytics.visitsByDay}>
                                      <CartesianGrid vertical={false} />
                                      <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value: string) =>
                                          new Date(value).toLocaleDateString('pt-BR', {
                                            month: 'short',
                                            day: 'numeric',
                                          })
                                        }
                                      />
                                      <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                      />
                                      <Bar
                                        dataKey="visits"
                                        fill="var(--color-visits)"
                                        radius={[8, 8, 0, 0]}
                                      />
                                    </BarChart>
                                  </ChartContainer>
                                </CardContent>
                              </Card>
                            ) : (
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-sm text-gray-500">
                                Nenhuma visita registrada
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Geolocation Panel */}
                      <div>
                        <button
                          onClick={() => setShowGeolocationPanel(!showGeolocationPanel)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <h4 className="font-medium text-sm">Localizações</h4>
                          <ChevronDown
                            size={20}
                            className={`transition-transform duration-300 ${showGeolocationPanel ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {showGeolocationPanel && (
                          <div className="px-4 pb-4">
                            {analytics.visitsByGeolocation && analytics.visitsByGeolocation.length > 0 ? (
                              <div className="space-y-2">
                                {analytics.visitsByGeolocation.map((location, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center p-3 rounded hover:bg-gray-50 text-sm border border-gray-100"
                                  >
                                    <span className="text-gray-600">
                                      {location.city}, {location.country}
                                    </span>
                                    <span className="font-semibold text-red-600">{location.visits}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Nenhuma visita registrada</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Sections Panel */}
                      <div>
                        <button
                          onClick={() => setShowSectionsPanel(!showSectionsPanel)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <h4 className="font-medium text-sm">Seções Visualizadas</h4>
                          <ChevronDown
                            size={20}
                            className={`transition-transform duration-300 ${showSectionsPanel ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {showSectionsPanel && (
                          <div className="px-4 pb-4">
                            {sectionStatsLoading ? (
                              <p className="text-sm text-gray-500">Carregando...</p>
                            ) : sectionStats && sectionStats.length > 0 ? (
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {sectionStats.map((section, index) => (
                                  <div
                                    key={index}
                                    className="p-3 rounded hover:bg-gray-50 text-sm border border-gray-100"
                                  >
                                    <div className="flex justify-between items-start mb-1">
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-800 truncate pr-2">{section.sectionTitle}</div>
                                        <div className="text-xs text-gray-500">{section.sectionLevel}</div>
                                      </div>
                                      <div className="flex flex-col items-end text-xs">
                                        <span className="font-semibold text-red-600">{section.uniqueUsers}</span>
                                        <span className="text-gray-500">usuários</span>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-600 mt-1 pt-1 border-t border-gray-100">
                                      <span>Visualizações: {section.totalViews}</span>
                                      <span>Média: {section.averageViewsPerUser.toFixed(1)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Nenhuma seção visualizada ainda</p>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-center flex-1 flex items-center justify-center">
                      <p className="text-sm text-gray-500">Sem dados de análises</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}


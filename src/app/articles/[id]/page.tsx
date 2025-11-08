"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Logo from '../../../../public/logo.png';
import { supabase } from '@/lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TrendingUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { AreaChart, CartesianGrid, XAxis, Bar, BarChart, Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
}

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  visitsByDay: Array<{ date: string; visits: number }>;
  visitsByHour: Array<{ hour: string; visits: number }>;
  peakHours: Array<{ hour: number; visits: number }>;
  visitsByGeolocation: Array<{
    city: string;
    country: string;
    visits: number;
    latitude?: number;
    longitude?: number;
  }>;
}

const countryChartConfig = {
  visits: {
    label: 'Visitas',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

const cityChartConfig = {
  visits: {
    label: 'Visitas',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [article, setArticle] = React.useState<ArticleData | null>(null);
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(true);
  const [showChartsPanel, setShowChartsPanel] = React.useState(true);
  const [showGeolocationPanel, setShowGeolocationPanel] = React.useState(true);
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

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  if (!article) {
    return <div className="p-6">Notícia não encontrada.</div>;
  }

  const markdown = article.content || '';
  const displayTitle = article.title && article.title.length > 0 ? article.title.slice(1).trim() : article.title || '';

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
        <div className="flex flex-1 w-full relative">
          <div className={showArticle ? 'flex-1' : 'w-4'}>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 h-full">
              {!showArticle ? (
                <div className="flex items-start justify-center">
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
            <div className="p-6">
              <div className="prose max-w-none markdown-body text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdown}
                </ReactMarkdown>
              </div>

              <div className="mt-6 text-sm text-gray-400 flex items-center justify-between">
                <div>Publicado em: {article.created_at ? new Date(article.created_at).toLocaleDateString() : '—'}</div>
              </div>
            </div>
              </>
            )}
          </div>
        </div>

        {/* Graphs Section */}
        <aside className={showGraphs ? 'flex-1' : 'w-8'}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 h-full">
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
              <>
                {/* Analytics Summary */}
                {analyticsLoading ? (
                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500">Carregando análises...</p>
                  </div>
                ) : analytics ? (
                  <>
                    {/* Graphs Section Header */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm mb-4">
                      <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-lg">Análises</h3>
                        <button
                          onClick={() => setShowGraphs(!showGraphs)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Alternar visibilidade das análises"
                        >
                          <Eye size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Charts Panel */}
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                <button
                  onClick={() => setShowChartsPanel(!showChartsPanel)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-lg">Gráficos</h3>
                  <ChevronDown className={`chevron-icon ${showChartsPanel ? 'rotated' : ''}`} size={20} />
                </button>

                <div className={`collapse-content ${showChartsPanel ? 'expanded' : 'collapsed'}`}>
                  <div className="px-4 pb-4">
                    {/* Summary Card */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                      <h3 className="font-medium mb-3">Resumo</h3>
                      <div className="space-y-2">
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
              {analytics.peakHours.length > 0 ? (
                <div className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Horários de Pico</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={countryChartConfig}
                        className="h-[200px] w-full"
                      >
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
                </div>
              ) : (
                <div className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Horários de Pico</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">Nenhuma visita registrada</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Visits by Day Chart */}
              {analytics.visitsByDay.length > 0 ? (
                <div className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Visitas por Dia</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={countryChartConfig}
                        className="h-[200px] w-full"
                      >
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
                </div>
              ) : (
                <div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-base font-medium mb-2">Visitas por Dia</p>
                    <p className="text-sm text-gray-500">Nenhuma visita registrada</p>
                  </div>
                </div>
              )}
                  </div>
                </div>
              </div>

              {/* Geolocation Panel */}
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm mt-4">
                <button
                  onClick={() => setShowGeolocationPanel(!showGeolocationPanel)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-lg">Localizações</h3>
                  <ChevronDown className={`chevron-icon ${showGeolocationPanel ? 'rotated' : ''}`} size={20} />
                </button>

                <div className={`collapse-content ${showGeolocationPanel ? 'expanded' : 'collapsed'}`}>
                  <div className="px-4 pb-4">
                    {analytics.visitsByGeolocation.length > 0 ? (
                      <div className="space-y-2">
                        {analytics.visitsByGeolocation.map((location, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 rounded hover:bg-gray-50"
                          >
                            <span className="text-sm text-gray-600">
                              {location.city}, {location.country}
                            </span>
                            <span className="font-semibold text-red-600">
                              {location.visits}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma visita registrada</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Cities Chart */}
              {/* Removed - Top Cities no longer tracked */}
                  </>
                ) : (
                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500">Sem dados de análises</p>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
      </main>
      <style jsx>{`
        .collapse-content {
          overflow: hidden;
          transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
        }

        .collapse-content.expanded {
          max-height: 2000px;
          opacity: 1;
        }

        .collapse-content.collapsed {
          max-height: 0;
          opacity: 0;
        }

        .chevron-icon {
          transition: transform 0.3s ease-in-out;
        }

        .chevron-icon.rotated {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}


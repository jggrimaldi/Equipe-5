import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id;

    if (!articleId) {
      return Response.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Fetch all section views for this article
    const { data: sectionViews, error } = await supabase
      .from('article_sections')
      .select('*')
      .eq('article_id', articleId)
      .order('section_level', { ascending: true })
      .order('view_count', { ascending: false });

    if (error) throw error;

    // Aggregate by section title and level
    const aggregated = new Map<string, { level: string; users: number; totalViews: number }>();

    (sectionViews || []).forEach((view) => {
      const key = `${view.section_level}:${view.section_title}`;
      const current = aggregated.get(key) || {
        level: view.section_level,
        users: 0,
        totalViews: 0,
      };

      aggregated.set(key, {
        ...current,
        users: current.users + 1,
        totalViews: current.totalViews + (view.view_count || 1),
      });
    });

    // Convert to array format
    const statistics = Array.from(aggregated.entries()).map(([key, value]) => {
      const [level, title] = key.split(':');
      return {
        sectionTitle: title,
        sectionLevel: level,
        uniqueUsers: value.users,
        totalViews: value.totalViews,
        averageViewsPerUser: parseFloat((value.totalViews / value.users).toFixed(2)),
      };
    });

    return Response.json({
      articleId,
      totalSections: statistics.length,
      sections: statistics,
    });
  } catch (error) {
    console.error('Error fetching section statistics:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

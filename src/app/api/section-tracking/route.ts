import { supabase } from '@/lib/supabaseClient';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const { articleId, userId, sectionTitle, sectionLevel } = await request.json();

    if (!articleId || !userId || !sectionTitle || !sectionLevel) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if this user has already viewed this specific section
    const { data: existingView, error: queryError } = await supabase
      .from('article_sections')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .eq('section_title', sectionTitle)
      .eq('section_level', sectionLevel)
      .single();

    if (queryError && queryError.code !== 'PGRST116') {
      throw queryError;
    }

    if (existingView) {
      // Update view count instead of creating duplicate
      const { error: updateError } = await supabase
        .from('article_sections')
        .update({
          view_count: (existingView.view_count || 1) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingView.id);

      if (updateError) throw updateError;

      return Response.json({ success: true, action: 'updated' });
    }

    // Insert new section view
    const { error: insertError } = await supabase
      .from('article_sections')
      .insert({
        id: nanoid(),
        article_id: articleId,
        user_id: userId,
        section_title: sectionTitle,
        section_level: sectionLevel,
        view_count: 1,
      });

    if (insertError) throw insertError;

    return Response.json({ success: true, action: 'inserted' });
  } catch (error) {
    console.error('Section tracking error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

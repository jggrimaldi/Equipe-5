import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { articleId } = await req.json();

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Get current views
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('views')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Increment views
    const { data: updatedArticle, error: updateError } = await supabase
      .from('articles')
      .update({ views: article.views + 1 })
      .eq('id', articleId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update views' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, views: updatedArticle.views },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating article views:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

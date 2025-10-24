import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase env vars are missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Article = {
  id: string;
  title: string;
  excerpt?: string | null;
  created_at?: string | null;
  image_url?: string | null;
  views?: number | null;
};

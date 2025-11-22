const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    console.log('Testing fetch with all fields...');
    const { data, error } = await supabase
        .from("articles")
        .select("id, title, excerpt, created_at, image_url, category, views")
        .limit(5);

    if (error) {
        console.error('Error fetching all fields:', error);
    } else {
        console.log('Success fetching all fields. Count:', data.length);
        if (data.length > 0) console.log('Sample:', data[0]);
    }

    console.log('\nTesting fetch with minimal fields...');
    const { data: minimalData, error: minimalError } = await supabase
        .from("articles")
        .select("id, title")
        .limit(5);

    if (minimalError) {
        console.error('Error fetching minimal fields:', minimalError);
    } else {
        console.log('Success fetching minimal fields. Count:', minimalData.length);
    }
}

testFetch();

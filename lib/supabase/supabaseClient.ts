import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl!, supabaseKey!, {
  auth: {
    persistSession: true, // Ensure session persistence
    autoRefreshToken: true,
  },
});
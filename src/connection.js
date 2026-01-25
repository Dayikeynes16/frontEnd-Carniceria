import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

console.log('Supabase URL defined:', !!supabaseUrl);
console.log('Supabase Key defined:', !!supabaseKey);

export const supabase = createClient(supabaseUrl, supabaseKey)

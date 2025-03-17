
// Supabase configuration
const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
};

export default supabaseConfig;

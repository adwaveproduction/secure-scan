
// Simple script to check for environment variables before building
const fs = require('fs');

// Check if environment variables are set
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing environment variables.');
  console.error('Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel project settings.');
  process.exit(1);
}

console.log('Environment variables are set correctly.');
console.log('Building the project...');

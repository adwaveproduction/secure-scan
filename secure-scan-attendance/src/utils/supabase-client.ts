
import { createClient } from '@supabase/supabase-js';

// Get environment variables or use the provided values if environment variables are not set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jtygvomdmdwmlrnqaqbq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eWd2b21kbWR3bWxybnFhcWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MDk4NDUsImV4cCI6MjA1NzA4NTg0NX0.mAX3WnPwTx5-htDPiotQXKynH0O0IX6Owp-0L5YZ3Sk';

// Check if credentials are properly configured
const isSupabaseConfigured = supabaseUrl && supabaseKey && 
  !supabaseUrl.includes('your-project-url') && 
  !supabaseKey.includes('your-anon-key');

// Create a mock client if credentials aren't available
const createMockClient = () => {
  console.warn('⚠️ Using mock Supabase client. Please configure your environment variables.');
  
  return {
    from: (table: string) => ({
      select: (columns?: string) => {
        console.log(`Mock SELECT from ${table}${columns ? ` (${columns})` : ''}`);
        return {
          eq: (column: string, value: any) => {
            console.log(`Mock WHERE ${column} = ${value}`);
            return {
              eq: (column: string, value: any) => {
                console.log(`Mock AND ${column} = ${value}`);
                return {
                  single: async () => ({ 
                    data: null, 
                    error: null 
                  }),
                };
              },
              single: async () => ({ 
                data: null, 
                error: null 
              }),
              maybeSingle: async () => ({
                data: null,
                error: null
              }),
              orderBy: (column: string, options?: any) => {
                console.log(`Mock ORDER BY ${column}`);
                return {
                  async: () => ({ data: [], error: null })
                };
              },
            };
          },
          orderBy: (column: string, options?: any) => {
            console.log(`Mock ORDER BY ${column}`);
            return {
              async: () => ({ data: [], error: null })
            };
          },
        };
      },
      insert: (rows: any[]) => {
        console.log(`Mock INSERT into ${table}:`, rows);
        return {
          select: () => {
            console.log(`Mock RETURNING after INSERT`);
            // Return mock data to simulate successful insert
            return Promise.resolve({ 
              data: rows.map((row, i) => ({ ...row, id: `mock-id-${i}` })), 
              error: null 
            });
          }
        };
      },
      update: (updates: any) => {
        console.log(`Mock UPDATE ${table}:`, updates);
        return {
          eq: (column: string, value: any) => {
            console.log(`Mock WHERE ${column} = ${value} for UPDATE`);
            return Promise.resolve({ error: null });
          }
        };
      },
    }),
  };
};

// Create and export the Supabase client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : createMockClient() as any;

// Helper to check if we're using the mock client
export const isUsingMockClient = !isSupabaseConfigured;

console.log('Supabase client initialized:', isUsingMockClient ? 'MOCK CLIENT' : 'REAL CLIENT');

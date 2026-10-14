// Only this publishable key can reach the browser. Never commit Supabase secret/service-role keys.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ijikaqxgsfsakdtzzgkc.supabase.co';
// Supabase publishable keys are intentionally public and protected by Auth + database RLS.
// Vercel environment variables can override this development default.
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Wj4BSCDJb21JVrpX6VnJnQ__CH4RfbS';

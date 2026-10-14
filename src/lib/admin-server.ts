import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/lib/supabase-public';

type OwnerCheck =
  | { ok: true; db: SupabaseClient; user: User }
  | { ok: false; status: 401 | 403 };

export async function requireOwner(request: Request): Promise<OwnerCheck> {
  const header = request.headers.get('authorization') || '';
  const match = /^Bearer\s+([^\s]+)$/i.exec(header);
  if (!match) return { ok: false, status: 401 };

  // A user-scoped Supabase client: the bearer JWT never receives service-role powers.
  const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: 'Bearer ' + match[1] } },
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: auth, error } = await db.auth.getUser(match[1]);
  if (error || !auth.user) return { ok: false, status: 401 };

  const { data: profile, error: profileError } = await db
    .from('admin_profiles').select('role,enabled').eq('user_id', auth.user.id).maybeSingle();
  if (profileError || !profile || !profile.enabled || profile.role !== 'owner')
    return { ok: false, status: 403 };

  return { ok: true, db, user: auth.user };
}

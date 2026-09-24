import { createClient } from '@supabase/supabase-js';
import type { User } from '../types';

const SUPABASE_URL = 'https://sjefmoliejulcxsaeyfx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qnARnaklKKaeJcaQmtUtsA_vt_RuLw0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Row shape in Supabase ───────────────────────────────────────────────────
interface SupabaseUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  password: string;
  avatar_url: string | null;
  school: string | null;
  school_website: string | null;
  grade: number | null;
  class_id: string | null;
  class_name: string | null;
}

export const toRow = (u: User): SupabaseUser => ({
  id: u.id,
  username: u.username,
  name: u.name,
  email: u.email || '',
  role: u.role,
  password: u.password || '',
  avatar_url: u.avatarUrl || null,
  school: u.school || null,
  school_website: u.schoolWebsite || null,
  grade: u.grade || null,
  class_id: u.classId || null,
  class_name: u.className || null,
});

export const fromRow = (r: SupabaseUser): User => ({
  id: r.id,
  username: r.username,
  name: r.name,
  email: r.email || '',
  role: r.role as User['role'],
  password: r.password,
  avatarUrl: r.avatar_url || undefined,
  school: r.school || undefined,
  schoolWebsite: r.school_website || undefined,
  grade: r.grade || undefined,
  classId: r.class_id || undefined,
  className: r.class_name || undefined,
});

/** Upsert one user to Supabase */
export const sbUpsertUser = async (u: User): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lp_users')
      .upsert(toRow(u), { onConflict: 'id' });
    if (error) {
      console.warn('[supabase] upsert failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[supabase] upsert exception:', err);
    return false;
  }
};

/** Update specific fields for one user */
export const sbUpdateUser = async (id: string, patch: Partial<SupabaseUser>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lp_users')
      .update(patch)
      .eq('id', id);
    if (error) {
      console.warn('[supabase] update failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[supabase] update exception:', err);
    return false;
  }
};

/** Fetch all users from Supabase */
export const sbFetchUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase.from('lp_users').select('*');
    if (error) throw error;
    return (data as SupabaseUser[]).map(fromRow);
  } catch (e: any) {
    console.warn('[supabase] fetch failed:', e?.message || e);
    return [];
  }
};

/** Fetch a single user by username from Supabase */
export const sbFetchUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const clean = username.trim().toLowerCase().replace(/^@/, '');
    const { data, error } = await supabase
      .from('lp_users')
      .select('*')
      .ilike('username', clean)
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return fromRow(data[0] as SupabaseUser);
  } catch {
    return null;
  }
};

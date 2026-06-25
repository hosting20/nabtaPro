import { createClient } from '@/lib/supabase/client';

/* وصول قاعدة البيانات للمشاريع المحفوظة — عبر عميل المتصفح مع RLS */

export async function listProjects() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('id,name,updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function loadProject(id) {
  const supabase = createClient();
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function saveProject({ id, name, data }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('يجب تسجيل الدخول');

  const row = { name, data, user_id: user.id, updated_at: new Date().toISOString() };

  if (id) {
    const { data: r, error } = await supabase.from('projects').update(row).eq('id', id).select().single();
    if (error) throw error;
    return r;
  }
  const { data: r, error } = await supabase.from('projects').insert(row).select().single();
  if (error) throw error;
  return r;
}

export async function deleteProject(id) {
  const supabase = createClient();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

import { createClient } from '@supabase/supabase-js';

/* عميل بصلاحيات الخدمة (service role) — للخادم فقط، يتجاوز RLS.
   يُستخدم في Webhook لتحديث حالة الاشتراك. */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

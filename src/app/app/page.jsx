import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import { FREE_AI_LIMIT, isActivePro } from '@/lib/plan.js';
import AppClient from './AppClient.jsx';

export const dynamic = 'force-dynamic';

export default async function AppPage({ searchParams }) {
  let email = '';
  let isPro = false;
  let freeRemaining = null; // عدد التحاليل المجانية المتبقية لغير المشتركين
  const initialProjectId = searchParams?.project || null;

  if (supabaseConfigured()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email || '';
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_expires, ai_uses')
        .eq('id', user.id)
        .single();
      isPro = isActivePro(profile);
      if (!isPro) {
        freeRemaining = Math.max(0, FREE_AI_LIMIT - ((profile && profile.ai_uses) || 0));
      }
    }
  } else {
    // وضع تطوير بدون Supabase — فعّل كل شيء
    isPro = true;
    email = 'وضع التطوير';
  }

  return (
    <AppClient
      email={email}
      isPro={isPro}
      freeRemaining={freeRemaining}
      initialProjectId={initialProjectId}
    />
  );
}

import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import AppClient from './AppClient.jsx';

export const dynamic = 'force-dynamic';

export default async function AppPage({ searchParams }) {
  let email = '';
  let isPro = false;
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
        .select('subscription_status')
        .eq('id', user.id)
        .single();
      isPro = profile && ['active', 'trialing'].includes(profile.subscription_status);
    }
  } else {
    // وضع تطوير بدون Supabase — فعّل كل شيء
    isPro = true;
    email = 'وضع التطوير';
  }

  return <AppClient email={email} isPro={isPro} initialProjectId={initialProjectId} />;
}

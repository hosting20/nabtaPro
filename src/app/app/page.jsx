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
        .select('subscription_status, subscription_expires')
        .eq('id', user.id)
        .single();
      isPro =
        profile &&
        profile.subscription_status === 'active' &&
        (!profile.subscription_expires || new Date(profile.subscription_expires) > new Date());
    }
  } else {
    // وضع تطوير بدون Supabase — فعّل كل شيء
    isPro = true;
    email = 'وضع التطوير';
  }

  return <AppClient email={email} isPro={isPro} initialProjectId={initialProjectId} />;
}

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* فتح بوابة Stripe لإدارة الاشتراك (ترقية/إلغاء/تحديث البطاقة) */
export async function POST(req) {
  if (!supabaseConfigured() || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'الدفع غير مُعدّ' }, { status: 503 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'لا يوجد اشتراك لإدارته' }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || '';

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/app`,
  });

  return NextResponse.json({ url: session.url });
}

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* إنشاء جلسة Stripe Checkout للاشتراك */
export async function POST(req) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: 'المصادقة غير مُعدّة' }, { status: 503 });
  }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json({ error: 'الدفع غير مُعدّ على الخادم' }, { status: 503 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || '';

  // إيجاد/إنشاء عميل Stripe وربطه بالملف الشخصي
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_id: user.id },
    });
    customerId = customer.id;
    await supabase.from('profiles').upsert({ id: user.id, email: user.email, stripe_customer_id: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/app?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancel`,
    metadata: { supabase_id: user.id },
  });

  return NextResponse.json({ url: session.url });
}

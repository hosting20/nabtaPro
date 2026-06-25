import { NextResponse } from 'next/server';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* خادم وسيط آمن لطلبات Claude — المفتاح يبقى على الخادم ولا يصل المتصفح أبداً */
export async function POST(req) {
  // المصادقة (إن أُعدّت Supabase)
  if (supabaseConfigured()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    // التحقق من الاشتراك الفعّال
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_expires')
      .eq('id', user.id)
      .single();
    const active =
      profile &&
      profile.subscription_status === 'active' &&
      (!profile.subscription_expires || new Date(profile.subscription_expires) > new Date());
    if (!active) {
      return NextResponse.json({ error: 'ميزات الذكاء الاصطناعي تتطلب اشتراك Pro' }, { status: 402 });
    }
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'لم يُضبط مفتاح الذكاء الاصطناعي على الخادم' }, { status: 503 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 });
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: body.model || 'claude-sonnet-4-6',
      max_tokens: body.max_tokens || 1500,
      messages: body.messages || [],
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json({ error: (data.error && data.error.message) || 'خطأ في خدمة الذكاء الاصطناعي' }, { status: res.status });
  }

  return NextResponse.json({ text: data.content?.[0]?.text || '' });
}

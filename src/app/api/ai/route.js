import { NextResponse } from 'next/server';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import { FREE_AI_LIMIT, isActivePro } from '@/lib/plan.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* خادم وسيط آمن لطلبات Claude — المفتاح يبقى على الخادم.
   نموذج freemium: Pro غير محدود، والمجاني حتى FREE_AI_LIMIT طلباً. */
export async function POST(req) {
  let supabase = null;
  let user = null;
  let pro = false;
  let used = 0;

  if (supabaseConfigured()) {
    supabase = createClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    if (!u) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }
    user = u;

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_expires, ai_uses')
      .eq('id', u.id)
      .single();

    pro = isActivePro(profile);
    used = (profile && profile.ai_uses) || 0;

    if (!pro && used >= FREE_AI_LIMIT) {
      return NextResponse.json(
        { error: 'انتهت تحليلاتك المجانية — فعّل Pro للتحليل غير المحدود', code: 'limit' },
        { status: 402 }
      );
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

  // استهلاك رصيد مجاني واحد عند نجاح الطلب لغير المشتركين
  let remaining = null;
  if (supabase && user && !pro) {
    await supabase.from('profiles').update({ ai_uses: used + 1 }).eq('id', user.id);
    remaining = Math.max(0, FREE_AI_LIMIT - (used + 1));
  }

  return NextResponse.json({ text: data.content?.[0]?.text || '', remaining });
}

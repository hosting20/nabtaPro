import { NextResponse } from 'next/server';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import { addInvoice, paylinkConfigured, proPrice } from '@/lib/paylink.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* إنشاء فاتورة PayLink لاشتراك Pro وإرجاع رابط الدفع */
export async function POST(req) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: 'المصادقة غير مُعدّة' }, { status: 503 });
  }
  if (!paylinkConfigured()) {
    return NextResponse.json({ error: 'الدفع (PayLink) غير مُعدّ على الخادم' }, { status: 503 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || '';
  const amount = proPrice();
  const orderNumber = `${user.id}-${Date.now()}`;

  try {
    const invoice = await addInvoice({
      amount,
      clientName: user.email ? user.email.split('@')[0] : 'مستخدم نبتة',
      clientEmail: user.email,
      orderNumber,
      callBackUrl: `${origin}/api/paylink/callback`,
      note: 'اشتراك نبتة Pro الشهري',
      products: [{ title: 'اشتراك نبتة Pro — شهر', price: amount, qty: 1 }],
    });

    const url = invoice.url || invoice.mobileUrl || invoice.qrUrl;
    if (!url) throw new Error('لم يصل رابط الدفع من PayLink');

    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

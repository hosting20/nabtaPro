import { NextResponse } from 'next/server';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import { getInvoice } from '@/lib/paylink.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* عودة المستخدم من صفحة دفع PayLink — نتحقق من الدفع ونفعّل الاشتراك */
export async function GET(req) {
  const { searchParams, origin } = new URL(req.url);
  const transactionNo = searchParams.get('transactionNo') || searchParams.get('TransactionNo');

  const fail = (reason) => NextResponse.redirect(`${origin}/pricing?checkout=failed&reason=${encodeURIComponent(reason || '')}`);

  if (!transactionNo || !supabaseConfigured()) {
    return fail('بيانات غير مكتملة');
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login?next=/pricing`);
  }

  try {
    const invoice = await getInvoice(transactionNo);
    const status = String(invoice.orderStatus || '').toLowerCase();

    // تأكد أن الفاتورة تخصّ هذا المستخدم (orderNumber يبدأ بمعرّفه)
    const belongs = !invoice.orderNumber || String(invoice.orderNumber).startsWith(user.id);

    if (status === 'paid' && belongs) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      await supabase
        .from('profiles')
        .update({ subscription_status: 'active', subscription_expires: expires.toISOString(), updated_at: new Date().toISOString() })
        .eq('id', user.id);
      return NextResponse.redirect(`${origin}/app?checkout=success`);
    }

    return fail('لم يكتمل الدفع');
  } catch (err) {
    return fail(err.message);
  }
}

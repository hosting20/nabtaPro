import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* استقبال أحداث Stripe وتحديث حالة الاشتراك في profiles */
export async function POST(req) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'الدفع غير مُعدّ' }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers.get('stripe-signature');
  const payload = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `توقيع غير صالح: ${err.message}` }, { status: 400 });
  }

  const admin = createAdminClient();

  const updateByCustomer = async (customerId, status, plan) => {
    if (!customerId) return;
    await admin
      .from('profiles')
      .update({ subscription_status: status, plan: plan || null, updated_at: new Date().toISOString() })
      .eq('stripe_customer_id', customerId);
  };

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object;
        if (s.subscription) {
          const sub = await stripe.subscriptions.retrieve(s.subscription);
          await updateByCustomer(s.customer, sub.status, sub.items.data[0]?.price?.id);
        } else {
          await updateByCustomer(s.customer, 'active');
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        await updateByCustomer(sub.customer, sub.status, sub.items.data[0]?.price?.id);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await updateByCustomer(sub.customer, 'canceled');
        break;
      }
      default:
        break;
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

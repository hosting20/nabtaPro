# دليل النشر والربط بحساباتك — نبتة

هذا الدليل يربط منصّة نبتة بحساباتك الخاصة (Supabase + Anthropic + Stripe) عبر
**متغيّرات البيئة في Vercel**. المنصّة منشورة بالفعل، وما تبقّى هو إدخال مفاتيحك.

> رسائل مثل «المصادقة غير مُعدّة» أو «لم تُضبط بيئة Supabase» تختفي تلقائياً بمجرّد
> ضبط هذه المتغيّرات وإعادة النشر.

---

## نظرة سريعة على المطلوب

| الخدمة | لماذا | التكلفة |
| :--- | :--- | :--- |
| **Supabase** | تسجيل الدخول + حفظ المشاريع | مجاني للبداية |
| **Anthropic** | التحليل الحقيقي بالذكاء الاصطناعي | حسب الاستخدام |
| **Stripe** | الاشتراكات المدفوعة (Pro) | عمولة على المبيعات فقط |

---

## 1) Supabase (تسجيل الدخول + قاعدة البيانات)

1. أنشئ حساباً ومشروعاً على <https://supabase.com> (اختر اسماً وكلمة مرور لقاعدة البيانات).
2. من القائمة الجانبية: **SQL Editor → New query**، الصق محتوى ملف
   [`supabase/schema.sql`](./supabase/schema.sql) كاملاً ثم **Run**. (يُنشئ جدولَي
   `profiles` و`projects` مع سياسات الأمان.)
3. من **Project Settings → API** انسخ:
   - `Project URL` ← المتغيّر `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` ← المتغيّر `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (سرّي) ← المتغيّر `SUPABASE_SERVICE_ROLE_KEY`
4. **تفعيل تسجيل الدخول:**
   - **Authentication → Providers → Email**: فعّله (يكفي للبداية).
   - **Google (اختياري):** فعّل Google وأضف Client ID/Secret من
     <https://console.cloud.google.com> (OAuth consent + Credentials).
5. **Authentication → URL Configuration → Redirect URLs**، أضف:
   ```
   https://نطاقك.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
   (استبدل «نطاقك» برابط مشروعك في Vercel، مثل `nabtah-alpha.vercel.app`.)

> **الأسهل:** في Vercel → مشروعك → **Integrations** ثبّت تكامل **Supabase**،
> وسيضبط متغيّرات Supabase تلقائياً نيابةً عنك.

---

## 2) Anthropic (الذكاء الاصطناعي)

1. أنشئ حساباً على <https://console.anthropic.com> وأضف رصيداً (Billing).
2. **API Keys → Create Key**، انسخ المفتاح ← المتغيّر `ANTHROPIC_API_KEY`.

> هذا المفتاح يُستخدم على الخادم فقط ولا يظهر للمستخدمين إطلاقاً.

---

## 3) Stripe (الاشتراكات)

1. أنشئ حساباً على <https://stripe.com>.
2. **Products → Add product**: اسم «Pro»، سعر **متكرر شهري** (مثلاً 49 ر.س)،
   انسخ **Price ID** (يبدأ بـ `price_...`) ← المتغيّر `STRIPE_PRICE_ID`.
3. **Developers → API keys**: انسخ **Secret key** (`sk_...`) ← `STRIPE_SECRET_KEY`.
4. **Developers → Webhooks → Add endpoint**:
   - العنوان: `https://نطاقك.vercel.app/api/stripe/webhook`
   - الأحداث: `checkout.session.completed`، `customer.subscription.created`،
     `customer.subscription.updated`، `customer.subscription.deleted`
   - انسخ **Signing secret** (`whsec_...`) ← `STRIPE_WEBHOOK_SECRET`

---

## 4) إدخال المتغيّرات في Vercel

في **Vercel → مشروع nabtah → Settings → Environment Variables**، أضف القيم التالية
(لبيئة Production و Preview):

```
NEXT_PUBLIC_SITE_URL=https://نطاقك.vercel.app
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_PRICE_ID=...
STRIPE_WEBHOOK_SECRET=...
```

ثم **Deployments → آخر نشر → ⋯ → Redeploy**.

---

## 5) التحقق

- افتح `/signup` وأنشئ حساباً (إن فعّلت تأكيد البريد، أكّده من بريدك).
- ادخل `/app` وجرّب «حلّل فكرتي» — يجب أن يعمل التحليل بالذكاء الاصطناعي.
- من `/pricing` جرّب «اشترك في Pro» (استخدم بطاقة اختبار Stripe
  `4242 4242 4242 4242` في وضع الاختبار).

> **ترتيب مقترح:** ابدأ بـ Supabase (يُفعّل الدخول)، ثم Anthropic (الذكاء
> الاصطناعي)، وأخيراً Stripe (الاشتراكات). كل خطوة تعمل بمعزل عن الأخرى.

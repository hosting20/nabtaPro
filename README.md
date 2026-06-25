# نبتة — مستشار الأعمال الذكي (SaaS)

منصّة **SaaS** عربية تحوّل فكرة المشروع إلى تحليل جدوى متكامل بالذكاء الاصطناعي:
معالج من 5 مراحل، مؤشر نمو حيّ، تقرير جدوى (SWOT، حجم السوق، المنافسون، خطة البدء)،
لوحة متابعة (مهام · خطة زمنية · توقعات مالية تفاعلية)، وباني صفحة هبوط مع اختبار طلب.

مبنيّة على **Next.js (App Router) + Supabase + Stripe**.

## المزايا التقنية (SaaS)

- 🔐 **مصادقة كاملة** عبر Supabase: بريد/كلمة مرور + Google (OAuth).
- 🛡️ **خادم وسيط آمن للذكاء الاصطناعي** (`/api/ai`): مفتاح Anthropic يبقى على
  الخادم ولا يصل المتصفح إطلاقاً، محميّ بالمصادقة والاشتراك.
- 💳 **اشتراكات Stripe**: خطة مجانية + Pro، مع Checkout وWebhook لتحديث الحالة.
- 🚪 **حماية المسارات** عبر middleware (التطبيق يتطلب تسجيل دخول).
- 💾 **حفظ المشاريع** لكل مستخدم في قاعدة البيانات (حفظ/فتح/حذف) محميّة بـ RLS.
- ⚙ **إدارة الاشتراك** عبر Stripe Customer Portal (ترقية/إلغاء/تحديث البطاقة).
- صفحة هبوط تسويقية، صفحة أسعار، وصفحات دخول/تسجيل.

## التشغيل محلياً

```bash
npm install
cp .env.example .env.local   # ثم املأ القيم
npm run dev                  # http://localhost:3000
```

> يتطلب Node.js 18.18+ وحساب Supabase وحساب Stripe (للاشتراكات).

## الإعداد خطوة بخطوة

### 1) Supabase
1. أنشئ مشروعاً على <https://supabase.com>.
2. نفّذ `supabase/schema.sql` في **SQL Editor** (يُنشئ جدول `profiles` والـ trigger).
3. من **Project Settings → API** انسخ: `NEXT_PUBLIC_SUPABASE_URL`،
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`، و`SUPABASE_SERVICE_ROLE_KEY`.
4. لتفعيل Google: **Authentication → Providers → Google** وأضف عميل OAuth،
   ثم في **URL Configuration** أضف `http://localhost:3000/auth/callback`
   (ورابط الإنتاج) إلى Redirect URLs.

### 2) Anthropic
- ضع مفتاحك في `ANTHROPIC_API_KEY` (خادم فقط). احصل عليه من
  <https://console.anthropic.com>.

### 3) Stripe
1. أنشئ منتج «Pro» بسعر شهري متكرر، وانسخ **Price ID** إلى `STRIPE_PRICE_ID`.
2. انسخ `STRIPE_SECRET_KEY`.
3. أنشئ Webhook يشير إلى `https://<domain>/api/stripe/webhook` بالأحداث:
   `checkout.session.completed`، `customer.subscription.*`، وانسخ السرّ إلى
   `STRIPE_WEBHOOK_SECRET`. محلياً استخدم: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

> بدون ضبط Supabase يعمل المشروع في **وضع تطوير** (كل المزايا مفعّلة بلا تسجيل
> دخول، والذكاء الاصطناعي يعمل إن ضُبط `ANTHROPIC_API_KEY`).

## بنية المشروع

```
nabtaPro/
├── next.config.mjs · jsconfig.json · package.json
├── .env.example
├── supabase/schema.sql          # جداول وسياسات قاعدة البيانات
└── src/
    ├── middleware.js            # تحديث الجلسة + حماية /app
    ├── App.jsx                  # تطبيق نبتة (مكوّن عميل)
    ├── lib/supabase/            # عملاء Supabase (client/server/admin)
    ├── app/
    │   ├── layout.jsx · globals.css
    │   ├── page.jsx             # الصفحة التسويقية
    │   ├── login · signup       # المصادقة
    │   ├── pricing              # الأسعار + Stripe Checkout
    │   ├── app/                 # التطبيق المحمي (page + AppClient)
    │   ├── auth/callback        # تبادل رمز OAuth بجلسة
    │   └── api/
    │       ├── ai               # الخادم الوسيط لـ Claude (آمن)
    │       └── stripe/          # checkout + portal + webhook
    ├── lib/projects.js          # حفظ/فتح/حذف المشاريع (RLS)
    ├── components/              # واجهة التطبيق (Wizard, Report, Dashboard, ProjectsBar …)
    ├── data/steps.js · utils/scoring.js
    └── api/claude.js            # عميل يستدعي /api/ai
```

## الخطط

| | مجاني | Pro |
|---|---|---|
| معالج الفكرة ولوحة المتابعة | ✓ | ✓ |
| التحليل بالذكاء الاصطناعي | تجريبي | حقيقي ✦ |
| مرشد نبتة وتوليد صفحة الهبوط | — | ✓ |

> المستخدم غير المشترك يعمل لديه التطبيق ببيانات تجريبية؛ الاشتراك في Pro يفعّل
> طلبات Claude الحقيقية عبر الخادم الوسيط.

# دليل النشر والربط بحساباتك — نبتة

هذا الدليل يربط منصّة نبتة بحساباتك الخاصة (Supabase + Anthropic + PayLink) عبر
**متغيّرات البيئة في Vercel**. المنصّة منشورة بالفعل، وما تبقّى هو إدخال مفاتيحك.

> رسائل مثل «المصادقة غير مُعدّة» أو «لم تُضبط بيئة Supabase» تختفي تلقائياً بمجرّد
> ضبط هذه المتغيّرات وإعادة النشر.

---

## نظرة سريعة على المطلوب

| الخدمة | لماذا | التكلفة |
| :--- | :--- | :--- |
| **Supabase** | تسجيل الدخول + حفظ المشاريع | مجاني للبداية |
| **Anthropic** | التحليل الحقيقي بالذكاء الاصطناعي | حسب الاستخدام |
| **PayLink** | الاشتراكات المدفوعة (Pro) — بوابة سعودية | عمولة على المبيعات فقط |

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

## 3) PayLink (الدفع — بوابة سعودية)

PayLink بوابة دفع سعودية تدعم **مدى وVisa وMastercard وApple Pay**، وتعمل بنظام
الفواتير. في نبتة، اشتراك Pro = دفعة شهرية تُفعّل المزايا لمدة 30 يوماً.

1. سجّل كتاجر على <https://paylink.sa> وأكمل التفعيل.
2. من لوحة التاجر: **الإعدادات → بيانات API (API Credentials)** انسخ:
   - `API ID` ← المتغيّر `PAYLINK_API_ID`
   - `Secret Key` ← المتغيّر `PAYLINK_SECRET_KEY`
3. اضبط البيئة `PAYLINK_BASE_URL`:
   - للتجربة: `https://restpilot.paylink.sa` (مع بيانات الاختبار العامة:
     `APP_ID_1123453311` / `0662abb5-13c7-38ab-cd12-236e58f43766`)
   - للإنتاج: `https://restapi.paylink.sa` (مع بياناتك الحقيقية)
4. حدّد سعر الاشتراك الشهري عبر `PRO_PRICE` (افتراضي 49 ر.س، الأدنى 5).

> رابط العودة بعد الدفع يُضبط تلقائياً إلى `/api/paylink/callback`، حيث يتحقّق
> النظام من حالة الفاتورة ويفعّل اشتراكك. لا حاجة لضبط Webhook يدوياً.

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
PAYLINK_API_ID=...
PAYLINK_SECRET_KEY=...
PAYLINK_BASE_URL=https://restapi.paylink.sa
PRO_PRICE=49
```

ثم **Deployments → آخر نشر → ⋯ → Redeploy**.

---

## 5) التحقق

- افتح `/signup` وأنشئ حساباً (إن فعّلت تأكيد البريد، أكّده من بريدك).
- ادخل `/app` وجرّب «حلّل فكرتي» — يجب أن يعمل التحليل بالذكاء الاصطناعي.
- من `/pricing` جرّب «اشترك في Pro» (في بيئة الاختبار `restpilot` استخدم بطاقات
  اختبار PayLink، وستُحوّل لصفحة دفع PayLink ثم تعود مفعّلاً).

> **ترتيب مقترح:** ابدأ بـ Supabase (يُفعّل الدخول)، ثم Anthropic (الذكاء
> الاصطناعي)، وأخيراً PayLink (الاشتراكات). كل خطوة تعمل بمعزل عن الأخرى.

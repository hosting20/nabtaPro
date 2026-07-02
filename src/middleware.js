import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

/* يعمل فقط على المسارات التي تحتاج مصادقة (انظر matcher بالأسفل)
   حتى لا تدفع بقية الصفحات كلفة استعلام الجلسة في كل طلب. */
export async function middleware(request) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // إن لم تُضبط بيئة Supabase، نمرّر الطلب دون مصادقة (وضع تطوير)
  if (!url || !anon) return response;

  const path = request.nextUrl.pathname;

  // اختصار سريع: لا توجد كوكيز Supabase إطلاقاً = زائر غير مسجّل،
  // فلا داعي لرحلة شبكة للتحقق من الجلسة.
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith('sb-'));
  if (!hasAuthCookie) {
    if (path.startsWith('/app')) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('next', path);
      return NextResponse.redirect(redirectUrl);
    }
    return response; // صفحات الدخول تُعرض مباشرة
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // حماية مسار التطبيق
  if (!user && path.startsWith('/app')) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', path);
    return NextResponse.redirect(redirectUrl);
  }

  // المستخدم المسجّل لا يحتاج صفحات الدخول
  if (user && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  return response;
}

export const config = {
  // المسارات المحمية + صفحات الدخول فقط — الصفحات العامة لا تمرّ بالمصادقة
  matcher: ['/app/:path*', '/login', '/signup'],
};

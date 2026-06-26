import { supabaseConfigured, createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const FEATURES = [
  { icon: '🧭', title: 'معالج من 5 مراحل', text: 'المشكلة، السوق، الحل، الإيرادات، الإطلاق — بأسئلة موجّهة ومؤشر نمو حيّ.' },
  { icon: '✦', title: 'تحليل بالذكاء الاصطناعي', text: 'تقرير جدوى متكامل: SWOT، حجم السوق، المنافسون، وخطة بدء عملية.' },
  { icon: '📊', title: 'لوحة متابعة', text: 'حوّل الخطة إلى مهام، وتابع التقدّم والخطة الزمنية والتوقعات المالية.' },
  { icon: '🛬', title: 'صفحة هبوط واختبار طلب', text: 'ولّد صفحة هبوط بالذكاء الاصطناعي واختبر الطلب الحقيقي قبل البناء.' },
];

export default async function Home() {
  let loggedIn = false;
  if (supabaseConfigured()) {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    loggedIn = Boolean(data?.user);
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* شريط علوي */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px', maxWidth: 1100, margin: '0 auto' }}>
        <nav style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {loggedIn ? (
            <a href="/app" style={navBtn('var(--g700)', '#fff', 'none')}>ابدأ مجاناً ←</a>
          ) : (
            <>
              <a href="/login" style={navBtn('#fff', 'var(--soft)', '1.5px solid var(--line)')}>دخول</a>
              <a href="/signup" style={navBtn('var(--g700)', '#fff', 'none')}>ابدأ مجاناً</a>
            </>
          )}
          <a href="/pricing" style={navBtn('#fff', 'var(--g700)', '1.5px solid var(--g100)')}>الأسعار</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'row-reverse' }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(150deg,var(--g500),var(--g700))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🌱</div>
          <div style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--ink)' }}>نبتة</div>
        </div>
      </header>

      {/* البطل */}
      <section style={{ textAlign: 'center', padding: '60px 24px 50px', maxWidth: 760, margin: '0 auto' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--g700)', color: '#eafaef', fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 999, marginBottom: 22 }}>✦ مستشار الأعمال الذكي</span>
        <h1 style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, fontSize: 44, lineHeight: 1.3, color: 'var(--ink)', margin: '0 0 18px' }}>ازرع فكرتك، تحقّق منها، واجعلها تُثمر</h1>
        <p style={{ fontSize: 17, lineHeight: 1.9, color: 'var(--soft)', margin: '0 0 30px' }}>منصّة عربية تحوّل فكرتك إلى تحليل جدوى متكامل بالذكاء الاصطناعي — من المشكلة حتى خطة الإطلاق واختبار الطلب الحقيقي.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={loggedIn ? '/app' : '/signup'} style={{ ...navBtn('var(--g700)', '#fff', 'none'), padding: '15px 32px', fontSize: 16, boxShadow: '0 10px 24px -10px rgba(35,107,68,.7)' }}>ابدأ مجاناً الآن ←</a>
          <a href="/pricing" style={{ ...navBtn('#fff', 'var(--g700)', '1.5px solid var(--g100)'), padding: '15px 32px', fontSize: 16 }}>شاهد الأسعار</a>
        </div>
      </section>

      {/* المزايا */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 20, padding: 26, textAlign: 'right', boxShadow: '0 10px 30px -24px rgba(20,63,42,.35)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--g50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16, marginRight: 'auto' }}>{f.icon}</div>
              <h3 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: 'var(--soft)' }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '30px', color: 'var(--soft)', fontSize: 13, borderTop: '1px solid var(--line)' }}>
        نبتة © {new Date().getFullYear()} — مستشار الأعمال الذكي
      </footer>
    </div>
  );
}

function navBtn(bg, color, border) {
  return { textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: bg, color, border, fontWeight: 700, fontSize: 14, borderRadius: 12, padding: '10px 18px' };
}

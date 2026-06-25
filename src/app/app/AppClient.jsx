'use client';
import { useRouter } from 'next/navigation';
import App from '@/App.jsx';
import { createClient, supabaseConfigured } from '@/lib/supabase/client';

export default function AppClient({ email, isPro, initialProjectId }) {
  const router = useRouter();

  const signOut = async () => {
    if (supabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  const renewSubscription = async () => {
    try {
      const res = await fetch('/api/paylink/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'تعذّر بدء الدفع');
      window.location.href = data.url;
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      {/* شريط علوي */}
      <div className="nb-noprint" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '12px 22px', background: '#fff', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={signOut} style={{ background: '#fff', color: 'var(--soft)', fontWeight: 600, fontSize: 13, border: '1.5px solid var(--line)', borderRadius: 10, padding: '8px 14px' }}>تسجيل الخروج</button>
          {isPro ? (
            <button onClick={renewSubscription} style={{ background: '#fff', color: 'var(--g700)', fontWeight: 700, fontSize: 13, border: '1.5px solid var(--g100)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer' }}>↻ تجديد الاشتراك</button>
          ) : (
            <a href="/pricing" style={{ textDecoration: 'none', background: 'var(--g700)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 10, padding: '9px 16px' }}>↗ ترقية إلى Pro</a>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexDirection: 'row-reverse' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--soft)', flexDirection: 'row-reverse' }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(150deg,var(--g500),var(--g700))', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
              {(email || '؟').trim().charAt(0).toUpperCase()}
            </span>
            <span style={{ direction: 'ltr' }}>{email}</span>
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: isPro ? 'var(--g700)' : '#b06a1f', background: isPro ? 'var(--g50)' : '#fbf3e8', padding: '5px 12px', borderRadius: 999 }}>
            {isPro ? 'Pro' : 'مجاني'}
          </span>
        </div>
      </div>

      {/* شريط ترقية عند عدم الاشتراك */}
      {!isPro && (
        <div className="nb-noprint" style={{ background: 'linear-gradient(90deg,var(--g50),#fff)', borderBottom: '1px solid var(--g100)', padding: '10px 22px', textAlign: 'center', fontSize: 13.5, color: 'var(--g700)' }}>
          أنت على الخطة المجانية — ميزات الذكاء الاصطناعي (التحليل والنصائح والتوليد) تعمل ببيانات تجريبية.{' '}
          <a href="/pricing" style={{ color: 'var(--g700)', fontWeight: 700 }}>فعّل Pro للتحليل الحقيقي ✦</a>
        </div>
      )}

      <App aiEnabled={isPro} canSave={supabaseConfigured()} initialProjectId={initialProjectId} />
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';

const FREE = ['معالج الفكرة بالكامل (5 مراحل)', 'مؤشر نمو الفكرة الحيّ', 'لوحة المتابعة والمهام', 'تحليل تجريبي (بدون AI)'];
const PRO = ['كل مزايا الخطة المجانية', 'تحليل جدوى حقيقي بالذكاء الاصطناعي', 'مرشد نبتة الذكي (نصائح فورية)', 'توليد صفحة الهبوط بالـAI', 'تقارير غير محدودة'];

export default function PricingClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'failed') {
      setError('لم يكتمل الدفع' + (params.get('reason') ? ' — ' + params.get('reason') : '') + '. حاول مرة أخرى.');
    }
  }, []);

  const subscribe = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/paylink/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'تعذّر بدء الدفع');
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const check = (txt, on) => (
    <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: 'row-reverse', textAlign: 'right', marginBottom: 10 }}>
      <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: on ? 'var(--g600)' : 'var(--g100)', color: '#fff', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
      <span style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6 }}>{txt}</span>
    </li>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <a href="/" style={{ textDecoration: 'none', fontSize: 13, color: 'var(--soft)' }}>→ العودة للرئيسية</a>
          <h1 style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, fontSize: 34, color: 'var(--ink)', margin: '12px 0 8px' }}>اختر خطتك</h1>
          <p style={{ fontSize: 15, color: 'var(--soft)' }}>ابدأ مجاناً، وفعّل الذكاء الاصطناعي عند الحاجة.</p>
        </div>

        {error && <div style={{ maxWidth: 420, margin: '0 auto 20px', background: '#fbeeee', color: '#b03f3f', fontSize: 13.5, borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 22 }}>
          {/* مجاني */}
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 22, padding: 30 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--ink)', textAlign: 'right' }}>المجانية</div>
            <div style={{ textAlign: 'right', margin: '12px 0 20px' }}>
              <span style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, fontSize: 38, color: 'var(--ink)' }}>0</span>
              <span style={{ fontSize: 14, color: 'var(--soft)' }}> ريال / شهر</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>{FREE.map((f, i) => <span key={i}>{check(f, true)}</span>)}</ul>
            <a href="/signup" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', background: '#fff', color: 'var(--g700)', fontWeight: 700, fontSize: 15, border: '1.5px solid var(--g100)', borderRadius: 13, padding: 13 }}>ابدأ مجاناً</a>
          </div>

          {/* Pro */}
          <div style={{ background: 'linear-gradient(160deg,var(--g700),var(--g900))', borderRadius: 22, padding: 30, color: '#eafaef', position: 'relative', boxShadow: '0 20px 50px -20px rgba(35,107,68,.6)' }}>
            <span style={{ position: 'absolute', top: 20, left: 20, background: 'var(--amberbg)', color: '#9a6320', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 999 }}>الأكثر قيمة</span>
            <div style={{ fontWeight: 700, fontSize: 18, textAlign: 'right' }}>Pro</div>
            <div style={{ textAlign: 'right', margin: '12px 0 20px' }}>
              <span style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, fontSize: 38 }}>49</span>
              <span style={{ fontSize: 14, opacity: 0.85 }}> ريال / شهر</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
              {PRO.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: 'row-reverse', textAlign: 'right', marginBottom: 10 }}>
                  <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: '#eafaef', color: 'var(--g700)', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 14, lineHeight: 1.6 }}>{f}</span>
                </li>
              ))}
            </ul>
            <button onClick={subscribe} disabled={loading} style={{ width: '100%', background: '#fff', color: 'var(--g700)', fontWeight: 800, fontSize: 15, border: 'none', borderRadius: 13, padding: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '… جارٍ التحويل للدفع' : 'اشترك في Pro ✦'}
            </button>
            <div style={{ textAlign: 'center', fontSize: 11.5, opacity: 0.8, marginTop: 10 }}>دفع آمن عبر PayLink — مدى · Visa · Mastercard · Apple Pay</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';

/* نافذة إدخال مفتاح Anthropic API */
export default function KeyModal({ onSave, onSkip }) {
  const inputRef = useRef(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  const save = () => {
    const v = (value || '').trim();
    onSave(v);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,63,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '36px 32px', maxWidth: 460, width: '90%', textAlign: 'right', boxShadow: '0 24px 60px -12px rgba(20,63,42,.4)', animation: 'nb-rise .3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexDirection: 'row-reverse', justifyContent: 'flex-end' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(150deg,var(--g500),var(--g700))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🌱</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--ink)' }}>مرحباً بك في نبتة</div>
            <div style={{ fontSize: 13, color: 'var(--soft)', marginTop: 3 }}>أدخل مفتاح Anthropic API لتفعيل الذكاء الاصطناعي</div>
          </div>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--soft)', lineHeight: 1.8, marginBottom: 20 }}>
          للحصول على تحليل حقيقي بالذكاء الاصطناعي، أدخل مفتاحك من{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--g700)' }}>
            console.anthropic.com
          </a>
          . يُخزَّن المفتاح في المتصفح فقط ولا يُرسَل لأي خادم خارجي.
        </p>
        <input
          ref={inputRef}
          type="password"
          placeholder="sk-ant-api03-…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          style={{ width: '100%', textAlign: 'left', direction: 'ltr', fontSize: 14, color: 'var(--ink)', background: 'var(--field)', border: '1.5px solid var(--line)', borderRadius: 14, padding: '13px 16px', outline: 'none', marginBottom: 16 }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={save} style={{ flex: 1, background: 'var(--g700)', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 13, padding: 13, boxShadow: '0 8px 18px -8px rgba(35,107,68,.7)' }}>
            حفظ وابدأ ✦
          </button>
          <button onClick={onSkip} style={{ background: '#fff', color: 'var(--soft)', fontWeight: 600, fontSize: 14, border: '1.5px solid var(--line)', borderRadius: 13, padding: '13px 16px' }}>
            بدون AI
          </button>
        </div>
      </div>
    </div>
  );
}

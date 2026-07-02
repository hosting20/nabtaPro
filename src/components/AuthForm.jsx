'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, supabaseConfigured } from '@/lib/supabase/client';

/* نموذج المصادقة المشترك — تسجيل دخول / إنشاء حساب */
export default function AuthForm({ mode }) {
  const isSignup = mode === 'signup';
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const configured = supabaseConfigured();

  const next = () => {
    if (typeof window === 'undefined') return '/app';
    return new URLSearchParams(window.location.search).get('next') || '/app';
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (!configured) {
      setError('لم تُضبط بيئة Supabase بعد. راجع ملف .env.example.');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + '/auth/callback' },
        });
        if (error) throw error;
        setMsg('تم إنشاء الحساب! تحقّق من بريدك لتأكيد الحساب ثم سجّل الدخول.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next());
        router.refresh();
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ، حاول مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    if (googleLoading) return;
    setError('');
    if (!configured) {
      setError('لم تُضبط بيئة Supabase بعد. راجع ملف .env.example.');
      return;
    }
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback?next=' + encodeURIComponent(next()) },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // عند النجاح يستمر المؤشر حتى إعادة التوجيه إلى Google
  };

  const inputStyle = { width: '100%', textAlign: 'left', direction: 'ltr', fontSize: 14.5, color: 'var(--ink)', background: 'var(--field)', border: '1.5px solid var(--line)', borderRadius: 12, padding: '13px 15px', outline: 'none', marginBottom: 14 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 24, padding: '38px 34px', maxWidth: 420, width: '100%', boxShadow: '0 24px 60px -24px rgba(20,63,42,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexDirection: 'row-reverse', justifyContent: 'flex-end' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(150deg,var(--g500),var(--g700))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🌱</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--ink)' }}>{isSignup ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</div>
            <div style={{ fontSize: 13, color: 'var(--soft)', marginTop: 3 }}>منصّة نبتة لتحليل الأفكار</div>
          </div>
        </div>

        <button onClick={handleGoogle} disabled={googleLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#fff', color: 'var(--ink)', fontWeight: 700, fontSize: 14.5, border: '1.5px solid var(--line)', borderRadius: 12, padding: '12px', marginBottom: 18, opacity: googleLoading ? 0.7 : 1, cursor: googleLoading ? 'wait' : 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.33A9 9 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.02-2.33Z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z"/></svg>
          {googleLoading ? '… جارٍ التحويل إلى Google' : 'المتابعة عبر Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 18px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          <span style={{ fontSize: 12, color: 'var(--soft)' }}>أو بالبريد</span>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>

        <form onSubmit={handleEmail}>
          <input type="email" required placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" required minLength={6} placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          {error && <div style={{ background: '#fbeeee', color: '#b03f3f', fontSize: 13, borderRadius: 10, padding: '10px 12px', marginBottom: 12, textAlign: 'right' }}>{error}</div>}
          {msg && <div style={{ background: 'var(--g50)', color: 'var(--g700)', fontSize: 13, borderRadius: 10, padding: '10px 12px', marginBottom: 12, textAlign: 'right' }}>{msg}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--g700)', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 13, padding: 14, opacity: loading ? 0.7 : 1, boxShadow: '0 8px 18px -8px rgba(35,107,68,.7)' }}>
            {loading ? '…' : isSignup ? 'إنشاء الحساب' : 'دخول'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--soft)', marginTop: 18 }}>
          {isSignup ? (
            <>لديك حساب؟ <a href="/login" style={{ color: 'var(--g700)', fontWeight: 700 }}>سجّل الدخول</a></>
          ) : (
            <>لا تملك حساباً؟ <a href="/signup" style={{ color: 'var(--g700)', fontWeight: 700 }}>أنشئ حساباً</a></>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listProjects, deleteProject } from '@/lib/projects.js';
import { overallScore, stageFor } from '@/utils/scoring.js';

/* صفحة «مشاريعي» — شبكة بطاقات لكل المشاريع المحفوظة */
export default function ProjectsGrid() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = () => {
    setLoading(true);
    listProjects()
      .then(setProjects)
      .catch((e) => setError(e.message || 'تعذّر تحميل المشاريع'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const open = (id) => router.push('/app?project=' + id);

  const remove = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteProject(id);
      refresh();
    } catch {
      setError('تعذّر الحذف');
    }
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '30px 28px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 26 }}>
        <a href="/app" style={{ textDecoration: 'none', background: 'var(--g700)', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 12, padding: '11px 18px' }}>＋ فكرة جديدة</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'row-reverse' }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(150deg,var(--g500),var(--g700))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🌱</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--ink)' }}>مشاريعي</div>
            <div style={{ fontSize: 12, color: 'var(--soft)' }}>كل أفكارك المحفوظة في مكان واحد</div>
          </div>
        </div>
      </div>

      {error && <div style={{ background: '#fbeeee', color: '#b03f3f', fontSize: 13.5, borderRadius: 12, padding: '12px 16px', marginBottom: 18, textAlign: 'right' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--soft)', padding: 60 }}>… جارٍ التحميل</div>
      ) : projects.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed var(--g100)', borderRadius: 20, padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🌰</div>
          <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--ink)', marginBottom: 8 }}>لا توجد مشاريع محفوظة بعد</div>
          <p style={{ fontSize: 14, color: 'var(--soft)', marginBottom: 20 }}>ابدأ فكرتك الأولى واحفظها لتظهر هنا.</p>
          <a href="/app" style={{ textDecoration: 'none', background: 'var(--g700)', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 12, padding: '12px 22px' }}>ابدأ الآن ←</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
          {projects.map((p) => {
            const sc = p.data && p.data.report ? p.data.report.score : overallScore((p.data && p.data.answers) || {});
            const stage = stageFor(sc || 0);
            return (
              <div
                key={p.id}
                onClick={() => open(p.id)}
                style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 20, padding: 22, cursor: 'pointer', boxShadow: '0 10px 30px -24px rgba(20,63,42,.35)', transition: 'transform .2s', textAlign: 'right' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <button onClick={(e) => remove(p.id, e)} title="حذف" style={{ background: 'none', border: 'none', color: '#b03f3f', fontSize: 16, cursor: 'pointer', padding: '2px 6px' }}>🗑</button>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--amberbg)', color: '#9a6320', fontSize: 12, fontWeight: 700, padding: '5px 11px', borderRadius: 999 }}>{stage.emoji} {stage.label}</span>
                </div>
                <div style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--ink)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: 7, borderRadius: 7, background: 'var(--g100)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: (sc || 0) + '%', background: 'linear-gradient(90deg,#5fbf86,var(--g600))', borderRadius: 7 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--g700)' }}>{sc || 0}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--soft)' }}>آخر تحديث: {new Date(p.updated_at).toLocaleString('ar')}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

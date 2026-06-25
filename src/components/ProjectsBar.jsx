'use client';
import { useEffect, useState } from 'react';
import { listProjects, loadProject, saveProject, deleteProject } from '@/lib/projects.js';

/* شريط حفظ/تحميل المشاريع — يظهر للمستخدمين المسجّلين */
export default function ProjectsBar({ getSnapshot, onLoad }) {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [currentId, setCurrentId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const refresh = () => listProjects().then(setProjects).catch(() => {});

  useEffect(() => {
    refresh();
  }, []);

  const flash = (t) => {
    setMsg(t);
    setTimeout(() => setMsg(''), 2500);
  };

  const handleSave = async () => {
    const nm = (name || '').trim() || 'فكرتي ' + new Date().toLocaleDateString('ar');
    setBusy(true);
    try {
      const saved = await saveProject({ id: currentId, name: nm, data: getSnapshot() });
      setCurrentId(saved.id);
      setName(saved.name);
      await refresh();
      flash('تم الحفظ ✓');
    } catch (e) {
      flash('تعذّر الحفظ');
    } finally {
      setBusy(false);
    }
  };

  const handleLoad = async (id) => {
    setBusy(true);
    try {
      const p = await loadProject(id);
      onLoad(p.data || {});
      setCurrentId(p.id);
      setName(p.name);
      setOpen(false);
      flash('تم فتح المشروع ✓');
    } catch (e) {
      flash('تعذّر الفتح');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setBusy(true);
    try {
      await deleteProject(id);
      if (id === currentId) {
        setCurrentId(null);
        setName('');
      }
      await refresh();
    } catch {
      flash('تعذّر الحذف');
    } finally {
      setBusy(false);
    }
  };

  const newProject = () => {
    setCurrentId(null);
    setName('');
    onLoad({});
    setOpen(false);
  };

  return (
    <div className="nb-noprint" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 22px', background: '#fff', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setOpen((o) => !o)} style={btn('#fff', 'var(--g700)', '1.5px solid var(--g100)')}>📁 مشاريعي ({projects.length})</button>
        <button onClick={newProject} style={btn('#fff', 'var(--soft)', '1.5px solid var(--line)')}>＋ جديد</button>
        {msg && <span style={{ fontSize: 13, color: 'var(--g600)', fontWeight: 600 }}>{msg}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row-reverse' }}>
        <button onClick={handleSave} disabled={busy} style={{ ...btn('var(--g700)', '#fff', 'none'), opacity: busy ? 0.6 : 1 }}>💾 {currentId ? 'حفظ' : 'حفظ جديد'}</button>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم المشروع"
          style={{ textAlign: 'right', fontSize: 13.5, color: 'var(--ink)', background: 'var(--field)', border: '1.5px solid var(--line)', borderRadius: 10, padding: '8px 12px', outline: 'none', width: 180 }}
        />
      </div>

      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 22, marginTop: 6, background: '#fff', border: '1px solid var(--line)', borderRadius: 14, boxShadow: '0 14px 36px -12px rgba(20,63,42,.3)', zIndex: 600, width: 320, maxHeight: 340, overflowY: 'auto', padding: 10 }}>
          {projects.length === 0 ? (
            <div style={{ padding: 18, textAlign: 'center', color: 'var(--soft)', fontSize: 13.5 }}>لا توجد مشاريع محفوظة بعد.</div>
          ) : (
            projects.map((p) => (
              <div
                key={p.id}
                onClick={() => handleLoad(p.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 12px', borderRadius: 10, cursor: 'pointer', background: p.id === currentId ? 'var(--g50)' : '#fff' }}
              >
                <button onClick={(e) => handleDelete(p.id, e)} title="حذف" style={{ background: 'none', border: 'none', color: '#b03f3f', fontSize: 15, padding: '2px 6px', cursor: 'pointer' }}>🗑</button>
                <div style={{ flex: 1, textAlign: 'right', overflow: 'hidden' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 2 }}>{new Date(p.updated_at).toLocaleString('ar')}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function btn(bg, color, border) {
  return { display: 'inline-flex', alignItems: 'center', gap: 6, background: bg, color, border, fontWeight: 700, fontSize: 13, borderRadius: 10, padding: '8px 14px', cursor: 'pointer' };
}

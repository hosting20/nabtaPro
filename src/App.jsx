import { useEffect, useRef, useState } from 'react';
import { STEPS, DEFAULT_TIPS } from './data/steps.js';
import { callClaude, fallbackReport, buildAnalyzePrompt } from './api/claude.js';
import Wizard from './components/Wizard.jsx';
import Analyzing from './components/Analyzing.jsx';
import Report from './components/Report.jsx';
import Dashboard from './components/Dashboard.jsx';
import KeyModal from './components/KeyModal.jsx';
import Settings from './components/Settings.jsx';

const ANALYZE_MSGS = [
  'نقرأ المشكلة والجمهور المستهدف…',
  'نُقدّر حجم السوق والإيرادات…',
  'نُجري تحليل SWOT والمنافسين…',
  'نبني خطة البدء…',
];

export default function App() {
  const [screen, setScreen] = useState('wizard'); // wizard | analyzing | report | dashboard
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [aiTips, setAiTips] = useState([]);
  const [tipLoading, setTipLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [analyzingMsg, setAnalyzingMsg] = useState(ANALYZE_MSGS[0]);
  const [tasks, setTasks] = useState([]);
  const [dashTab, setDashTab] = useState('overview');
  const [gaugeStyle, setGaugeStyle] = useState('gauge');
  const [stepperStyle, setStepperStyle] = useState('numbered');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('nabta_api_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(() => !localStorage.getItem('nabta_api_key'));
  const [showSettings, setShowSettings] = useState(false);

  const analyzeTimer = useRef(null);

  useEffect(() => () => clearInterval(analyzeTimer.current), []);

  /* ── الإجابات ── */
  const setAnswer = (id, value) => setAnswers((a) => ({ ...a, [id]: value }));

  /* ── اطلب نصيحة من المرشد ── */
  const askTip = () => {
    if (tipLoading) return;
    setTipLoading(true);
    const step = STEPS[stepIndex];
    const ans = step.fields.map((f) => f.label + ': ' + (answers[f.id] || '(لم يُجب)')).join('\n');
    const finish = (text) => {
      setAiTips((t) => [...t, text]);
      setTipLoading(false);
    };
    if (apiKey) {
      callClaude(
        [
          {
            role: 'user',
            content:
              'أنت «مرشد نبتة»، مستشار أعمال ودود يساعد رائد أعمال في مرحلة "' +
              step.title +
              '". إجاباته:\n' +
              ans +
              '\n\nأعطه نصيحة عملية واحدة محددة وقصيرة (جملتان كحد أقصى) بالعربية لتقوية فكرته في هذه المرحلة بالذات. ابدأ مباشرة دون مقدمات.',
          },
        ],
        apiKey
      )
        .then((t) => finish(t.trim()))
        .catch(() => finish('تعذّر جلب النصيحة الآن، تأكد من مفتاح API وحاول مجدداً.'));
    } else {
      setTimeout(() => finish(DEFAULT_TIPS[(stepIndex + aiTips.length + 1) % DEFAULT_TIPS.length]), 350);
    }
  };

  /* ── تحليل الفكرة ── */
  const analyze = () => {
    setScreen('analyzing');
    let k = 0;
    setAnalyzingMsg(ANALYZE_MSGS[0]);
    analyzeTimer.current = setInterval(() => {
      k = (k + 1) % ANALYZE_MSGS.length;
      setAnalyzingMsg(ANALYZE_MSGS[k]);
    }, 1600);

    const dump = STEPS.map(
      (s) => '# ' + s.title + '\n' + s.fields.map((f) => '- ' + f.label + ': ' + (answers[f.id] || '(لم يُجب)')).join('\n')
    ).join('\n\n');
    const prompt = buildAnalyzePrompt(dump);

    const finish = (json) => {
      clearInterval(analyzeTimer.current);
      setReport(json);
      setScreen('report');
    };

    if (apiKey) {
      callClaude([{ role: 'user', content: prompt }], apiKey)
        .then((raw) => {
          const m = raw.match(/\{[\s\S]*\}/);
          finish(JSON.parse(m[0]));
        })
        .catch(() => finish(fallbackReport(answers)));
    } else {
      setTimeout(() => finish(fallbackReport(answers)), 2200);
    }
  };

  /* ── فتح لوحة المتابعة ── */
  const openDashboard = () => {
    const r = report || fallbackReport(answers);
    let t = tasks;
    if (!t.length) {
      t = [];
      (r.nextSteps || []).forEach((x, i) => t.push({ id: 'n' + i, text: x, cat: 'التحقق', done: false }));
      (r.recommendations || []).forEach((x, i) => t.push({ id: 'r' + i, text: x, cat: 'النمو', done: false }));
    }
    setTasks(t);
    setScreen('dashboard');
  };

  const toggleTask = (id) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  /* ── المفتاح والإعدادات ── */
  const saveKey = (v) => {
    if (v) {
      localStorage.setItem('nabta_api_key', v);
      setApiKey(v);
    }
    setShowKeyModal(false);
  };
  const resetKey = () => {
    localStorage.removeItem('nabta_api_key');
    setApiKey('');
    setShowSettings(false);
    setShowKeyModal(true);
  };

  const handleNext = () => {
    if (stepIndex < 4) setStepIndex(stepIndex + 1);
    else analyze();
  };
  const handlePrev = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  /* ── العرض ── */
  return (
    <>
      {screen === 'wizard' && (
        <Wizard
          stepIndex={stepIndex}
          answers={answers}
          aiTips={aiTips}
          tipLoading={tipLoading}
          gaugeStyle={gaugeStyle}
          stepperStyle={stepperStyle}
          onAnswer={setAnswer}
          onSelectStep={setStepIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          onAskTip={askTip}
        />
      )}

      {screen === 'analyzing' && <Analyzing message={analyzingMsg} />}

      {screen === 'report' && report && (
        <Report
          report={report}
          onDownload={() => window.print()}
          onOpenDash={openDashboard}
          onEdit={() => setScreen('wizard')}
        />
      )}

      {screen === 'dashboard' && report && (
        <Dashboard
          report={report}
          tasks={tasks}
          dashTab={dashTab}
          onBackReport={() => setScreen('report')}
          onDownload={() => window.print()}
          onTab={setDashTab}
          onToggleTask={toggleTask}
        />
      )}

      {screen === 'wizard' && showSettings && !showKeyModal && (
        <Settings
          gaugeStyle={gaugeStyle}
          stepperStyle={stepperStyle}
          onGauge={setGaugeStyle}
          onStepper={setStepperStyle}
          onResetKey={resetKey}
          onClose={() => setShowSettings(false)}
        />
      )}

      {screen === 'wizard' && !showKeyModal && (
        <button
          className="nb-noprint"
          title="الإعدادات"
          onClick={() => setShowSettings((s) => !s)}
          style={{ position: 'fixed', bottom: 24, left: 24, width: 44, height: 44, borderRadius: 13, background: '#fff', border: '1.5px solid var(--line)', boxShadow: '0 4px 14px -4px rgba(20,63,42,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, zIndex: 400 }}
        >
          ⚙
        </button>
      )}

      {showKeyModal && <KeyModal onSave={saveKey} onSkip={() => setShowKeyModal(false)} />}
    </>
  );
}

import { overallScore } from '../utils/scoring.js';

/* استدعاء Claude عبر الخادم الوسيط الآمن (/api/ai) — لا يلمس المتصفح المفتاح */
export function callClaude(messages) {
  return fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);
      return data.text;
    });
}

/* تقرير احتياطي يُستخدم بدون مفتاح API أو عند فشل الطلب */
export function fallbackReport(answers) {
  const sc = overallScore(answers || {});
  return {
    score: sc || 58,
    verdict: 'فكرة واعدة تحتاج إثبات الطلب عبر نموذج أولي صغير قبل التوسّع.',
    marketSize: {
      tam: 'كبير',
      sam: 'متوسط',
      som: 'بداية مركّزة',
      note: 'ابدأ بشريحة ضيقة قابلة للوصول ثم اتّسع تدريجياً.',
    },
    revenue: { model: 'اشتراك شهري', arpu: 'متوسط', note: 'اربط التسعير بالقيمة الواضحة للعميل.' },
    swot: {
      strengths: ['حلّ لمشكلة حقيقية', 'تركيز على شريحة محددة'],
      weaknesses: ['الحاجة لإثبات الطلب', 'موارد محدودة'],
      opportunities: ['سوق غير مخدوم', 'إمكانية التوسّع'],
      threats: ['منافسون أكبر', 'تغيّر سلوك العملاء'],
    },
    competitors: [
      { name: 'حلول حالية متفرقة', note: 'تجربة مجزّأة وغير موحّدة.' },
      { name: 'الطريقة اليدوية', note: 'بطيئة وعرضة للأخطاء.' },
    ],
    recommendations: [
      'ابنِ صفحة هبوط لاختبار الطلب',
      'أجرِ 10 مقابلات مع عملاء محتملين',
      'أطلق نموذجاً أولياً مبسّطاً',
    ],
    nextSteps: ['تحقّق من المشكلة بالمقابلات', 'ابنِ MVP لأهم ميزة', 'اختبر مع أول 20 مستخدماً'],
  };
}

/* بناء نص الطلب لتحليل الفكرة كاملة */
export function buildAnalyzePrompt(stepsDump) {
  return (
    'أنت محلل أعمال خبير. حلّل فكرة المشروع التالية وأعد JSON صالحاً فقط دون أي نص قبله أو بعده.\n\n' +
    stepsDump +
    '\n\nأعد بهذا الشكل بالضبط (قيم عربية موجزة):\n' +
    '{"score":<رقم 0-100>,"verdict":"<جملة حكم موجزة>","marketSize":{"tam":"<قيمة>","sam":"<قيمة>","som":"<قيمة>","note":"<سطر شرح>"},"revenue":{"model":"<النموذج>","arpu":"<متوسط الإيراد>","note":"<سطر>"},"swot":{"strengths":["<نقطة>","<نقطة>"],"weaknesses":["<نقطة>","<نقطة>"],"opportunities":["<نقطة>","<نقطة>"],"threats":["<نقطة>","<نقطة>"]},"competitors":[{"name":"<اسم>","note":"<سطر>"},{"name":"<اسم>","note":"<سطر>"}],"recommendations":["<توصية>","<توصية>","<توصية>"],"nextSteps":["<خطوة>","<خطوة>","<خطوة>"]}'
  );
}

/* إعدادات الخطة — مشتركة بين الخادم والصفحات */

/* عدد طلبات الذكاء الاصطناعي المجانية لكل مستخدم قبل طلب Pro */
export const FREE_AI_LIMIT = Number(process.env.FREE_AI_LIMIT) || 5;

/* هل اشتراك المستخدم فعّال (Pro غير منتهٍ)؟ */
export function isActivePro(profile) {
  return Boolean(
    profile &&
      profile.subscription_status === 'active' &&
      (!profile.subscription_expires || new Date(profile.subscription_expires) > new Date())
  );
}

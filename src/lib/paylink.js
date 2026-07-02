/* تكامل بوابة الدفع السعودية PayLink (paylink.sa) — خادم فقط */

const BASE = process.env.PAYLINK_BASE_URL || 'https://restapi.paylink.sa';

export function paylinkConfigured() {
  return Boolean(process.env.PAYLINK_API_ID && process.env.PAYLINK_SECRET_KEY);
}

/* الحصول على رمز الوصول */
async function getToken() {
  const res = await fetch(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      apiId: process.env.PAYLINK_API_ID,
      secretKey: process.env.PAYLINK_SECRET_KEY,
      persistToken: false,
    }),
  });
  const data = await res.json().catch(() => ({}));
  const token = data.id_token || data.token;
  if (!res.ok || !token) {
    throw new Error(data.detail || data.title || 'فشل مصادقة PayLink');
  }
  return token;
}

/* إنشاء فاتورة دفع — تُعيد transactionNo ورابط الدفع url */
export async function addInvoice({ amount, clientName, clientEmail, clientMobile, orderNumber, callBackUrl, note, products }) {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/addInvoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount,
      clientName,
      clientEmail,
      clientMobile: clientMobile || '0500000000',
      orderNumber,
      callBackUrl,
      note: note || 'اشتراك نبتة Pro',
      products: products || [{ title: 'اشتراك نبتة Pro — شهر', price: amount, qty: 1 }],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.title || 'تعذّر إنشاء فاتورة الدفع');
  }
  return data; // { transactionNo, url, mobileUrl, qrUrl, ... }
}

/* جلب حالة فاتورة عبر رقم العملية */
export async function getInvoice(transactionNo) {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/getInvoice/${transactionNo}`, {
    method: 'GET',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.title || 'تعذّر التحقق من الفاتورة');
  }
  return data; // { orderStatus, amount, orderNumber, ... }
}

/* سعر اشتراك Pro الشهري بالريال السعودي */
export function proPrice() {
  const p = Number(process.env.PRO_PRICE);
  return Number.isFinite(p) && p >= 5 ? p : 49;
}

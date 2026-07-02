import './globals.css';

export const metadata = {
  title: 'نبتة — مستشار الأعمال الذكي',
  description: 'ازرع فكرتك · تحقّق منها · اجعلها تُثمر — منصّة SaaS لتحليل جدوى الأفكار بالذكاء الاصطناعي.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Tajawal:wght@500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

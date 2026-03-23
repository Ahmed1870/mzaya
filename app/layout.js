export const metadata = {
  title: 'مزايا - منصة التجار',
  description: 'لوحة تحكم ذكية لإدارة تجارتك',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif', backgroundColor: '#000' }}>
        {children}
      </body>
    </html>
  )
}

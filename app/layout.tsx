import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'مزايا — MAZAYA | أداة التاجر الذكي',
  description: 'منصة التجارة الإلكترونية الأفضل في مصر — أضف منتجاتك، احسب أرباحك، وابني متجرك الاحترافي',
  keywords: 'مزايا، تجارة إلكترونية، متجر، تاجر، مصر',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
// build-trigger: Fri Mar 20 21:32:45 EET 2026
// Build Timestamp: Mon Mar 23 05:15:49 EET 2026

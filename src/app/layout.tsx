import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Pilav 7'm | QR Menü",
  description: 'Pilav Aşkına - Doğal Lezzet, Güler Yüz',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}

import './globals.css'
import Script from "next/script";
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'NFP',
  description: 'Non-Fungible-Pixels',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
      <Script src="/js/snarkjs.min.js" />
    </html>
  )
}

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@rainbow-me/rainbowkit/styles.css'
import { Providers } from './providers'
import styles from './page.module.css'
import { NavbarMain } from "@/components/Navbar"
import bg from '../../public/bg-sea.jpg'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Kaviar',
    description: 'Cross-chain app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <main className={styles.main} style={{
                        backgroundImage: `url(${bg.src})`,
                        opacity: 0.9,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                    }}>
                        <NavbarMain />
                        <div className={styles.content}>
                            {children}
                        </div>
                    </main>
                </Providers>
            </body>
        </html>
    )
}

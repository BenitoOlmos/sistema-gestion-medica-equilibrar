import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Clinica Equilibrar',
    description: 'Sistema de Gestión Clínica',
}

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}

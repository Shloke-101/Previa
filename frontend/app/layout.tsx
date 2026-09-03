import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Previa PVFC — Financial Clearance Command Center', description: 'Pre-visit financial clearance for modern revenue cycle operations.', generator: 'v0.app' }
export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#08111f', userScalable: false }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}

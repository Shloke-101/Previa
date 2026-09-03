import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Previa — Pre-Visit Financial Clearance & RCM Self-Healing', description: 'AI-powered pre-visit financial clearance, EDI 270/271 verification, and RCM self-healing platform.', generator: 'v0.app' }
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f5f8fc' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}

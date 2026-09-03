import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '../components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'PREVIA - Pre-Visit Financial Clearance & Denial Prevention',
  description: 'AI-powered pre-visit financial clearance and denial-prevention system for healthcare encounters.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}

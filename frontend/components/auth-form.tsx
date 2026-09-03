'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function submit(e: React.FormEvent) { e.preventDefault(); setLoading(true); setError(''); const supabase = createClient(); const result = mode === 'login' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback` } }); setLoading(false); if (result.error) { setError(result.error.message.includes('confirm') ? 'Check your inbox to confirm your email.' : 'Unable to complete that request. Check your details and try again.'); return } router.push(mode === 'login' ? '/account' : '/auth/sign-up-success') }
  return <form onSubmit={submit} className="auth-form">{mode === 'signup' && <label>Full name<input required value={name} onChange={e => setName(e.target.value)} placeholder="Alex Morgan" /></label>}<label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" /></label><label>Password<input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" /></label>{error && <p className="form-error">{error}</p>}<button disabled={loading}>{loading ? 'Working…' : mode === 'login' ? 'Sign in to Previa' : 'Create account'}</button></form>
}

import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'
export default function LoginPage() { return <main className="auth-page"><div className="auth-card"><div className="brand-mark">P<span>V</span></div><p className="eyebrow">PREVIA PVFC</p><h1>Welcome back</h1><p className="muted">Sign in to your financial clearance workspace.</p><AuthForm mode="login" /><p className="auth-switch">New to Previa? <Link href="/auth/sign-up">Create an account</Link></p></div></main> }

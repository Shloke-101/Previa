import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'
export default function SignUpPage() { return <main className="auth-page"><div className="auth-card"><div className="brand-mark">P<span>V</span></div><p className="eyebrow">PREVIA PVFC</p><h1>Create your workspace</h1><p className="muted">Bring your revenue cycle team into one operating view.</p><AuthForm mode="signup" /><p className="auth-switch">Already have access? <Link href="/auth/login">Sign in</Link></p></div></main> }

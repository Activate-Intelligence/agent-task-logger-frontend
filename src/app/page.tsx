import { LoginForm } from '@/components/auth/LoginForm'

// Server component - renders immediately without client-side checks
export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <LoginForm />
    </div>
  )
}

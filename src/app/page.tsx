'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { LoginForm } from '@/components/auth/LoginForm'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, hasHydrated } = useAuthStore()

  // Redirect to dashboard if already authenticated (after hydration)
  useEffect(() => {
    if (!hasHydrated) return

    if (isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, hasHydrated, router])

  // Don't show login form until hydration complete to avoid flicker
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50" />
    )
  }

  // Don't show login form if authenticated (will redirect)
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50" />
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <LoginForm />
    </div>
  )
}

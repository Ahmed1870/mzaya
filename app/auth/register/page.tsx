'use client'
import { Suspense } from 'react'
import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020202] flex items-center justify-center text-[#D4AF37] font-bold">
        جاري تحميل واجهة التسجيل...
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}

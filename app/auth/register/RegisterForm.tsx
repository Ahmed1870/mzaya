'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function RegisterForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const refCode = searchParams.get('ref')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, referred_by: refCode } }
    })
    if (error) alert(error.message)
    else alert('✅ تم التسجيل بنجاح في مزايا')
  }

  return (
    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {searchParams.get('ref') && <p style={{ color: '#D4AF37', fontSize: '0.8rem' }}>🎁 كود الدعوة: {searchParams.get('ref')}</p>}
      <input type="text" placeholder="الاسم" onChange={(e) => setFullName(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', background: '#111', border: '1px solid #333', color: 'white' }} />
      <input type="email" placeholder="البريد" onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', background: '#111', border: '1px solid #333', color: 'white' }} />
      <input type="password" placeholder="الباسورد" onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', background: '#111', border: '1px solid #333', color: 'white' }} />
      <button type="submit" style={{ padding: '14px', background: '#D4AF37', borderRadius: '12px', color: 'black', fontWeight: 900 }}>إنشاء حساب</button>
    </form>
  )
}

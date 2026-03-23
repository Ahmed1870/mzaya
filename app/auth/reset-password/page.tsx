'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const supabase = createClient()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) alert(error.message)
    else {
      alert('تم تحديث كلمة المرور بنجاح!')
      window.location.href = '/auth'
    }
  }

  return (
    <div style={{ background: '#020202', minHeight: '100vh', color: 'white', padding: '40px', textAlign: 'center' }}>
      <form onSubmit={handleUpdate} style={{ maxWidth: '400px', margin: '0 auto', background: '#0A0A0A', padding: '30px', borderRadius: '20px', border: '1px solid #D4AF37' }}>
        <h2>تحديث كلمة المرور</h2>
        <input type="password" placeholder="كلمة المرور الجديدة" onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', padding: '12px', margin: '20px 0', borderRadius: '10px', background: '#111', color: 'white', border: '1px solid #333' }} required />
        <button type="submit" style={{ width: '100%', padding: '14px', background: '#D4AF37', border: 'none', borderRadius: '12px', color: 'black', fontWeight: 900 }}>تحديث الآن</button>
      </form>
    </div>
  )
}

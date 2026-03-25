'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Swal from 'sweetalert2'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) return Swal.fire('خطأ', 'كلمة السر يجب أن تكون 6 أحرف على الأقل', 'error')
    
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    
    if (error) {
      Swal.fire({ icon: 'error', title: 'فشل التحديث', text: error.message, background: '#0a0a0a', color: '#fff' })
      setLoading(false)
    } else {
      Swal.fire({ icon: 'success', title: 'عاش يا بطل', text: 'تم تحديث كلمة السر بنجاح، يمكنك الدخول الآن', background: '#0a0a0a', color: '#fff' })
      .then(() => window.location.href = '/auth/login')
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#020202',display:'flex',alignItems:'center',justifyContent:'center',direction:'rtl'}}>
      <form onSubmit={handleUpdate} style={{width:'90%',maxWidth:400,background:'#0A0A0A',padding:'2.5rem',borderRadius:'2rem',border:'1px solid rgba(212,175,55,0.2)',textAlign:'center'}}>
        <h2 style={{color:'#D4AF37',fontWeight:900,marginBottom:'1rem'}}>تحديث كلمة السر</h2>
        <p style={{color:'#666',fontSize:'.9rem',marginBottom:'2rem'}}>اكتب كلمة المرور الجديدة والقوية</p>
        <input type="password" placeholder="كلمة المرور الجديدة" style={{width:'100%',padding:'1rem',borderRadius:'1.1rem',background:'#080808',border:'1px solid #1a1a1a',color:'#fff',marginBottom:'1.5rem',outline:'none', textAlign:'center'}} onChange={e=>setNewPassword(e.target.value)} required />
        <button disabled={loading} type="submit" style={{width:'100%',padding:'1.1rem',background:'#D4AF37',border:'none',borderRadius:'1.1rem',color:'#000',fontWeight:900,cursor:'pointer'}}>
          {loading ? 'جارٍ الحفظ...' : 'تحديث ودخول'}
        </button>
      </form>
    </div>
  )
}

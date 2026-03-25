'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Swal from 'sweetalert2'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [shopName, setShopName] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { shop_name: shopName },
        emailRedirectTo: `${window.location.origin}/auth/callback` 
      }
    })

    if (error) {
      Swal.fire({ title: 'خطأ في التسجيل', text: error.message, icon: 'error' })
    } else {
      Swal.fire({ title: 'تم التسجيل بنجاح', text: 'راجع بريدك الإلكتروني لتأكيد الحساب', icon: 'success' })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <input type="text" placeholder="اسم المتجر" value={shopName} onChange={(e)=>setShopName(e.target.value)} className="w-full p-3 rounded bg-white/5 border border-white/10" required />
      <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full p-3 rounded bg-white/5 border border-white/10" required />
      <input type="password" placeholder="كلمة المرور" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-3 rounded bg-white/5 border border-white/10" required />
      <button type="submit" disabled={loading} className="w-full p-3 bg-[#D4AF37] text-black font-bold rounded">
        {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب تاجر'}
      </button>
    </form>
  )
}

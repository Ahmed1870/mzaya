'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import Swal from 'sweetalert2'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [shopName, setShopName] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // اصطياد كود الإحالة من الرابط (الـ ID بتاعك)
    const referrerId = searchParams.get('ref')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // تخزين اسم المتجر وكود المحيل في الـ metadata الخاصة بالمستخدم
        data: { 
          shop_name: shopName,
          referrer_id: referrerId || null
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      Swal.fire({ 
        title: 'خطأ في التسجيل', 
        text: error.message, 
        icon: 'error',
        background: '#0a0a0a',
        color: '#fff'
      })
    } else {
      Swal.fire({ 
        title: 'تم التسجيل بنجاح ✅', 
        text: 'راجع بريدك الإلكتروني لتأكيد الحساب والبدء في رحلتك مع مزايا.', 
        icon: 'success',
        background: '#0a0a0a',
        color: '#fff'
      })
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] shadow-2xl">
      <h2 className="text-2xl font-black text-center mb-8 text-[#D4AF37]">ابدأ تجارتك الآن</h2>
      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block mr-2">اسم المتجر</label>
          <input type="text" placeholder="مثال: متجر السعادة" value={shopName} onChange={(e)=>setShopName(e.target.value)} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] outline-none transition-all" required />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block mr-2">البريد الإلكتروني</label>
          <input type="email" placeholder="email@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] outline-none transition-all" required />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block mr-2">كلمة المرور</label>
          <input type="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] outline-none transition-all" required />
        </div>
        
        <button type="submit" disabled={loading} className="w-full py-4 bg-[#D4AF37] text-black font-black rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4">
          {loading ? 'جاري تجهيز متجرك...' : 'إنشاء حساب تاجر'}
        </button>
      </form>
      <p className="text-center text-[10px] text-gray-600 mt-6 tracking-widest uppercase font-bold">Powered by MZAYA Platform</p>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Swal from 'sweetalert2'
import Link from 'next/link'
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
       Swal.fire({
        title: 'تنبيه ملكي',
        text: error.message === 'User already registered' ? 'هذا البريد ينتمي لأحد ملوكنا بالفعل!' : error.message,
        icon: 'warning',
        background: '#0a0a0a',
        color: '#D4AF37',
        confirmButtonColor: '#D4AF37'
      })
    } else {
      Swal.fire({
        title: 'تم الإرسال بنجاح',
        text: 'تفقد بريدك لتأكيد الانضمام إلى إمبراطورية مزايا.',
        icon: 'success',
        background: '#0a0a0a',
        color: '#fff'
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Magic */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/10 blur-[150px] rounded-full animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] relative z-10"
      >
        <div className="bg-black/40 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/5 shadow-2xl relative">
          {/* Scanner Line Effect */}
          <div className="absolute inset-0 overflow-hidden rounded-[4rem] pointer-events-none">
             <motion.div 
               animate={{ top: ['0%', '100%', '0%'] }} 
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="h-1 w-full bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent absolute"
             />
          </div>

          <div className="text-center mb-12">
             <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity }} className="inline-block mb-4">
                <Sparkles className="text-[#D4AF37]" size={40} />
             </motion.div>
             <h2 className="text-4xl font-black text-white mb-4">تسجيل جديد</h2>
             <p className="text-gray-500 font-medium italic underline decoration-[#D4AF37]">انضم للصفوة وابدأ رحلتك</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 mr-4 uppercase tracking-[2px]">Identity / البريد</label>
              <div className="relative group">
                <input 
                  required type="email" 
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl outline-none focus:border-[#D4AF37] transition-all text-white font-bold"
                  onChange={e => setEmail(e.target.value)}
                />
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37]" size={20} />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-black text-gray-400 mr-4 uppercase tracking-[2px]">Secret / كلمة السر</label>
              <div className="relative group">
                <input 
                  required type="password" 
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl outline-none focus:border-[#D4AF37] transition-all text-white font-bold"
                  onChange={e => setPassword(e.target.value)}
                />
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37]" size={20} />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05, shadow: "0 0 30px rgba(212,175,55,0.4)" }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black py-6 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 transition-all"
            >
              {loading ? <Loader2 className="animate-spin text-black" /> : <>تفعيل العضوية <ArrowRight /></>}
            </motion.button>
          </form>

          <div className="mt-12 text-center">
             <Link href="/auth/login" className="text-gray-500 hover:text-white transition-all text-sm font-bold tracking-widest uppercase">
               لديك حساب بالفعل؟ <span className="text-[#D4AF37] underline">سجل دخولك</span>
             </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

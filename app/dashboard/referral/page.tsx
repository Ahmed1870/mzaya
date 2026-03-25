'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Gift, Users, ArrowLeft, Crown, Star, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Swal from 'sweetalert2'

export default function ReferralPage() {
  const [stats, setStats] = useState({ totalRegistered: 0, totalPaid: 0 })
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      setUser(authUser)

      // جلب كل اللي سجلوا عن طريق التاجر ده
      const { data: referrals } = await supabase
        .from('profiles')
        .select('plan_name')
        .eq('referrer_id', authUser.id)

      const registered = referrals?.length || 0
      const paid = referrals?.filter(r => r.plan_name !== 'مجانية' && r.plan_name !== 'free').length || 0

      setStats({ totalRegistered: registered, totalPaid: paid })
      setLoading(false)
    }
    loadData()
  }, [])

  const requestReward = async (plan: string, count: number, type: string) => {
    Swal.fire({
      title: 'إرسال طلب مكافأة',
      text: `أنت مؤهل للحصول على باقة ${plan} مجاناً بفضل إحالاتك (${type}: ${count})`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'إرسال الطلب للآدمن',
      background: '#0a0a0a', color: '#fff', confirmButtonColor: '#d4af37'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // تسجيل طلب المكافأة في جدول طلبات الاشتراكات بوضع علامة "إحالة"
        await supabase.from('subscriptions_requests').insert([{
          user_id: user.id,
          plan_name: plan,
          amount: 0,
          status: 'pending',
          sender_number: 'REFERRAL_REWARD',
          metadata: { is_referral: true, referral_count: count, type: type }
        }])
        Swal.fire('تم!', 'سيقوم الآدمن بمراجعة إحالاتك وتفعيل الباقة فوراً.', 'success')
      }
    })
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#D4AF37] animate-pulse">جاري فحص الإحالات...</div>

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-12" dir="rtl" style={{ fontFamily: 'sans-serif' }}>
      <header className="mb-12 flex items-center gap-4">
        <Link href="/dashboard" className="p-3 bg-white/5 rounded-2xl text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all">
           <ArrowLeft size={24} />
        </Link>
        <div>
            <h1 className="text-3xl font-black">نظام المكافآت</h1>
            <p className="text-gray-500 text-sm mt-1">ادعُ أصدقاءك واحصل على باقات مجانية</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* كارت الـ 10 تسجيلات */}
        <div className={`p-8 rounded-[3rem] border transition-all ${stats.totalRegistered >= 10 ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_30px_rgba(212,175,55,0.1)]' : 'border-white/5 bg-[#0a0a0a]'}`}>
          <Star className="text-[#D4AF37] mb-6" size={40} />
          <h2 className="text-xl font-bold mb-2">هدية الـ 10 مسجلين</h2>
          <p className="text-gray-500 text-sm mb-6">احصل على باقة <span className="text-white font-bold text-lg">احترافية</span> مجاناً عند دعوة 10 أشخاص للتسجيل.</p>
          <div className="flex justify-between items-end">
            <div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">التقدم الحالي</p>
                <p className="text-3xl font-black">{stats.totalRegistered} <span className="text-sm text-gray-600">/ 10</span></p>
            </div>
            {stats.totalRegistered >= 10 && (
                <button onClick={() => requestReward('احترافية', stats.totalRegistered, 'تسجيل')} className="bg-[#D4AF37] text-black px-6 py-3 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all">استلام الهدية 🎁</button>
            )}
          </div>
        </div>

        {/* كارت الـ 5 مشترين */}
        <div className={`p-8 rounded-[3rem] border transition-all ${stats.totalPaid >= 5 ? 'border-green-500 bg-green-500/5 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'border-white/5 bg-[#0a0a0a]'}`}>
          <Crown className="text-green-500 mb-6" size={40} />
          <h2 className="text-xl font-bold mb-2">جائزة الـ 5 شركاء</h2>
          <p className="text-gray-500 text-sm mb-6">احصل على باقة <span className="text-white font-bold text-lg">البيزنس</span> مجاناً عند اشتراك 5 من أصدقائك في أي باقة.</p>
          <div className="flex justify-between items-end">
            <div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">التقدم الحالي</p>
                <p className="text-3xl font-black text-green-500">{stats.totalPaid} <span className="text-sm text-gray-600">/ 5</span></p>
            </div>
            {stats.totalPaid >= 5 && (
                <button onClick={() => requestReward('البيزنس', stats.totalPaid, 'اشتراك فعلي')} className="bg-green-500 text-black px-6 py-3 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all">تفعيل البيزنس 🚀</button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 text-center">
         <p className="text-gray-400 text-sm mb-4">لينك الإحالة الخاص بك:</p>
         <div className="flex items-center gap-2 bg-black p-4 rounded-xl border border-white/10 justify-center group">
            <code className="text-[#D4AF37] text-xs md:text-sm">https://mzaya.app/auth/register?ref={user?.id}</code>
         </div>
      </div>
    </div>
  )
}

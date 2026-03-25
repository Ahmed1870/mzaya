'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Rocket, Star, Check, Crown } from 'lucide-react'
import Swal from 'sweetalert2'

export default function SubscriptionPage() {
  const supabase = createClient()
  const [currentPlan, setCurrentPlan] = useState('مجاني')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('plan_name').eq('id', user.id).single()
        if (data) setCurrentPlan(data.plan_name || 'مجاني')
      }
    }
    getProfile()
  }, [])

  const handleUpgrade = async (plan: string) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('subscriptions_requests').insert({
      user_id: user?.id,
      plan_name: plan,
      status: 'pending',
      created_at: new Date().toISOString()
    })

    if (!error) {
      Swal.fire({
        title: 'تم إرسال الطلب! 🚀',
        text: 'سيقوم المسؤول بتفعيل باقتك خلال دقائق بعد التأكد من التحويل.',
        icon: 'success',
        background: '#0a0a0a',
        color: '#fff'
      })
    }
    setLoading(false)
  }

  return (
    <div className="p-6 text-white min-h-screen bg-[#050505]">
      <h1 className="text-3xl font-bold text-center mb-2">ترقية الحساب</h1>
      <p className="text-gray-400 text-center mb-12">اختر الباقة المناسبة لتوسيع تجارتك</p>

      <div className="flex flex-wrap justify-center gap-8">
        {/* الباقة الاحترافية */}
        <div className={`w-full max-w-sm p-8 rounded-[2rem] border transition-all ${currentPlan === 'احترافية' ? 'border-[#d4af37] bg-[#d4af37]/5' : 'border-white/10 bg-[#0a0a0a]'}`}>
          <Star className="text-[#d4af37] mb-4" size={40} />
          <h2 className="text-2xl font-bold mb-2">احترافية</h2>
          <p className="text-3xl font-black mb-6">100 ج.م <span className="text-sm font-normal text-gray-500">/شهرياً</span></p>
          <ul className="space-y-3 mb-8 text-gray-300">
            <li className="flex gap-2"><Check className="text-green-500" size={18}/> مناديب شحن غير محدودين</li>
            <li className="flex gap-2"><Check className="text-green-500" size={18}/> تقارير رادار متقدمة</li>
            <li className="flex gap-2"><Check className="text-green-500" size={18}/> إدارة CRM كاملة</li>
          </ul>
          <button 
            onClick={() => handleUpgrade('احترافية')}
            disabled={currentPlan === 'احترافية' || loading}
            className="w-full py-3 rounded-xl bg-[#d4af37] text-black font-bold disabled:opacity-50"
          >
            {currentPlan === 'احترافية' ? 'باققتك الحالية' : 'اطلب الترقية الآن'}
          </button>
        </div>

        {/* باقة البيزنس */}
        <div className={`w-full max-w-sm p-8 rounded-[2rem] border transition-all ${currentPlan === 'البيزنس' ? 'border-green-500 bg-green-500/5' : 'border-white/10 bg-[#0a0a0a]'}`}>
          <Crown className="text-green-500 mb-4" size={40} />
          <h2 className="text-2xl font-bold mb-2">البيزنس</h2>
          <p className="text-3xl font-black mb-6">250 ج.م <span className="text-sm font-normal text-gray-500">/شهرياً</span></p>
          <ul className="space-y-3 mb-8 text-gray-300">
            <li className="flex gap-2"><Check className="text-green-500" size={18}/> كل مميزات الاحترافية</li>
            <li className="flex gap-2"><Check className="text-green-500" size={18}/> أولوية في دعم العملاء</li>
            <li className="flex gap-2"><Check className="text-green-500" size={18}/> إحصائيات نمو ذكية</li>
          </ul>
          <button 
            onClick={() => handleUpgrade('البيزنس')}
            disabled={currentPlan === 'البيزنس' || loading}
            className="w-full py-3 rounded-xl bg-green-500 text-black font-bold disabled:opacity-50"
          >
            {currentPlan === 'البيزنس' ? 'باققتك الحالية' : 'اطلب الترقية الآن'}
          </button>
        </div>
      </div>
    </div>
  )
}

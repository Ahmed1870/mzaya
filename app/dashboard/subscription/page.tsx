'use client'
import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { Crown, Zap, CheckCircle2, Star, ShieldCheck, Rocket, Wallet, MessageSquare } from 'lucide-react'
import Swal from 'sweetalert2'

export default function SubscriptionPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState('تحميل...')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
        setProfile(prof)
        setCurrentPlan(prof?.plan_name || 'مجانية')
      }
    }
    init()
  }, [])

  const handleProcess = async (planName: string, price: number) => {
    const { value: formValues } = await Swal.fire({
      title: `<span style="color: #d4af37; font-family: 'IBM Plex Sans Arabic', sans-serif;">تأكيد طلب باقة ${planName}</span>`,
      html: `
        <div style="text-align: right; direction: rtl; font-family: 'IBM Plex Sans Arabic', sans-serif;">
          <p style="color: #666; font-size: 14px; margin-bottom: 20px;">أهلاً بك في عائلة مزايا! يرجى ملء البيانات لتأكيد اشتراكك.</p>
          <label style="display: block; font-size: 12px; color: #d4af37; margin-bottom: 5px;">الاسم بالكامل</label>
          <input id="swal-input1" class="swal2-input" style="width: 80%; margin: 0 auto 15px auto; background: #111; border: 1px solid #333; color: #fff; border-radius: 12px;" value="${profile?.full_name || ''}">
          
          <label style="display: block; font-size: 12px; color: #d4af37; margin-bottom: 5px;">رقم المحفظة (المحول منه)</label>
          <input id="swal-input2" class="swal2-input" style="width: 80%; margin: 0 auto 15px auto; background: #111; border: 1px solid #333; color: #fff; border-radius: 12px;" placeholder="01xxxxxxxxx">
          
          <p style="font-size: 11px; color: #444; margin-top: 10px;">* يتم التحويل لمبلغ <b>${price} ج.م</b> على رقم: <b>01019672878</b></p>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'تأكيد وإرسال للآدمن',
      cancelButtonText: 'إلغاء',
      background: '#0a0a0a',
      color: '#fff',
      confirmButtonColor: '#d4af37',
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLInputElement).value
        ]
      }
    })

    if (!formValues || !formValues[1]) return

    const [fullName, senderPhone] = formValues
    setLoading(true)

    // التأكد من عدم وجود طلب معلق
    const { data: existing } = await supabase
      .from('subscriptions_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      setLoading(false)
      Swal.fire({ title: 'تنبيه', text: 'لديك طلب قيد المراجعة بالفعل من قبل الإدارة.', icon: 'warning', background: '#0a0a0a', color: '#fff' })
      return
    }

    // تسجيل الطلب في قاعدة البيانات
    const { error } = await supabase.from('subscriptions_requests').insert([
      {
        user_id: user.id,
        plan_name: planName,
        amount: price,
        sender_number: senderPhone,
        status: 'pending',
        metadata: { full_name: fullName }
      }
    ])

    if (!error) {
      setLoading(false)
      Swal.fire({
        title: 'تم تسجيل طلبك! 🚀',
        text: 'جارٍ توجيهك الآن لواتساب الإدارة لتأكيد التفعيل الفوري.',
        icon: 'success',
        background: '#0a0a0a',
        color: '#fff',
        timer: 3000,
        showConfirmButton: false
      })

      // فتح الواتساب برسالة احترافية
      setTimeout(() => {
        const message = `أهلاً إدارة مزايا، أنا التاجر: ${fullName || user.email}%0Aأرغب في تفعيل باقة: ${planName}%0Aتم تحويل مبلغ: ${price} ج.م%0Aمن رقم: ${senderPhone}%0Aيرجى مراجعة الطلب والتفعيل.`;
        window.open(`https://wa.me/201019672878?text=${encodeURIComponent("يا آدمن، أنا التاجر " + (profile?.full_name || "جديد") + " وعايز أفعل باقة " + selectedPlan)}
      }, 1500)
    } else {
      setLoading(false)
      Swal.fire({ title: 'خطأ', text: 'فشل إرسال الطلب، تأكد من اتصالك بالإنترنت.', icon: 'error', background: '#0a0a0a', color: '#fff' })
    }
  }

  const Feature = ({ text, active = true }: { text: string, active?: boolean }) => (
    <div className="flex items-center gap-3 mb-3" style={{ opacity: active ? 1 : 0.3 }}>
      <CheckCircle2 size={16} className={active ? "text-[#d4af37]" : "text-gray-800"} />
      <span className="text-sm font-medium">{text}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-12" style={{ direction: 'rtl', fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block p-3 bg-[#d4af37]/10 rounded-2xl mb-4">
            <ShieldCheck size={40} className="text-[#d4af37]" />
        </div>
        <h1 className="text-4xl font-black mb-4">باقات الاشتراك</h1>
        <p className="text-gray-500 max-w-md mx-auto">ارتقِ بتجارتك اليوم وانضم إلى نخبة التجار في "مزايا" واستمتع بمميزات لا محدودة.</p>
        
        <div className="mt-8 inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full shadow-xl">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
           <span className="text-sm">باقتك الحالية: <b className="text-[#d4af37]">{currentPlan}</b></span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-8">
        {/* الباقة الاحترافية */}
        <div className={`w-full max-w-sm p-8 rounded-[3rem] border transition-all duration-500 ${currentPlan === 'الاحترافية' ? 'border-[#d4af37] bg-[#d4af37]/5 scale-105 shadow-[0_0_40px_rgba(212,175,55,0.1)]' : 'border-white/5 bg-[#0a0a0a]'}`}>
          <div className="flex justify-between items-start mb-8">
            <Zap size={40} className="text-[#d4af37]" />
            {currentPlan === 'الاحترافية' && <span className="bg-[#d4af37] text-black text-[10px] px-3 py-1 rounded-full font-black">نشطة حالياً</span>}
          </div>
          <h2 className="text-2xl font-black mb-2">الاحترافية</h2>
          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-4xl font-black">99</span>
            <span className="text-gray-500 text-sm">ج.م / شهرياً</span>
          </div>
          <div className="space-y-1 mb-10">
            <Feature text="رفع عدد لا نهائي من المنتجات" />
            <Feature text="رادار العملاء (محدود)" />
            <Feature text="تقارير المبيعات الشهرية" />
            <Feature text="إدارة المناديب والفواتير" />
            <Feature text="الذكاء الاصطناعي" active={false} />
          </div>
          <button 
            onClick={() => handleProcess('الاحترافية', 99)}
            disabled={loading || currentPlan === 'الاحترافية' || currentPlan === 'البيزنس'}
            className="w-full py-4 rounded-2xl font-black transition-all bg-gradient-to-r from-[#d4af37] to-[#fbf5b7] text-black shadow-lg active:scale-95 disabled:opacity-30"
          >
            {currentPlan === 'الاحترافية' || currentPlan === 'البيزنس' ? 'باقة مفعلة' : 'اشترك الآن'}
          </button>
        </div>

        {/* باقة البيزنس */}
        <div className={`w-full max-w-sm p-8 rounded-[3rem] border transition-all duration-500 ${currentPlan === 'البيزنس' ? 'border-[#1ed760] bg-[#1ed760]/5 scale-105 shadow-[0_0_40px_rgba(30,215,96,0.1)]' : 'border-white/5 bg-[#0a0a0a]'}`}>
          <div className="flex justify-between items-start mb-8">
            <Crown size={40} className="text-[#1ed760]" />
            {currentPlan === 'البيزنس' && <span className="bg-[#1ed760] text-black text-[10px] px-3 py-1 rounded-full font-black">الباقة القصوى</span>}
          </div>
          <h2 className="text-2xl font-black mb-2">البيزنس</h2>
          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-4xl font-black text-[#1ed760]">199</span>
            <span className="text-gray-500 text-sm">ج.م / شهرياً</span>
          </div>
          <div className="space-y-1 mb-10">
            <Feature text="كل مميزات الباقة الاحترافية" />
            <Feature text="رادار العملاء (كامل المزايا)" />
            <Feature text="مولد الإعلانات بالذكاء الاصطناعي" />
            <Feature text="دعم فني مخصص (VIP)" />
            <Feature text="تحليلات متقدمة لنمو المتجر" />
          </div>
          <button 
            onClick={() => handleProcess('البيزنس', 199)}
            disabled={loading || currentPlan === 'البيزنس'}
            className="w-full py-4 rounded-2xl font-black transition-all bg-gradient-to-r from-[#1ed760] to-[#a2f9c1] text-black shadow-lg active:scale-95 disabled:opacity-30"
          >
            {currentPlan === 'البيزنس' ? 'نشطة حالياً' : 'تطوير للبيزنس 🚀'}
          </button>
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="text-xs text-gray-600 flex items-center justify-center gap-2">
            <ShieldCheck size={14} /> جميع المعاملات تتم مراجعتها يدوياً لضمان أعلى مستويات الأمان.
        </p>
      </div>
    </div>
  )
}

'use client'
import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { getSubscriptionStatus } from '@/lib/subscription'
import { Crown, Zap, CheckCircle2, Star } from 'lucide-react'
import Swal from 'sweetalert2'

export default function SubscriptionPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState('تحميل...')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const status = await getSubscriptionStatus()
        setCurrentPlan(status?.label || 'المجانية')

        // رادار الاستقبال اللحظي - تصميمك الأصلي
        const channel = supabase.channel(`user-updates-${user.id}`)
          .on('broadcast', { event: 'plan-activated' }, (payload) => {
            setCurrentPlan(payload.payload.plan)
            Swal.fire({
              title: 'تهانينا! تم التفعيل 🚀',
              text: `أصبح حسابك الآن ضمن فئة: ${payload.payload.plan}`,
              icon: 'success',
              background: '#0a0a0a',
              color: '#d4af37',
              confirmButtonColor: '#d4af37',
              showClass: { popup: 'animate__animated animate__zoomIn' }
            })
          })
          .subscribe()
        return () => { supabase.removeChannel(channel) }
      }
    }
    init()
  }, [])

  const handleProcess = async (planName: string, price: number) => {
    const { value: sender } = await Swal.fire({
      title: 'بيانات التحويل',
      input: 'text',
      inputLabel: `باقة ${planName} - ${price} ج.م`,
      inputPlaceholder: 'رقم المحفظة أو اسم انستا باي (InstaPay)',
      showCancelButton: true,
      confirmButtonText: 'تأكيد الطلب',
      background: '#0a0a0a',
      color: '#d4af37',
      confirmButtonColor: '#d4af37',
    })

    if (!sender) return

    setLoading(true)
    const { error } = await supabase.from('subscriptions_requests').insert([
      { user_id: user.id, plan_name: planName, amount: price, sender_number: sender, status: 'pending' }
    ])

    if (!error) {
      setLoading(false)
      Swal.fire({
        title: 'تم تسجيل طلبك ✅',
        text: 'سيتم تحويلك الآن لواتساب الإدارة لتأكيد الدفع فوراً',
        icon: 'success',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#1ed760'
      }).then(() => {
        const msg = `طلب تفعيل باقة: ${planName}\nالتاجر: ${sender}\nID: ${user.id}`
        window.open(`https://wa.me/201019672878?text=${encodeURIComponent(msg)}`, '_blank')
      })
    }
  }

  const Feature = ({ text }: { text: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#ccc' }}>
      <CheckCircle2 size={16} color="#d4af37" />
      <span style={{ fontSize: '14px' }}>{text}</span>
    </div>
  )

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', padding: '40px 20px', direction: 'rtl' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#d4af37', marginBottom: '10px' }}>مزايا بريميوم</h1>
        <p style={{ color: '#888' }}>اختر الباقة المناسبة لنمو تجارتك</p>
        <div style={{ marginTop: '20px', background: 'rgba(212, 175, 55, 0.1)', padding: '12px 30px', borderRadius: '50px', border: '1px solid #d4af3733', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          <Star size={18} color="#d4af37" />
          باقتك الحالية: <span style={{ color: '#d4af37', fontWeight: '900' }}>{currentPlan}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
        {/* الباقة الاحترافية */}
        <div style={{ ...cardStyle, border: currentPlan === 'الاحترافية' ? '2px solid #d4af37' : '1px solid #1a1a1a', boxShadow: currentPlan === 'الاحترافية' ? '0 0 30px rgba(212, 175, 55, 0.2)' : 'none' }}>
          {currentPlan === 'الاحترافية' && <div style={activeBadge}>نشطة حالياً</div>}
          <Zap size={50} color="#d4af37" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '26px', fontWeight: 'bold' }}>الاحترافية</h2>
          <div style={{ fontSize: '34px', margin: '20px 0', fontWeight: '900' }}>99 <small style={{ fontSize: '16px', color: '#888' }}>ج.م / شهرياً</small></div>
          <div style={{ textAlign: 'right', marginBottom: '30px' }}>
            <Feature text="إضافة منتجات غير محدودة" />
            <Feature text="رادار العملاء المتقدم" />
            <Feature text="إحصائيات المبيعات اللحظية" />
            <Feature text="دعم فني مخصص" />
          </div>
          <button onClick={() => handleProcess('احترافية', 99)} disabled={loading || currentPlan === 'الاحترافية'} style={{ ...btnGold, opacity: currentPlan === 'الاحترافية' ? 0.5 : 1 }}>
            {currentPlan === 'الاحترافية' ? 'مشترك بالفعل' : 'اشترك الآن'}
          </button>
        </div>

        {/* باقة البيزنس */}
        <div style={{ ...cardStyle, border: currentPlan === 'البيزنس' ? '2px solid #1ed760' : '1px solid #1a1a1a', boxShadow: currentPlan === 'البيزنس' ? '0 0 30px rgba(30, 215, 96, 0.2)' : 'none' }}>
          {currentPlan === 'البيزنس' && <div style={{ ...activeBadge, background: '#1ed760' }}>نشطة حالياً</div>}
          <Crown size={50} color="#1ed760" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '26px', fontWeight: 'bold' }}>البيزنس</h2>
          <div style={{ fontSize: '34px', margin: '20px 0', fontWeight: '900', color: '#1ed760' }}>199 <small style={{ fontSize: '16px', color: '#888' }}>ج.م / شهرياً</small></div>
          <div style={{ textAlign: 'right', marginBottom: '30px' }}>
            <Feature text="كل مميزات الاحترافية" />
            <Feature text="مولد إعلانات بالذكاء الاصطناعي" />
            <Feature text="ربط متجرك بـ Domain خاص" />
            <Feature text="أولوية في معالجة الأوردرات" />
          </div>
          <button onClick={() => handleProcess('بيزنس', 199)} disabled={loading || currentPlan === 'البيزنس'} style={{ ...btnGreen, opacity: currentPlan === 'البيزنس' ? 0.5 : 1 }}>
            {currentPlan === 'البيزنس' ? 'مشترك بالفعل' : 'تطوير العضوية'}
          </button>
        </div>
      </div>
    </div>
  )
}

const cardStyle = { background: '#0a0a0a', padding: '50px 40px', borderRadius: '35px', width: '350px', textAlign: 'center' as const, position: 'relative' as const, transition: 'transform 0.3s ease' };
const activeBadge = { position: 'absolute' as const, top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#d4af37', color: '#000', padding: '5px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' as const };
const btnGold = { background: 'linear-gradient(45deg, #d4af37, #fbf5b7)', color: '#000', border: 'none', padding: '18px', width: '100%', borderRadius: '18px', fontWeight: '900' as const, cursor: 'pointer', fontSize: '16px' };
const btnGreen = { background: 'linear-gradient(45deg, #1ed760, #a2f9c1)', color: '#000', border: 'none', padding: '18px', width: '100%', borderRadius: '18px', fontWeight: '900' as const, cursor: 'pointer', fontSize: '16px' };

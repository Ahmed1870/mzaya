'use client'
import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { Crown, Zap, CheckCircle2, Star, ShieldCheck } from 'lucide-react'
import Swal from 'sweetalert2'

export default function SubscriptionPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState('تحميل...')
  const [user, setUser] = useState<any>(null)

  const cardStyle = { background: '#0a0a0a', padding: '50px 40px', borderRadius: '35px', width: '350px', textAlign: 'center' as const, position: 'relative' as const, transition: '0.3s ease', border: '1px solid #1a1a1a' };
  const activeBadge = { position: 'absolute' as const, top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#d4af37', color: '#000', padding: '5px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' as const };
  const btnGold = { background: 'linear-gradient(45deg, #d4af37, #fbf5b7)', color: '#000', border: 'none', padding: '18px', width: '100%', borderRadius: '18px', fontWeight: '900' as const, cursor: 'pointer', fontSize: '16px', transition: '0.3s' };
  const btnGreen = { background: 'linear-gradient(45deg, #1ed760, #a2f9c1)', color: '#000', border: 'none', padding: '18px', width: '100%', borderRadius: '18px', fontWeight: '900' as const, cursor: 'pointer', fontSize: '16px', transition: '0.3s' };

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase.from('profiles').select('plan_name').eq('id', user.id).single()
        setCurrentPlan(profile?.plan_name || 'مجانية')
      }
    }
    init()
  }, [])

  const handleProcess = async (planName: string, price: number) => {
    const { value: sender } = await Swal.fire({ 
      title: 'تأكيد طلب الاشتراك', 
      text: `أنت الآن تطلب باقة "${planName}" بسعر ${price} ج.م شهرياً.`,
      input: 'text', 
      inputLabel: 'أدخل رقم المحفظة المحول منها (فودافون كاش)', 
      inputPlaceholder: '01xxxxxxxxx', 
      showCancelButton: true, 
      confirmButtonText: 'إرسال الطلب',
      cancelButtonText: 'إلغاء',
      background: '#0a0a0a', 
      color: '#fff',
      confirmButtonColor: '#d4af37'
    })

    if (!sender) return

    if (loading) return
    setLoading(true)

    const { data: existing } = await supabase
      .from('subscriptions_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      setLoading(false)
      Swal.fire({ title: 'تنبيه', text: 'لديك طلب قيد المراجعة بالفعل', icon: 'warning' })
      return
    }

    const { error } = await supabase.from('subscriptions_requests').insert([
      { 
        user_id: user.id, 
        plan_name: planName, 
        amount: price, 
        sender_number: sender, 
        status: 'pending' 
      }
    ])

    if (!error) {
      setLoading(false)
      Swal.fire({ 
        title: 'تم إرسال طلبك ✅', 
        text: 'يرجى إتمام عملية التحويل والتواصل معنا لتفعيل حسابك فوراً.', 
        icon: 'success', 
        background: '#0a0a0a',
        color: '#fff'
      }).then(() => {
        window.open(`https://wa.me/201019672878?text=أهلاً مزايا، أرسلت طلب باقة ${planName} من رقم ${sender}. يرجى التفعيل.`, '_blank')
      })
    } else {
      setLoading(false)
      Swal.fire({ title: 'خطأ', text: 'حدثت مشكلة أثناء إرسال الطلب، حاول مرة أخرى.', icon: 'error' })
    }
  }

  const Feature = ({ text, active = true }: { text: string, active?: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: active ? '#ccc' : '#444' }}>
      <CheckCircle2 size={16} color={active ? "#d4af37" : "#222"} />
      <span style={{ fontSize: '14px', textDecoration: active ? 'none' : 'line-through' }}>{text}</span>
    </div>
  )

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', padding: '40px 20px', direction: 'rtl', fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#d4af37' }}>باقات مزايا</h1>
        <p style={{ color: '#666', marginTop: '10px' }}>اختر الباقة المناسبة لنمو تجارتك</p>
        <div style={{ marginTop: '20px', background: 'rgba(212, 175, 55, 0.05)', padding: '12px 30px', borderRadius: '50px', border: '1px solid #d4af3722', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          <Star size={18} color="#d4af37" />
          باقتك الحالية: <span style={{ color: '#d4af37', fontWeight: '900' }}>{currentPlan}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
        {/* باقة الاحترافية */}
        <div style={{ ...cardStyle, borderColor: currentPlan === 'الاحترافية' ? '#d4af37' : '#1a1a1a', transform: currentPlan === 'الاحترافية' ? 'scale(1.05)' : 'scale(1)' }}>
          {currentPlan === 'الاحترافية' && <div style={activeBadge}>بصمتك الحالية</div>}
          <Zap size={50} color="#d4af37" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '900' }}>الاحترافية</h2>
          <div style={{ fontSize: '30px', margin: '15px 0', fontWeight: '900' }}>99 <span style={{fontSize:'14px'}}>ج.م / شهر</span></div>
          <div style={{ textAlign: 'right', marginBottom: '30px' }}>
            <Feature text="رفع عدد لا نهائي من المنتجات" />
            <Feature text="رادار العملاء (محدود)" />
            <Feature text="تقارير المبيعات الشهرية" />
            <Feature text="إدارة المناديب والفواتير" />
            <Feature text="الذكاء الاصطناعي" active={false} />
          </div>
          <button 
            onClick={() => handleProcess('الاحترافية', 99)} 
            disabled={loading || currentPlan === 'الاحترافية' || currentPlan === 'البيزنس'} 
            style={{...btnGold, opacity: (currentPlan === 'الاحترافية' || currentPlan === 'البيزنس') ? 0.5 : 1, cursor: (currentPlan === 'الاحترافية' || currentPlan === 'البيزنس') ? 'default' : 'pointer'}}
          >
            {currentPlan === 'الاحترافية' || currentPlan === 'البيزنس' ? 'مفعلة' : 'اشترك الآن'}
          </button>
        </div>

        {/* باقة البيزنس */}
        <div style={{ ...cardStyle, borderColor: currentPlan === 'البيزنس' ? '#1ed760' : '#1a1a1a', transform: currentPlan === 'البيزنس' ? 'scale(1.05)' : 'scale(1)' }}>
          {currentPlan === 'البيزنس' && <div style={{...activeBadge, background:'#1ed760'}}>أنت الآن في القمة</div>}
          <Crown size={50} color="#1ed760" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '900' }}>البيزنس</h2>
          <div style={{ fontSize: '30px', margin: '15px 0', fontWeight: '900', color: '#1ed760' }}>199 <span style={{fontSize:'14px'}}>ج.م / شهر</span></div>
          <div style={{ textAlign: 'right', marginBottom: '30px' }}>
            <Feature text="كل مميزات الباقة الاحترافية" />
            <Feature text="رادار العملاء (كامل المزايا)" />
            <Feature text="مولد الإعلانات بالذكاء الاصطناعي" />
            <Feature text="دعم فني مخصص (VIP)" />
            <Feature text="تحليلات متقدمة لنمو المتجر" />
          </div>
          <button 
            onClick={() => handleProcess('البيزنس', 199)} 
            disabled={loading || currentPlan === 'البيزنس'} 
            style={{...btnGreen, opacity: currentPlan === 'البيزنس' ? 0.5 : 1, cursor: currentPlan === 'البيزنس' ? 'default' : 'pointer'}}
          >
            {currentPlan === 'البيزنس' ? 'نشطة حالياً' : 'تطوير للبيزنس 🚀'}
          </button>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: '40px', color: '#444', fontSize: '12px' }}>
        * يتم تفعيل الباقة يدوياً بواسطة الإدارة بعد مراجعة عملية التحويل.
      </p>
    </div>
  )
}

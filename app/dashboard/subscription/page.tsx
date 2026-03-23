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

  const refresh = async () => {
    const status = await getSubscriptionStatus()
    if (status) setCurrentPlan(status.label)
  }

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        await refresh()

        // Realtime: التحديث اللحظي عند التفعيل من الأدمن
        const channel = supabase.channel(`profile-sync-${authUser.id}`)
          .on('postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${authUser.id}` },
            () => { refresh() }
          ).subscribe()
        return () => { supabase.removeChannel(channel) }
      }
    }
    init()
  }, [])

  const handleProcess = async (pName: string, price: number) => {
    const { value: sender } = await Swal.fire({
      title: 'بيانات التحويل',
      input: 'text',
      inputLabel: `باقة ${pName} - ${price} ج.م`,
      inputPlaceholder: 'رقم المحفظة',
      showCancelButton: true,
      background: '#0a0a0a',
      color: '#d4af37',
      confirmButtonColor: '#d4af37',
    })
    if (!sender) return
    setLoading(true)
    const { error } = await supabase.from('subscriptions_requests').insert([{ user_id: user.id, plan_name: pName, amount: price, sender_number: sender, status: 'pending' }])
    if (!error) {
      setLoading(false)
      Swal.fire({ title: 'تم الطلب ✅', text: 'حول للواتساب الآن', icon: 'success', background: '#0a0a0a' }).then(() => {
        window.open(`https://wa.me/201019672878?text=تفعيل باقة ${pName}`, '_blank')
      })
    }
  }

  const Feature = ({ text }: { text: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#ccc' }}>
      <CheckCircle2 size={16} color="#d4af37" />
      <span style={{ fontSize: '14px' }}>{text}</span>
    </div>
  )

  const cardStyle = { background: '#0a0a0a', padding: '50px 40px', borderRadius: '35px', width: '330px', textAlign: 'center' as const, position: 'relative' as const, border: '1px solid #1a1a1a' };

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', padding: '40px 20px', direction: 'rtl' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#d4af37' }}>مزايا بريميوم</h1>
        <div style={{ marginTop: '20px', background: 'rgba(212, 175, 55, 0.1)', padding: '12px 30px', borderRadius: '50px', border: '1px solid #d4af3733', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          <Star size={18} color="#d4af37" />
          باقتك الحالية: <span style={{ color: '#d4af37', fontWeight: '900' }}>{currentPlan}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
        <div style={{ ...cardStyle, borderColor: currentPlan === 'الاحترافية' ? '#d4af37' : '#1a1a1a' }}>
          <Zap size={50} color="#d4af37" style={{ marginBottom: '20px' }} />
          <h2>الاحترافية</h2>
          <div style={{ fontSize: '34px', margin: '20px 0', fontWeight: '900' }}>99 ج.م</div>
          <Feature text="منتجات غير محدودة" /><Feature text="رادار العملاء" />
          <button onClick={() => handleProcess('احترافية', 99)} disabled={loading || currentPlan === 'الاحترافية'} style={{ background: 'linear-gradient(45deg, #d4af37, #fbf5b7)', color: '#000', border: 'none', padding: '18px', width: '100%', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', opacity: currentPlan === 'الاحترافية' ? 0.5 : 1 }}>
            {currentPlan === 'الاحترافية' ? 'نشطة' : 'اشترك'}
          </button>
        </div>
        <div style={{ ...cardStyle, borderColor: currentPlan === 'البيزنس' ? '#1ed760' : '#1a1a1a' }}>
          <Crown size={50} color="#1ed760" style={{ marginBottom: '20px' }} />
          <h2 style={{ color: '#1ed760' }}>البيزنس</h2>
          <div style={{ fontSize: '34px', margin: '20px 0', fontWeight: '900' }}>199 ج.م</div>
          <Feature text="كل الميزات + AI" /><Feature text="دومين خاص" />
          <button onClick={() => handleProcess('بيزنس', 199)} disabled={loading || currentPlan === 'البيزنس'} style={{ background: 'linear-gradient(45deg, #1ed760, #a2f9c1)', color: '#000', border: 'none', padding: '18px', width: '100%', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', opacity: currentPlan === 'البيزنس' ? 0.5 : 1 }}>
            {currentPlan === 'البيزنس' ? 'نشطة' : 'تطوير العضوية'}
          </button>
        </div>
      </div>
    </div>
  )
}

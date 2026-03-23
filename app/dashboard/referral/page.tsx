'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Users, Gift, Copy, Check, Share2, Award, RefreshCw, Rocket, Crown, Star } from 'lucide-react'
import Swal from 'sweetalert2'

export default function ReferralPage() {
  const supabase = createClient()
  const [data, setData] = useState({ commissions: [], total: 0 })
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      const { data: comms } = await supabase
        .from('commissions')
        .select('*, referred_user:referred_user_id(full_name, shop_name)')
        .eq('merchant_id', user.id)

      const total = comms?.reduce((acc: number, curr: any) => acc + curr.commission_amount, 0) || 0
      setData({ commissions: comms || [], total })
      setLoading(false)
    }
    loadData()
  }, [])

  const count = data.commissions.length
  const referralLink = user ? `${window.location.origin}/register?ref=${user.id}` : ''

  // حسبة العداد الذهبي
  const getProgress = () => {
    if (count < 5) return { next: 5, label: 'باقة بيزنس', percent: (count / 5) * 100, color: '#D4AF37' }
    if (count < 10) return { next: 10, label: 'باقة احترافية', percent: ((count - 5) / 5) * 100, color: '#f5e070' }
    return { next: 10, label: 'أعلى باقة فعالة', percent: 100, color: '#fff' }
  }

  const prog = getProgress()

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'تم نسخ الرابط', showConfirmButton: false, timer: 1500, background: '#111', color: '#fff' })
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><RefreshCw className="animate-spin" color="#D4AF37"/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white', fontFamily: "'IBM Plex Sans Arabic', sans-serif", direction: 'rtl' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Gift size={28} /> برنامج شركاء مزايا
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>ادعُ التجار للانضمام وارتقِ بمتجرك مجاناً</p>
      </header>

      {/* العداد الذهبي الجديد */}
      <div style={{ background: 'rgba(212,175,55,0.05)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid rgba(212,175,55,0.2)', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
          <div>
            <h4 style={{ color: '#D4AF37', fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {count >= 10 ? <Crown size={18}/> : <Rocket size={18}/>}
              {count >= 10 ? 'تهانينا! أنت في القمة' : `طريقك نحو ${prog.label}`}
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
              {count < 10 ? `فاضلك ${prog.next - count} إحالات ناجحة لتفعيل الترقية` : 'لقد فتحت جميع المميزات المتاحة'}
            </p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37' }}>{count}</span>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}> / {prog.next}</span>
          </div>
        </div>
        
        {/* شريط التحميل الميكانيكي */}
        <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ 
            width: `${prog.percent}%`, 
            height: '100%', 
            background: `linear-gradient(90deg, #B8860B, ${prog.color})`, 
            boxShadow: '0 0 15px rgba(212,175,55,0.4)',
            transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)' 
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.7rem' }}>
            <div style={{ fontSize: '0.7rem', color: count >= 5 ? '#D4AF37' : '#444', fontWeight: count >= 5 ? 800 : 400 }}>{count >= 5 ? '✅ تم فتح بيزنس' : '5 إحالات (بيزنس)'}</div>
            <div style={{ fontSize: '0.7rem', color: count >= 10 ? '#D4AF37' : '#444', fontWeight: count >= 10 ? 800 : 400 }}>{count >= 10 ? '✅ تم فتح احترافية' : '10 إحالات (احترافية)'}</div>
        </div>
      </div>

      {/* كارت الرابط */}
      <div style={{ background: 'linear-gradient(135deg, #111, #080808)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(212,175,55,0.15)', marginBottom: '2rem', textAlign: 'center' }}>
        <Award size={40} color="#D4AF37" style={{ marginBottom: '1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>رابط الإحالة الخاص بك</h3>
        <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '1.5rem' }}>عند وصولك لـ 5 إحالات ناجحة، سيتم مراجعة حسابك لترقيته آلياً</p>
        
        <div style={{ display: 'flex', background: '#050505', padding: '0.5rem', borderRadius: '12px', border: '1px solid #222', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, fontSize: '0.75rem', color: '#D4AF37', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: '10px', direction: 'ltr' }}>
            {referralLink}
          </div>
          <button onClick={copyLink} style={{ background: '#D4AF37', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
            {copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'تم' : 'نسخ'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '1.2rem', border: '1px solid #222' }}>
          <p style={{ color: '#444', fontSize: '0.75rem' }}>إجمالي أرباح الإحالة</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2ecc71' }}>{formatPrice(data.total)}</p>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '1.2rem', border: '1px solid #222' }}>
          <p style={{ color: '#444', fontSize: '0.75rem' }}>عدد التجار المسجلين</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37' }}>{count}</p>
        </div>
      </div>

      <div style={{ background: '#111', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #222', marginBottom: '3rem' }}>
        <div style={{ padding: '1.2rem', borderBottom: '1px solid #222', fontWeight: 700 }}>سجل المكافآت</div>
        {count === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>لم يقم أحد بالتسجيل عبر رابطك بعد. ابدأ المشاركة الآن!</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#080808', color: '#444', fontSize: '0.75rem' }}>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>التاجر الجديد</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>التاريخ</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>المكافأة</th>
                </tr>
              </thead>
              <tbody>
                {data.commissions.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{item.referred_user?.shop_name || 'متجر جديد'}</td>
                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: '#666' }}>{new Date(item.created_at).toLocaleDateString('ar-EG')}</td>
                    <td style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, color: '#2ecc71' }}>+{formatPrice(item.commission_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

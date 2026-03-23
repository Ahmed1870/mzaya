'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Users, Gift, Copy, Check, Share2, Award, RefreshCw } from 'lucide-react'
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

      const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()

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

  const referralLink = user ? `${window.location.origin}/register?ref=${user.id}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'تم نسخ الرابط', showConfirmButton: false, timer: 1500, background: '#111', color: '#fff' })
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><RefreshCw className="animate-spin" color="#D4AF37"/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Gift size={28} /> برنامج شركاء مزايا
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>ادعُ التجار للانضمام واحصل على مكافآت فورية</p>
      </header>

      {/* كارت الرابط */}
      <div style={{ background: 'linear-gradient(135deg, #111, #080808)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(212,175,55,0.15)', marginBottom: '2rem', textAlign: 'center' }}>
        <Award size={40} color="#D4AF37" style={{ marginBottom: '1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>رابط الإحالة الخاص بك</h3>
        <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '1.5rem' }}>شارك هذا الرابط مع تجار آخرين واحصل على 50 ج.م عن كل اشتراك جديد</p>
        
        <div style={{ display: 'flex', background: '#050505', padding: '0.5rem', borderRadius: '12px', border: '1px solid #222', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, fontSize: '0.8rem', color: '#D4AF37', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: '10px' }}>
            {referralLink}
          </div>
          <button onClick={copyLink} style={{ background: '#D4AF37', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
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
          <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37' }}>{data.commissions.length}</p>
        </div>
      </div>

      <div style={{ background: '#111', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #222' }}>
        <div style={{ padding: '1.2rem', borderBottom: '1px solid #222', fontWeight: 700 }}>سجل المكافآت</div>
        {data.commissions.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>لم يقم أحد بالتسجيل عبر رابطك بعد. ابدأ المشاركة الآن!</div>
        ) : (
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
        )}
      </div>
    </div>
  )
}

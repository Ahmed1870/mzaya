'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Plus, Eye, FileText, Search, Clock, CheckCircle2, XCircle, TrendingUp, Lock } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string, color: string, icon: any }> = {
  pending: { label: 'قيد الانتظار', color: '#D4AF37', icon: Clock },
  paid: { label: 'مدفوعة', color: '#2ecc71', icon: CheckCircle2 },
  cancelled: { label: 'ملغية', color: '#e74c3c', icon: XCircle }
}

export default function InvoicesPage() {
  const supabase = createClient()
  const [invoices, setInvoices] = useState<any[]>([])
  const [plan, setPlan] = useState('free')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadInvoices = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // جلب الفواتير ونوع الباقة في طلب واحد
    const [{ data: invs }, { data: prof }] = await Promise.all([
      supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('plan_name').eq('id', user.id).single()
    ])
    
    setInvoices(invs || [])
    setPlan(prof?.plan_name || 'free')
    setLoading(false)
  }

  useEffect(() => { loadInvoices() }, [])

  const filtered = invoices.filter(inv =>
    inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.id.includes(searchTerm)
  )

  const isPro = plan === 'احترافية' || plan === 'البيزنس'

  const stats = {
    total: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
    profit: invoices.reduce((sum, inv) => sum + (inv.net_profit || 0), 0),
    paid: invoices.filter(i => i.status === 'paid').length
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><div className="animate-spin" style={{width:30,height:30,border:'3px solid #D4AF37',borderTopColor:'transparent',borderRadius:'50%'}}/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem', direction: 'rtl' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37' }}>📄 سجل الفواتير</h1>
          <p style={{ color: '#444', fontSize: '0.85rem' }}>إدارة مبيعاتك بنظام {plan}</p>
        </div>
        <Link href="/dashboard/invoices/new" style={{ background: '#D4AF37', color: '#000', padding: '0.8rem 1.2rem', borderRadius: '12px', fontWeight: 900, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <Plus size={18} /> فاتورة جديدة
        </Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#111', padding: '1rem', borderRadius: '1.2rem', border: '1px solid #222' }}>
          <p style={{ fontSize: '0.7rem', color: '#444' }}>إجمالي المبيعات</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#D4AF37' }}>{formatPrice(stats.total)}</p>
        </div>
        <div style={{ background: '#111', padding: '1rem', borderRadius: '1.2rem', border: '1px solid #222', position: 'relative' }}>
          {!isPro && <Lock size={12} style={{ position: 'absolute', top: 10, left: 10, color: '#444' }} />}
          <p style={{ fontSize: '0.7rem', color: '#2ecc71' }}>صافي الأرباح</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 900, color: isPro ? '#2ecc71' : '#222' }}>{isPro ? formatPrice(stats.profit) : 'مقفل'}</p>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
        <input style={{ width: '100%', background: '#111', border: '1px solid #222', padding: '0.9rem 2.8rem 0.9rem 1rem', borderRadius: '15px', color: '#fff' }}
          placeholder="ابحث باسم العميل..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {filtered.map(inv => {
          const status = STATUS_MAP[inv.status] || { label: inv.status, color: '#444', icon: Clock }
          const StatusIcon = status.icon
          return (
            <Link href={`/dashboard/invoices/${inv.id}`} key={inv.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#111', padding: '1.2rem', borderRadius: '1.5rem', border: '1px solid #222' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{inv.customer_name || 'عميل نقدي'}</h3>
                    <p style={{ fontSize: '0.7rem', color: '#444' }}>#{inv.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#fff', fontWeight: 900 }}>{formatPrice(inv.total_amount)}</div>
                    {isPro && <div style={{ fontSize: '0.65rem', color: '#2ecc71' }}>ربح: {formatPrice(inv.net_profit || 0)}</div>}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

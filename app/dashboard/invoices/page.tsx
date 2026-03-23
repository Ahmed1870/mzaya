'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Plus, Eye, FileText, Search, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string, color: string, icon: any }> = {
  pending: { label: 'قيد الانتظار', color: '#D4AF37', icon: Clock },
  paid: { label: 'مدفوعة', color: '#2ecc71', icon: CheckCircle2 },
  cancelled: { label: 'ملغية', color: '#e74c3c', icon: XCircle }
}

export default function InvoicesPage() {
  const supabase = createClient()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadInvoices = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setInvoices(data || [])
    setLoading(false)
  }

  useEffect(() => { loadInvoices() }, [])

  const filtered = invoices.filter(inv => 
    inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.id.includes(searchTerm)
  )

  const stats = {
    total: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'pending').length
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><div className="animate-spin" style={{width:30,height:30,border:'3px solid #D4AF37',borderTopColor:'transparent',borderRadius:'50%'}}/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37' }}>📄 سجل الفواتير</h1>
          <p style={{ color: '#444', fontSize: '0.85rem' }}>إدارة مبيعاتك وتحصيل أموالك</p>
        </div>
        <Link href="/dashboard/invoices/new" style={{ background: '#D4AF37', color: '#000', padding: '0.8rem 1.2rem', borderRadius: '12px', fontWeight: 900, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <Plus size={18} /> فاتورة جديدة
        </Link>
      </header>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#111', padding: '1rem', borderRadius: '1.2rem', border: '1px solid #222' }}>
          <p style={{ fontSize: '0.7rem', color: '#444' }}>إجمالي المبيعات</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#D4AF37' }}>{formatPrice(stats.total)}</p>
        </div>
        <div style={{ background: '#111', padding: '1rem', borderRadius: '1.2rem', border: '1px solid #222', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.65rem', color: '#2ecc71' }}>مدفوعة: {stats.paid}</p>
            <p style={{ fontSize: '0.65rem', color: '#D4AF37' }}>معلقة: {stats.pending}</p>
          </div>
          <TrendingUp size={20} color="#222" />
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
        <input style={{ width: '100%', background: '#111', border: '1px solid #222', padding: '0.9rem 2.8rem 0.9rem 1rem', borderRadius: '15px', color: '#fff' }} 
          placeholder="ابحث برقم الفاتورة أو اسم العميل..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {/* Invoices List (Mobile Cards) */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#111', borderRadius: '2rem', border: '1px dashed #222' }}>
            <FileText size={40} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p style={{ color: '#444' }}>لا توجد فواتير مطابقة</p>
          </div>
        ) : (
          filtered.map(inv => {
            const status = STATUS_MAP[inv.status] || { label: inv.status, color: '#444', icon: Clock }
            const StatusIcon = status.icon
            return (
              <Link href={`/dashboard/invoices/${inv.id}`} key={inv.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: '#111', padding: '1.2rem', borderRadius: '1.5rem', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>{inv.customer_name || 'عميل نقدي'}</h3>
                      <p style={{ fontSize: '0.7rem', color: '#444', marginTop: '4px' }}>#{inv.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: '#fff', fontWeight: 900 }}>{formatPrice(inv.total_amount)}</div>
                      <div style={{ fontSize: '0.65rem', color: '#444' }}>{new Date(inv.created_at).toLocaleDateString('ar-EG')}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.8rem', borderTop: '1px solid #1a1a1a' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: status.color, fontSize: '0.75rem', fontWeight: 700 }}>
                      <StatusIcon size={14} /> {status.label}
                    </span>
                    <div style={{ background: '#D4AF3715', color: '#D4AF37', padding: '5px 10px', borderRadius: '8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      تفاصيل الفاتورة <Eye size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, MessageCircle, Printer, User, Package, ShieldCheck, TrendingUp } from 'lucide-react'

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [invoice, setInvoice] = useState<any>(null)
  const [plan, setPlan] = useState('free')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: inv } = await supabase.from('invoices').select('*').eq('id', params.id).single()
      const { data: itms } = await supabase.from('invoice_items').select('*').eq('invoice_id', params.id)
      const { data: prof } = await supabase.from('profiles').select('plan_name').eq('id', user?.id).single()
      
      setInvoice(inv)
      setItems(itms || [])
      setPlan(prof?.plan_name || 'free')
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><div className="animate-spin" style={{width:30,height:30,border:'3px solid #D4AF37',borderRadius:'50%'}}/></div>
  if (!invoice) return <div style={{textAlign:'center',padding:'4rem',color:'#444'}}>الفاتورة غير موجودة</div>

  const isPro = plan === 'احترافية' || plan === 'البيزنس'

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '3rem', direction: 'rtl' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={() => router.back()} style={{ background: '#111', border: 'none', color: '#666', padding: '10px', borderRadius: '12px' }}><ArrowRight size={20} /></button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => window.print()} style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '10px', borderRadius: '12px' }}><Printer size={18} /></button>
        </div>
      </header>

      <div style={{ background: '#111', padding: '1.5rem', borderRadius: '2rem', border: isPro ? '1px solid #D4AF37' : '1px solid #222', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 900, textAlign: 'center', color: '#D4AF37' }}>فاتورة مبيعات {isPro ? 'بريميوم' : ''}</h1>
        <p style={{ textAlign: 'center', color: '#444', fontSize: '0.8rem' }}>#{invoice.id.slice(0,8).toUpperCase()}</p>
        
        <div style={{ marginTop: '1.5rem', display: 'grid', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#444' }}>العميل</span>
            <span>{invoice.customer_name}</span>
          </div>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderTop: '1px solid #1a1a1a', paddingTop: '8px' }}>
              <span>{item.product_name} × {item.quantity}</span>
              <span>{formatPrice(item.total_price)}</span>
            </div>
          ))}
          <div style={{ marginTop: '1rem', borderTop: '2px dashed #222', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 900 }}>الإجمالي</span>
            <span style={{ fontWeight: 900, color: '#D4AF37', fontSize: '1.2rem' }}>{formatPrice(invoice.total_amount)}</span>
          </div>
        </div>
      </div>

      {isPro && (
        <div style={{ background: '#D4AF3710', padding: '1rem', borderRadius: '1rem', border: '1px dashed #D4AF37', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D4AF37', fontSize: '0.85rem' }}>
            <TrendingUp size={16} /> أرباحك من الفاتورة
          </div>
          <span style={{ fontWeight: 900, color: '#2ecc71' }}>{formatPrice(invoice.net_profit || 0)}</span>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#444', fontSize: '0.7rem' }}>
        <ShieldCheck size={12} /> مؤمن بنظام مزايا - باقة {plan}
      </div>
    </div>
  )
}

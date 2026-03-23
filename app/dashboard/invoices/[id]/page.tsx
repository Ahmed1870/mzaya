'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, MessageCircle, Printer, User, MapPin, Phone, Package, CheckCircle2, Clock, ShieldCheck } from 'lucide-react'

const STATUS_THEME: Record<string, any> = {
  pending: { label: 'قيد الانتظار', color: '#D4AF37', bg: '#D4AF3715' },
  paid: { label: 'مدفوعة بنجاح', color: '#2ecc71', bg: '#2ecc7115' },
  cancelled: { label: 'ملغية', color: '#e74c3c', bg: '#e74c3c15' },
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [invoice, setInvoice] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: inv } = await supabase.from('invoices').select('*').eq('id', params.id).single()
      const { data: itms } = await supabase.from('invoice_items').select('*').eq('invoice_id', params.id)
      setInvoice(inv)
      setItems(itms || [])
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><div className="animate-spin" style={{width:30,height:30,border:'3px solid #D4AF37',borderTopColor:'transparent',borderRadius:'50%'}}/></div>
  if (!invoice) return <div style={{textAlign:'center',padding:'4rem',color:'#444'}}>الفاتورة غير موجودة</div>

  const st = STATUS_THEME[invoice.status] || STATUS_THEME.pending

  const sendWhatsApp = () => {
    const itemsText = items.map(i => `• ${i.product_name} (${i.quantity} قطعة) = ${formatPrice(i.total_price)}`).join('\n')
    const msg = `🧾 *فاتورة إلكترونية من مزايا*\n*رقم الفاتورة:* #${invoice.id.slice(0,8).toUpperCase()}\n\n👤 *العميل:* ${invoice.customer_name}\n\n*الطلبات:*\n${itemsText}\n\n💰 *الإجمالي النهائي:* ${formatPrice(invoice.total_amount)}\n\nشكراً لثقتكم بنا ✨`
    window.open(`https://wa.me/${invoice.customer_phone?.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '3rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={() => router.back()} style={{ background: '#111', border: 'none', color: '#666', padding: '10px', borderRadius: '12px' }}><ArrowRight size={20} /></button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => window.print()} style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '10px', borderRadius: '12px' }}><Printer size={18} /></button>
          <button onClick={sendWhatsApp} style={{ background: '#25D366', border: 'none', color: '#fff', padding: '10px', borderRadius: '12px' }}><MessageCircle size={18} /></button>
        </div>
      </header>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: '99px', background: st.bg, color: st.color, fontSize: '0.75rem', fontWeight: 900, border: `1px solid ${st.color}40`, marginBottom: '10px' }}>
          {st.label}
        </div>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>فاتورة مبيعات مزايا</h1>
        <p style={{ color: '#444', fontSize: '0.8rem', marginTop: '5px' }}>رقم مراجعة: #{invoice.id.slice(0,8).toUpperCase()}</p>
      </div>

      <div style={{ display: 'grid', gap: '1.2rem' }}>
        {/* Customer Card */}
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D4AF37', marginBottom: '1.2rem', fontSize: '0.85rem', fontWeight: 800 }}><User size={16} /> بيانات العميل</div>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#444', fontSize: '0.85rem' }}>الاسم الكامل</span>
              <span style={{ fontWeight: 700 }}>{invoice.customer_name}</span>
            </div>
            {invoice.customer_phone && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#444', fontSize: '0.85rem' }}>رقم الهاتف</span>
                <span style={{ color: '#D4AF37' }}>{invoice.customer_phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items Card */}
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D4AF37', marginBottom: '1.2rem', fontSize: '0.85rem', fontWeight: 800 }}><Package size={16} /> تفاصيل المنتجات</div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#080808', borderRadius: '15px', border: '1px solid #1a1a1a' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{item.product_name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#444' }}>الكمية: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 900, color: '#D4AF37' }}>{formatPrice(item.total_price)}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px dashed #222', display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: '0.85rem' }}>
              <span>إجمالي المنتجات</span>
              <span>{formatPrice(items.reduce((s,i)=>s+Number(i.total_price), 0))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: '0.85rem' }}>
              <span>تكلفة الشحن</span>
              <span>{formatPrice(invoice.shipping_cost || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>الإجمالي النهائي</span>
              <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#D4AF37' }}>{formatPrice(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.75rem' }}>
          <ShieldCheck size={14} /> مؤمن بنظام مزايا الذكي
        </div>
      </div>
    </div>
  )
}

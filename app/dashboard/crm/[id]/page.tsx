'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, Phone, MapPin, MessageCircle, ShoppingBag } from 'lucide-react'

export default function CustomerPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [orders, setOrders] = useState<any[]>([])
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const identifier = decodeURIComponent(params.id as string)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('invoices')
        .select('*, invoice_items(*)')
        .eq('user_id', user.id)
        .or(`customer_phone.eq.${identifier},customer_name.eq.${identifier}`)
        .order('created_at', { ascending: false })
      const inv = data || []
      if (inv.length > 0) {
        const totalSpent = inv.filter((i:any) => i.status==='paid').reduce((s:number,i:any) => s+Number(i.total_amount), 0)
        const returned = inv.filter((i:any) => i.order_status==='returned').length
        const tier = returned > 0 ? 'risk' : inv.length >= 5 ? 'gold' : inv.length >= 2 ? 'silver' : 'bronze'
        setCustomer({ name:inv[0].customer_name, phone:inv[0].customer_phone, address:inv[0].customer_address, totalOrders:inv.length, totalSpent, returned, tier })
      }
      setOrders(inv)
      setLoading(false)
    }
    load()
  }, [identifier])

  const TIER_MAP: Record<string,any> = {
    gold:{label:'Gold VIP',color:'#D4AF37',icon:'⭐',glow:true},
    silver:{label:'Silver',color:'#9ca3af',icon:'🥈',glow:false},
    bronze:{label:'عميل جديد',color:'#92400e',icon:'🥉',glow:false},
    risk:{label:'خطر',color:'#e74c3c',icon:'⚠️',glow:false},
  }

  const STATUS_MAP: Record<string,any> = {
    processing:{label:'قيد التجهيز',color:'#f59e0b',icon:'🛠️'},
    out_for_delivery:{label:'مع المندوب',color:'#4361ee',icon:'🛵'},
    delivered:{label:'تم التسليم',color:'#2ecc71',icon:'✅'},
    returned:{label:'مرتجع',color:'#e74c3c',icon:'⚠️'},
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div style={{width:32,height:32,border:'2px solid rgba(212,175,55,0.2)',borderTopColor:'#D4AF37',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
    </div>
  )

  if (!customer) return (
    <div style={{textAlign:'center',padding:'4rem'}}>
      <p style={{color:'rgba(255,255,255,0.3)'}}>لم يتم العثور على العميل</p>
      <button onClick={() => router.back()} className="btn-secondary" style={{marginTop:'1rem'}}>رجوع</button>
    </div>
  )

  const tier = TIER_MAP[customer.tier]

  return (
    <div className="animate-fade-up" style={{display:'grid',gap:'1.5rem'}}>
      <button onClick={() => router.back()} style={{display:'flex',alignItems:'center',gap:'.4rem',background:'none',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:'.875rem',fontFamily:"'IBM Plex Sans Arabic',sans-serif",width:'fit-content'}}>
        <ArrowRight size={15}/> رجوع للعملاء
      </button>

      <div style={{background:'#0A0A0A',border:`1px solid ${tier.glow?'rgba(212,175,55,0.25)':'rgba(255,255,255,0.08)'}`,borderRadius:'1.5rem',padding:'1.5rem',boxShadow:tier.glow?'0 0 30px rgba(212,175,55,0.08)':'none',position:'relative',overflow:'hidden'}}>
        {tier.glow && <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,transparent,#D4AF37,transparent)'}}/>}
        <div style={{display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
          <div style={{width:60,height:60,borderRadius:'50%',background:tier.glow?'linear-gradient(135deg,rgba(212,175,55,0.2),rgba(212,175,55,0.05))':'rgba(255,255,255,0.05)',border:`2px solid ${tier.glow?'rgba(212,175,55,0.4)':'rgba(255,255,255,0.1)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Tajawal,sans-serif',fontWeight:900,fontSize:'1.5rem',color:tier.glow?'#D4AF37':'rgba(255,255,255,0.5)',flexShrink:0}}>
            {customer.name[0]}
          </div>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:'.75rem',marginBottom:'.4rem',flexWrap:'wrap'}}>
              <h2 style={{fontFamily:'Tajawal,sans-serif',fontWeight:900,fontSize:'1.3rem',color:tier.glow?'#D4AF37':'white',margin:0}}>{customer.name}</h2>
              <span style={{padding:'.2rem .65rem',borderRadius:'99px',background:tier.glow?'rgba(212,175,55,0.12)':'rgba(255,255,255,0.06)',color:tier.color,fontSize:'.78rem',fontWeight:700}}>{tier.icon} {tier.label}</span>
            </div>
            <div style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
              {customer.phone && <span style={{display:'flex',alignItems:'center',gap:'.3rem',fontSize:'.82rem',color:'rgba(255,255,255,0.4)'}}><Phone size={12}/>{customer.phone}</span>}
              {customer.address && <span style={{display:'flex',alignItems:'center',gap:'.3rem',fontSize:'.82rem',color:'rgba(255,255,255,0.4)'}}><MapPin size={12}/>{customer.address}</span>}
            </div>
          </div>
          {customer.phone && (
            <a href={`https://wa.me/${customer.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:'.4rem',padding:'.6rem 1rem',borderRadius:'.75rem',background:'rgba(37,211,102,0.1)',color:'#25d366',border:'1px solid rgba(37,211,102,0.2)',textDecoration:'none',fontSize:'.85rem',fontWeight:600,fontFamily:"'IBM Plex Sans Arabic',sans-serif"}}>
              <MessageCircle size={14}/> واتساب
            </a>
          )}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginTop:'1.25rem',paddingTop:'1.25rem',borderTop:'1px solid rgba(255,255,255,0.04)'}}>
          {[
            {label:'إجمالي الطلبات',value:customer.totalOrders,color:tier.glow?'#D4AF37':'white'},
            {label:'إجمالي المشتريات',value:formatPrice(customer.totalSpent),color:'#2ecc71'},
            {label:'مرتجعات',value:customer.returned,color:customer.returned>0?'#e74c3c':'rgba(255,255,255,0.3)'},
          ].map((s,i) => (
            <div key={i} style={{textAlign:'center'}}>
              <div style={{fontFamily:'Tajawal,sans-serif',fontWeight:900,fontSize:'1.3rem',color:s.color,wordBreak:'break-all'}}>{s.value}</div>
              <div style={{fontSize:'.7rem',color:'rgba(255,255,255,0.3)',marginTop:'.2rem'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:'#0A0A0A',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'1.25rem',overflow:'hidden'}}>
        <div style={{padding:'1rem 1.25rem',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:'.5rem'}}>
          <ShoppingBag size={15} color="#D4AF37"/>
          <h3 style={{fontFamily:'Tajawal,sans-serif',fontWeight:700,color:'white',margin:0,fontSize:'.9rem'}}>سجل الطلبات ({orders.length})</h3>
        </div>
        <div style={{display:'grid',gap:'.75rem',padding:'1rem'}}>
          {orders.map(order => {
            const st = STATUS_MAP[order.order_status||'processing']||STATUS_MAP.processing
            return (
              <div key={order.id} style={{background:'rgba(255,255,255,0.03)',borderRadius:'.85rem',padding:'1rem',border:'1px solid rgba(255,255,255,0.04)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'.6rem',flexWrap:'wrap',gap:'.4rem'}}>
                  <span style={{fontFamily:'monospace',color:'#D4AF37',fontWeight:600,fontSize:'.82rem'}}>#{order.id.slice(0,8).toUpperCase()}</span>
                  <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
                    <span style={{fontSize:'.72rem',color:st.color,fontWeight:600}}>{st.icon} {st.label}</span>
                    <span style={{fontSize:'.72rem',color:'rgba(255,255,255,0.3)'}}>{new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
                {(order.invoice_items||[]).map((item:any,i:number) => (
                  <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'.78rem',color:'rgba(255,255,255,0.5)',marginBottom:'.2rem'}}>
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>{formatPrice(item.total_price)}</span>
                  </div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',paddingTop:'.5rem',borderTop:'1px solid rgba(255,255,255,0.04)',marginTop:'.4rem'}}>
                  <span style={{fontSize:'.8rem',color:'rgba(255,255,255,0.3)'}}>الإجمالي</span>
                  <span style={{fontWeight:700,color:'#D4AF37',fontSize:'.875rem'}}>{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

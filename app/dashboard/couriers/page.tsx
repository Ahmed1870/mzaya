'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Plus, Trash2, Bike, Wallet, TrendingUp, Percent, Phone, UserPlus, Info } from 'lucide-react'

export default function CouriersPage() {
  const supabase = createClient()
  const [couriers, setCouriers] = useState<any[]>([])
  const [wallet, setWallet] = useState<any>(null)
  const [form, setForm] = useState({ name:'', phone:'', commission_rate:'0' })
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: c }, { data: w }] = await Promise.all([
      supabase.from('couriers').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('wallet').select('*').eq('user_id', user.id).single(),
    ])
    setCouriers(c || [])
    setWallet(w)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addCourier = async () => {
    if (!form.name.trim()) return
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    let phone = form.phone.replace(/\s/g,'')
    if (phone.startsWith('0')) phone = '+2' + phone
    else if (phone && !phone.startsWith('+')) phone = '+2' + phone
    await supabase.from('couriers').insert({
      name: form.name,
      phone: phone || null,
      commission_rate: parseFloat(form.commission_rate) || 0,
      user_id: user!.id
    })
    setForm({ name:'', phone:'', commission_rate:'0' })
    await load()
    setAdding(false)
  }

  const deleteCourier = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المندوب؟')) return
    await supabase.from('couriers').delete().eq('id', id)
    load()
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div style={{width:35,height:35,border:'3px solid rgba(212,175,55,0.1)',borderTopColor:'#D4AF37',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div className="animate-fade-up" style={{maxWidth:'800px', margin:'0 auto', paddingBottom:'4rem'}}>
      <h1 className="page-title" style={{marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'.75rem'}}>
        <Bike className="text-gold" size={28}/> إدارة المناديب والخزنة
      </h1>

      <div style={{display:'grid', gap:'1.5rem'}}>
        
        {/* Wallet Section - الروح البنكية */}
        <div style={{
          background: 'linear-gradient(135deg, #0A0A0A 0%, #151515 100%)',
          borderRadius: '24px', padding: '2rem', border: '1px solid rgba(212,175,55,0.15)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{position:'absolute', top:'-20%', left:'-10%', fontSize:'10rem', opacity:0.03, color:'#D4AF37'}}><Wallet/></div>
          
          <div style={{textAlign:'center', position:'relative', zIndex:1}}>
            <p style={{color:'rgba(255,255,255,0.5)', fontSize:'.9rem', marginBottom:'.5rem', fontWeight:600}}>الرصيد المتاح في الخزنة</p>
            <h2 style={{fontFamily:'Tajawal,sans-serif', fontWeight:900, fontSize:'2.5rem', color:'#D4AF37', margin:0}}>
              {formatPrice(wallet?.balance || 0)}
            </h2>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginTop:'2rem', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'1.5rem'}}>
            <div style={{textAlign:'center'}}>
              <p style={{color:'#2ecc71', fontSize:'.75rem', fontWeight:700, marginBottom:'.25rem'}}>إجمالي الإيراد</p>
              <p style={{color:'white', fontWeight:800, fontSize:'1.1rem'}}>{formatPrice(wallet?.total_revenue || 0)}</p>
            </div>
            <div style={{textAlign:'center', borderRight:'1px solid rgba(255,255,255,0.05)'}}>
              <p style={{color:'#e74c3c', fontSize:'.75rem', fontWeight:700, marginBottom:'.25rem'}}>عمولات خرجت</p>
              <p style={{color:'white', fontWeight:800, fontSize:'1.1rem'}}>{formatPrice(wallet?.total_commissions || 0)}</p>
            </div>
          </div>
        </div>

        {/* Add Courier - Form optimized for Mobile Keyboard */}
        <div className="card" style={{padding:'1.5rem', border:'1px solid rgba(255,255,255,0.05)'}}>
          <div style={{display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'1.5rem'}}>
             <UserPlus size={20} className="text-gold"/>
             <h3 style={{fontFamily:'Tajawal,sans-serif', fontWeight:700, color:'white', margin:0}}>إضافة مندوب جديد</h3>
          </div>
          <div style={{display:'grid', gap:'1rem'}}>
            <div style={{position:'relative'}}>
              <input className="input" style={{paddingRight:'2.5rem'}} placeholder="اسم المندوب (مثلاً: الكابتن محمد)" value={form.name}
                onChange={e=>setForm({...form,name:e.target.value})}/>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'.75rem'}}>
              <input className="input" placeholder="رقم الموبايل" value={form.phone}
                onChange={e=>setForm({...form,phone:e.target.value})}/>
              <div style={{position:'relative'}}>
                <input className="input" type="number" placeholder="العمولة" value={form.commission_rate}
                  onChange={e=>setForm({...form,commission_rate:e.target.value})}/>
                <span style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.3)', fontSize:'.8rem'}}>%</span>
              </div>
            </div>
            <button onClick={addCourier} disabled={adding||!form.name} className="btn-primary" style={{height:'50px', borderRadius:'14px', fontSize:'1rem', fontWeight:800}}>
              {adding ? 'جاري الحفظ...' : 'اتمام الإضافة'}
            </button>
          </div>
        </div>

        {/* Couriers List - "الروح" Cards */}
        <div style={{display:'grid', gap:'1rem'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 .5rem'}}>
            <h3 style={{fontFamily:'Tajawal,sans-serif', fontWeight:800, color:'white', margin:0, fontSize:'1.1rem'}}>طاقم التوصيل</h3>
            <span style={{fontSize:'.8rem', color:'rgba(255,255,255,0.4)'}}>{couriers.length} مناديب</span>
          </div>

          {couriers.length === 0 ? (
            <div className="card" style={{padding:'3rem', textAlign:'center', borderStyle:'dashed'}}>
              <Bike size={40} style={{margin:'0 auto 1rem', opacity:0.1}}/>
              <p style={{color:'rgba(255,255,255,0.3)'}}>لم يتم إضافة مناديب بعد</p>
            </div>
          ) : (
            <div style={{display:'grid', gap:'1rem'}}>
              {couriers.map(c => (
                <div key={c.id} className="card animate-fade-up" style={{
                  padding:'1rem', display:'flex', alignItems:'center', 
                  gap:'1rem', background:'rgba(255,255,255,0.02)', 
                  border:'1px solid rgba(255,255,255,0.05)', borderRadius:'20px'
                }}>
                  <div style={{
                    width:50, height:50, borderRadius:'15px', 
                    background:'linear-gradient(45deg, #D4AF37, #b8860b)', 
                    display:'flex', alignItems:'center', justifyContent:'center', 
                    color:'black', flexShrink:0, boxShadow:'0 10px 20px rgba(212,175,55,0.15)'
                  }}>
                    <Bike size={24}/>
                  </div>
                  
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', alignItems:'center', gap:'.5rem'}}>
                      <p style={{fontWeight:800, color:'white', fontSize:'1rem', margin:0}}>{c.name}</p>
                      <span style={{width:8, height:8, borderRadius:'50%', background:'#2ecc71', boxShadow:'0 0 10px #2ecc71'}}></span>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'.75rem', marginTop:'.25rem'}}>
                      <span style={{fontSize:'.8rem', color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', gap:'.3rem'}}>
                        <Phone size={12}/> {c.phone || 'بدون رقم'}
                      </span>
                      <span style={{fontSize:'.8rem', color:'#D4AF37', fontWeight:700, background:'rgba(212,175,55,0.1)', padding:'0 .5rem', borderRadius:'5px'}}>
                        عمولة {c.commission_rate}%
                      </span>
                    </div>
                  </div>

                  <button onClick={()=>deleteCourier(c.id)} style={{
                    background:'rgba(231,76,60,0.1)', border:'none', 
                    color:'#e74c3c', width:40, height:40, borderRadius:'12px', 
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'0.3s'
                  }}>
                    <Trash2 size={18}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tip Box */}
        <div style={{background:'rgba(67,97,238,0.05)', border:'1px solid rgba(67,97,238,0.1)', borderRadius:'18px', padding:'1rem', display:'flex', gap:'.75rem', alignItems:'flex-start'}}>
           <Info className="text-blue" size={20} style={{marginTop:'2px', flexShrink:0}}/>
           <p style={{fontSize:'.8rem', color:'rgba(255,255,255,0.5)', margin:0, lineHeight:1.5}}>
             <b>نصيحة:</b> نظام مزايا بيحسب عمولة المندوب أوتوماتيك ويخصمها من الإيراد بمجرد ما الأوردر يتحول لـ "تم التسليم". الصافي هيدخل خزنتك هنا فوراً!
           </p>
        </div>
      </div>
    </div>
  )
             }
                

'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle, X, CheckCircle2, MapPin, Phone, User } from 'lucide-react'

interface CartItem { product: any; quantity: number }

export function StoreClient({ profile, products }: { profile: any; products: any[] }) {
  const supabase = createClient()
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showOrder, setShowOrder] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState({ name:'', phone:'', address:'' })
  const [ordered, setOrdered] = useState(false)

  // توحيد مسمى المتجر من الإعدادات الجديدة
  const shopName = profile.business_name || profile.shop_name || 'متجر مزايا'

  const addToCart = (product: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id)
      if (ex) return prev.map(i => i.product.id === product.id ? {...i, quantity: i.quantity+1} : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.product.id !== id))
    else setCart(prev => prev.map(i => i.product.id === id ? {...i, quantity: qty} : i))
  }

  const total = cart.reduce((s, i) => s + (i.product.price * i.quantity), 0)
  const count = cart.reduce((s, i) => s + i.quantity, 0)

  const handleOrder = async () => {
    if (!customer.name || !customer.phone) return
    setLoading(true)

    try {
      // 1. تسجيل الطلب في قاعدة البيانات (لربط الداشبورد)
      const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
        user_id: profile.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        total_amount: total,
        status: 'pending',
        items: cart.map(i => ({
          product_id: i.product.id,
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.price
        }))
      }]).select().single()

      if (orderError) throw orderError

      // 2. تجهيز رسالة الواتساب
      const itemsMsg = cart.map(i => `• ${i.product.name} [${i.quantity} قطعة]`).join('\n')
      const msg = `🛍️ *طلب جديد من متجر: ${shopName}*\n\n👤 *العميل:* ${customer.name}\n📞 *الهاتف:* ${customer.phone}\n📍 *العنوان:* ${customer.address || 'لم يحدد'}\n\n📦 *الطلبات:*\n${itemsMsg}\n\n💰 *الإجمالي:* ${formatPrice(total)}\n\n📌 *رقم الطلب:* #${orderData.id.split('-')[0]}\n✅ *تم الطلب عبر منصة مزايا*`
      
      const phone = (profile.phone || '').replace(/\D/g, '')
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')

      setOrdered(true)
      setCart([])
      setShowOrder(false)
    } catch (err) {
      alert('حدث خطأ أثناء تسجيل الطلب، يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{fontFamily:"'IBM Plex Sans Arabic',sans-serif", background:'#f8fafc', minHeight:'100vh', direction:'rtl'}}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      
      <header style={{background:'white', borderBottom:'1px solid #e2e8f0', position:'sticky', top:0, zIndex:50}}>
        <div style={{maxWidth:640, margin:'0 auto', padding:'.85rem 1rem', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:'.75rem'}}>
            <div style={{width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#D4AF37,#c9a227)', display:'flex', alignItems:'center', justifyContent:'center', color:'#020202', fontWeight:900}}>
              {shopName[0]}
            </div>
            <div>
              <div style={{fontWeight:700, fontSize:'1rem'}}>{shopName}</div>
              <div style={{fontSize:'.72rem', color:'#64748b'}}>{products.length} منتج متوفر</div>
            </div>
          </div>
          <button onClick={() => setShowCart(true)} style={{position:'relative', background:'#D4AF37', border:'none', borderRadius:'50%', width:44, height:44, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <ShoppingCart size={20} color="#020202"/>
            {count > 0 && <span style={{position:'absolute', top:-4, left:-4, background:'#e74c3c', color:'white', borderRadius:'50%', width:20, height:20, fontSize:'.68rem', display:'flex', alignItems:'center', justifyContent:'center'}}>{count}</span>}
          </button>
        </div>
      </header>

      <main style={{maxWidth:640, margin:'0 auto', padding:'1rem'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1rem'}}>
          {products.map(product => (
            <div key={product.id} style={{background:'white', borderRadius:'1.2rem', overflow:'hidden', border:'1px solid #e2e8f0', boxShadow:'0 2px 4px rgba(0,0,0,0.02)'}}>
              <div style={{aspectRatio:'1', background:'#f1f5f9', position:'relative'}}>
                {product.image_url ? 
                  <img src={product.image_url} alt={product.name} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : 
                  <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem'}}>📦</div>
                }
              </div>
              <div style={{padding:'.75rem'}}>
                <div style={{fontWeight:600, fontSize:'.85rem', marginBottom:'.5rem', height:'2.4rem', overflow:'hidden'}}>{product.name}</div>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div style={{fontWeight:800, color:'#D4AF37', fontSize:'0.9rem'}}>{formatPrice(product.price)}</div>
                  <button onClick={() => addToCart(product)} style={{background:'#D4AF37', border:'none', borderRadius:'.6rem', width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <Plus size={16} color="#020202"/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Modal */}
      {showCart && (
        <div style={{position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'flex-end'}}>
          <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,.6)', backdropFilter:'blur(4px)'}} onClick={() => setShowCart(false)}/>
          <div style={{position:'relative', width:'100%', maxWidth:640, margin:'0 auto', background:'white', borderRadius:'2rem 2rem 0 0', padding:'1.5rem', maxHeight:'85vh', overflowY:'auto'}}>
            <div style={{width:40, height:4, background:'#e2e8f0', borderRadius:2, margin:'0 auto 1.5rem'}} />
            <h3 style={{fontWeight:800, fontSize:'1.2rem', marginBottom:'1.5rem', textAlign:'center'}}>سلة المشتريات 🛒</h3>
            
            {cart.length === 0 ? (
              <div style={{textAlign:'center', padding:'3rem 0', color:'#64748b'}}>السلة فارغة، ابدأ بالتسوق!</div>
            ) : (
              <>
                {cart.map(({product, quantity}) => (
                  <div key={product.id} style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem', padding:'1rem', background:'#f8fafc', borderRadius:'1rem', border:'1px solid #f1f5f9'}}>
                    <div style={{flex:1, fontWeight:600, fontSize:'0.9rem'}}>{product.name}</div>
                    <div style={{display:'flex', alignItems:'center', gap:'0.8rem', background:'white', padding:'5px 12px', borderRadius:'99px', border:'1px solid #e2e8f0'}}>
                      <button onClick={() => updateQty(product.id, quantity-1)} style={{border:'none', background:'none', color:'#e74c3c', fontWeight:900}}><Minus size={14}/></button>
                      <span style={{fontWeight:700, minWidth:20, textAlign:'center'}}>{quantity}</span>
                      <button onClick={() => updateQty(product.id, quantity+1)} style={{border:'none', background:'none', color:'#2ecc71', fontWeight:900}}><Plus size={14}/></button>
                    </div>
                  </div>
                ))}
                <div style={{marginTop:'1.5rem', padding:'1.2rem', background:'linear-gradient(135deg, #fffbeb, #fef3c7)', borderRadius:'1rem', fontWeight:800, textAlign:'center', border:'1px dashed #D4AF37'}}>
                  الإجمالي: {formatPrice(total)}
                </div>
                <button onClick={() => {setShowCart(false); setShowOrder(true)}} style={{width:'100%', background:'#D4AF37', color:'#000', padding:'1.2rem', borderRadius:'1.2rem', border:'none', marginTop:'1.2rem', fontWeight:800, fontSize:'1rem'}}>استكمال الطلب</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Form Modal */}
      {showOrder && (
        <div style={{position:'fixed', inset:0, zIndex:101, display:'flex', alignItems:'flex-end'}}>
          <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,.6)', backdropFilter:'blur(4px)'}} onClick={() => setShowOrder(false)}/>
          <div style={{position:'relative', width:'100%', maxWidth:640, margin:'0 auto', background:'white', borderRadius:'2rem 2rem 0 0', padding:'2rem'}}>
            <h3 style={{fontWeight:800, marginBottom:'1.5rem', textAlign:'center'}}>بيانات التوصيل 🚚</h3>
            <div style={{display:'grid', gap:'1rem'}}>
              <div style={{position:'relative'}}><User size={18} style={{position:'absolute', right:12, top:16, color:'#94a3b8'}}/><input placeholder="الاسم الكامل" style={{width:'100%', padding:'1rem 2.8rem 1rem 1rem', borderRadius:'1rem', border:'1px solid #e2e8f0', background:'#f8fafc'}} value={customer.name} onChange={e=>setCustomer({...customer, name:e.target.value})} /></div>
              <div style={{position:'relative'}}><Phone size={18} style={{position:'absolute', right:12, top:16, color:'#94a3b8'}}/><input placeholder="رقم الهاتف" style={{width:'100%', padding:'1rem 2.8rem 1rem 1rem', borderRadius:'1rem', border:'1px solid #e2e8f0', background:'#f8fafc'}} value={customer.phone} onChange={e=>setCustomer({...customer, phone:e.target.value})} /></div>
              <div style={{position:'relative'}}><MapPin size={18} style={{position:'absolute', right:12, top:16, color:'#94a3b8'}}/><input placeholder="عنوان التوصيل (اختياري)" style={{width:'100%', padding:'1rem 2.8rem 1rem 1rem', borderRadius:'1rem', border:'1px solid #e2e8f0', background:'#f8fafc'}} value={customer.address} onChange={e=>setCustomer({...customer, address:e.target.value})} /></div>
              <button disabled={loading} onClick={handleOrder} style={{width:'100%', background:'#25d366', color:'white', padding:'1.2rem', borderRadius:'1.2rem', border:'none', fontWeight:800, fontSize:'1.1rem', marginTop:'1rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                {loading ? 'جاري التأكيد...' : <><MessageCircle size={20}/> تأكيد وإرسال لواتساب</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {ordered && (
        <div style={{position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{background:'white', padding:'2.5rem', borderRadius:'2.5rem', textAlign:'center', maxWidth:320, border:'2px solid #25d366'}}>
            <div style={{width:80, height:80, background:'#ecfdf5', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem'}}><CheckCircle2 size={48} color="#25d366"/></div>
            <h3 style={{fontWeight:900, fontSize:'1.3rem', marginBottom:'0.5rem'}}>تم إرسال طلبك!</h3>
            <p style={{color:'#64748b', fontSize:'0.85rem', lineHeight:'1.5'}}>تم تسجيل طلبك في النظام وسيتم توجيهك الآن للمحادثة مع التاجر.</p>
            <button onClick={() => setOrdered(false)} style={{marginTop:'2rem', width:'100%', padding:'0.8rem', borderRadius:'1rem', border:'1px solid #e2e8f0', background:'#f8fafc', fontWeight:700}}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  )
}

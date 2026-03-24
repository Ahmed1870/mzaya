'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Plus, Minus, MessageCircle, CheckCircle2, MapPin, Phone, User, X } from 'lucide-react'
import Swal from 'sweetalert2'

interface CartItem { product: any; quantity: number }

export function StoreClient({ profile, products }: { profile: any; products: any[] }) {
  const supabase = createClient()
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showOrder, setShowOrder] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState({ name:'', phone:'', address:'' })
  const [ordered, setOrdered] = useState(false)

  const shopName = profile.shop_name || 'متجر مزايا'

  const addToCart = (product: any) => {
    if (product.stock <= 0) {
      Swal.fire({ icon: 'error', title: 'نفذت الكمية', text: 'للأسف هذا المنتج غير متوفر حالياً', background: '#fff', color: '#000', confirmButtonColor: '#D4AF37' })
      return
    }
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
    if (!customer.name || !customer.phone) {
      Swal.fire({ icon: 'warning', title: 'بيانات ناقصة', text: 'برجاء كتابة اسمك ورقم تليفونك لتأكيد الطلب', confirmButtonColor: '#D4AF37' })
      return
    }
    setLoading(true)

    try {
      const { data: orderData, error: orderError } = await supabase.from('invoices').insert([{
        user_id: profile.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        total_amount: total,
        status: 'pending',
        notes: `طلب من المتجر: ${cart.map(i => i.product.name).join(', ')}`
      }]).select().single()

      if (orderError) throw orderError

      for (const item of cart) {
        const newStock = Math.max(0, (item.product.stock || 0) - item.quantity)
        await supabase.from('products').update({ stock: newStock }).eq('id', item.product.id)
      }

      await supabase.from('notifications').insert([{
        user_id: profile.id,
        title: '📦 أوردر جديد!',
        message: `لديك طلب جديد من ${customer.name} بقيمة ${formatPrice(total)}`,
        type: 'order'
      }])

      const itemsMsg = cart.map(i => `• ${i.product.name} [${i.quantity} قطعة]`).join('\n')
      const msg = `🛍️ *طلب جديد من متجر: ${shopName}*\n\n👤 *العميل:* ${customer.name}\n📞 *الهاتف:* ${customer.phone}\n📍 *العنوان:* ${customer.address || 'لم يحدد'}\n\n📦 *الطلبات:*\n${itemsMsg}\n\n💰 *الإجمالي:* ${formatPrice(total)}\n\n✅ *تم الطلب عبر منصة مزايا*`
      const waPhone = (profile.phone || '').replace(/\D/g, '')
      window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank')

      setOrdered(true)
      setCart([])
      setShowOrder(false)
      setShowCart(false)
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'عذراً', text: 'حدث خطأ أثناء معالجة طلبك' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{fontFamily:"'IBM Plex Sans Arabic',sans-serif", background:'#f8fafc', minHeight:'100vh', direction:'rtl'}}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* Header */}
      <header style={{background:'white', borderBottom:'1px solid #e2e8f0', position:'sticky', top:0, zIndex:100}}>
        <div style={{maxWidth:640, margin:'0 auto', padding:'.85rem 1rem', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:'.75rem'}}>
            <div style={{width:40, height:40, borderRadius:'50%', background:'#000', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontWeight:900}}>{shopName[0]}</div>
            <div style={{color: '#000'}}>
              <div style={{fontWeight:700, fontSize:'1rem'}}>{shopName}</div>
              <div style={{fontSize:'.72rem', color:'#64748b'}}>{products.length} منتج متوفر</div>
            </div>
          </div>
          <button onClick={() => setShowCart(true)} style={{position:'relative', background:'#D4AF37', border:'none', borderRadius:'12px', width:44, height:44, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <ShoppingCart size={20} color="#000"/>
            {count > 0 && <span style={{position:'absolute', top:-5, left:-5, background:'#e74c3c', color:'white', borderRadius:'50%', width:20, height:20, fontSize:'.68rem', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid white'}}>{count}</span>}
          </button>
        </div>
      </header>

      {/* Products Grid */}
      <main style={{maxWidth:640, margin:'0 auto', padding:'1rem'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1rem'}}>
          {products.map(product => (
            <div key={product.id} style={{background:'white', borderRadius:'1.2rem', overflow:'hidden', border:'1px solid #e2e8f0'}}>
              <div style={{aspectRatio:'1', background:'#f1f5f9'}}>
                {product.image_url ? <img src={product.image_url} alt={product.name} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem'}}>📦</div>}
              </div>
              <div style={{padding:'.75rem'}}>
                <div style={{fontWeight:600, fontSize:'.85rem', height:'2.4rem', overflow:'hidden', color: '#000'}}>{product.name}</div>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'.5rem'}}>
                  <div style={{fontWeight:800, color:'#D4AF37'}}>{formatPrice(product.price)}</div>
                  <button onClick={() => addToCart(product)} disabled={product.stock <= 0} style={{background: product.stock <= 0 ? '#eee' : '#D4AF37', border:'none', borderRadius:'.6rem', width:32, height:32, cursor:'pointer'}}><Plus size={16} color="#000"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Modal - FIX: Black text colors for visibility */}
      {showCart && (
        <div style={{position:'fixed', inset:0, zIndex:999, display:'flex', alignItems:'flex-end', justifyContent:'center'}}>
          <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,.7)', backdropFilter:'blur(4px)'}} onClick={() => setShowCart(false)}/>
          <div style={{position:'relative', width:'100%', maxWidth:640, background:'white', borderRadius:'2rem 2rem 0 0', padding:'2rem', maxHeight:'80vh', overflowY:'auto'}}>
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                <h3 style={{fontWeight:900, fontSize:'1.2rem', color: '#000'}}>سلة المشتريات 🛒</h3>
                <X onClick={() => setShowCart(false)} style={{cursor:'pointer', color: '#000'}}/>
             </div>
             {cart.length === 0 ? <div style={{textAlign:'center', padding:'3rem', color:'#64748b'}}>السلة فارغة</div> : (
               <>
                {cart.map(({product, quantity}) => (
                  <div key={product.id} style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem', padding:'1rem', background:'#f8fafc', borderRadius:'1rem', border: '1px solid #eee'}}>
                    <div style={{flex:1, fontWeight:700, color: '#000'}}>{product.name}</div>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', background:'white', padding:'8px 12px', borderRadius:'12px', border:'1px solid #ddd'}}>
                      <Minus size={16} onClick={() => updateQty(product.id, quantity-1)} style={{cursor:'pointer', color:'#e74c3c'}}/>
                      <span style={{fontWeight:800, color: '#000', minWidth: '20px', textAlign: 'center'}}>{quantity}</span>
                      <Plus size={16} onClick={() => updateQty(product.id, quantity+1)} style={{cursor:'pointer', color:'#2ecc71'}}/>
                    </div>
                  </div>
                ))}
                <div style={{marginTop:'1.5rem', padding:'1.2rem', background:'#fffbeb', borderRadius:'1.2rem', fontWeight:900, textAlign:'center', border:'2px dashed #D4AF37', color: '#D4AF37', fontSize: '1.1rem'}}>
                   إجمالي السعر: {formatPrice(total)}
                </div>
                <button onClick={() => {setShowCart(false); setShowOrder(true)}} style={{width:'100%', background:'#000', color:'#D4AF37', padding:'1.3rem', borderRadius:'1.5rem', border:'none', marginTop:'1.5rem', fontWeight:900, fontSize:'1.1rem'}}>استكمال بيانات التوصيل</button>
               </>
             )}
          </div>
        </div>
      )}

      {/* Order Form Modal */}
      {showOrder && (
        <div style={{position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem'}}>
          <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,.8)', backdropFilter:'blur(6px)'}} onClick={() => setShowOrder(false)}/>
          <div style={{position:'relative', width:'100%', maxWidth:450, background:'white', borderRadius:'2.5rem', padding:'2.5rem'}}>
            <h3 style={{fontWeight:900, marginBottom:'2rem', textAlign:'center', fontSize:'1.4rem', color: '#000'}}>بيانات التوصيل 🚚</h3>
            <div style={{display:'grid', gap:'1.2rem'}}>
              <div style={{position:'relative'}}><User size={18} style={{position:'absolute', right:14, top:18, color:'#D4AF37'}}/><input placeholder="الاسم بالكامل" style={{width:'100%', padding:'1.2rem 3rem 1.2rem 1rem', borderRadius:'1.2rem', border:'2px solid #f1f5f9', background:'#fff', color:'#000', fontWeight:600}} value={customer.name} onChange={e=>setCustomer({...customer, name:e.target.value})} /></div>
              <div style={{position:'relative'}}><Phone size={18} style={{position:'absolute', right:14, top:18, color:'#D4AF37'}}/><input placeholder="رقم الهاتف" style={{width:'100%', padding:'1.2rem 3rem 1.2rem 1rem', borderRadius:'1.2rem', border:'2px solid #f1f5f9', background:'#fff', color:'#000', fontWeight:600}} value={customer.phone} onChange={e=>setCustomer({...customer, phone:e.target.value})} /></div>
              <div style={{position:'relative'}}><MapPin size={18} style={{position:'absolute', right:14, top:18, color:'#D4AF37'}}/><input placeholder="العنوان بالتفصيل" style={{width:'100%', padding:'1.2rem 3rem 1.2rem 1rem', borderRadius:'1.2rem', border:'2px solid #f1f5f9', background:'#fff', color:'#000', fontWeight:600}} value={customer.address} onChange={e=>setCustomer({...customer, address:e.target.value})} /></div>
              <button disabled={loading} onClick={handleOrder} style={{width:'100%', background:'#000', color:'#D4AF37', padding:'1.3rem', borderRadius:'1.5rem', border:'none', fontWeight:900, fontSize:'1.1rem', marginTop:'1rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                {loading ? 'جاري التأكيد...' : <><MessageCircle size={22}/> تأكيد الطلب (واتساب)</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {ordered && (
        <div style={{position:'fixed', inset:0, zIndex:10001, background:'rgba(0,0,0,.9)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{background:'white', padding:'3rem', borderRadius:'3rem', textAlign:'center', maxWidth:320}}>
            <CheckCircle2 size={60} color="#2ecc71" style={{margin:'0 auto 1.5rem'}}/>
            <h3 style={{fontWeight:900, fontSize:'1.5rem', marginBottom:'1rem', color: '#000'}}>طلبك وصل!</h3>
            <p style={{color:'#64748b'}}>سيتم توجيهك الآن للتاجر على واتساب.</p>
            <button onClick={() => setOrdered(false)} style={{marginTop:'2rem', width:'100%', padding:'1rem', borderRadius:'1rem', background:'#000', color:'#D4AF37', fontWeight:800}}>إغلاق</button>
          </div>
        </div>
      )}

      {/* Floating Bar */}
      {count > 0 && !showCart && !showOrder && (
        <div style={{position:'fixed', bottom:20, left:0, right:0, display:'flex', justifyContent:'center', zIndex:90}}>
          <button onClick={() => setShowCart(true)} style={{width:'90%', maxWidth:600, background:'#000', color:'#D4AF37', padding:'1.2rem', borderRadius:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 10px 30px rgba(0,0,0,0.3)', border:'none', cursor:'pointer'}}>
            <div style={{display:'flex', alignItems:'center', gap:'10px', fontWeight:900}}><ShoppingCart size={20}/> السلة ({count})</div>
            <div style={{fontWeight:900}}>{formatPrice(total)}</div>
          </button>
        </div>
      )}
    </div>
  )
}

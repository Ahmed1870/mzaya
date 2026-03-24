'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Plus, Minus, MessageCircle, CheckCircle2, MapPin, Phone, User, X, ShoppingBag, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import confetti from 'canvas-confetti'

interface CartItem { product: any; quantity: number }

export function StoreClient({ profile, products: initialProducts }: { profile: any; products: any[] }) {
  const supabase = createClient()
  const [products, setProducts] = useState(initialProducts)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showOrder, setShowOrder] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState({ name:'', phone:'', address:'' })
  const [ordered, setOrdered] = useState(false)

  const shopName = profile.shop_name || 'متجر مزايا'

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products', filter: `user_id=eq.${profile.id}` }, 
      (payload) => {
        setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, stock: payload.new.stock } : p))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile.id])

  const addToCart = (product: any) => {
    const currentProduct = products.find(p => p.id === product.id)
    const inCart = cart.find(i => i.product.id === product.id)
    const currentQty = inCart ? inCart.quantity : 0

    if (!currentProduct || currentProduct.stock <= currentQty) {
      Swal.fire({ 
        icon: 'warning', 
        title: 'عذراً.. عجز في المخزن', 
        text: `المتاح حالياً ${currentProduct?.stock || 0} قطع فقط!`, 
        background: '#111', color: '#fff', confirmButtonColor: '#D4AF37' 
      })
      return
    }

    setCart(prev => {
      if (inCart) return prev.map(i => i.product.id === product.id ? {...i, quantity: i.quantity+1} : i)
      return [...prev, { product: currentProduct, quantity: 1 }]
    })
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.9 }, colors: ['#D4AF37', '#ffffff'] })
  }

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.product.id !== id))
      return
    }

    const p = products.find(prod => prod.id === id)
    if (p && qty > p.stock) {
      Swal.fire({ 
        toast: true, 
        position: 'top-end', 
        timer: 3000, 
        title: `لا توجد كمية كافية (المتاح: ${p.stock})`, 
        icon: 'error', 
        showConfirmButton: false,
        background: '#111',
        color: '#fff'
      })
      return
    }
    setCart(prev => prev.map(i => i.product.id === id ? {...i, quantity: qty} : i))
  }

  const total = cart.reduce((s, i) => s + (i.product.price * i.quantity), 0)
  const count = cart.reduce((s, i) => s + i.quantity, 0)

  const handleOrder = async () => {
    if (!customer.name || !customer.phone) {
      Swal.fire({ icon: 'warning', title: 'بيانات ناقصة', text: 'من فضلك أكمل بياناتك لنصل إليك!', background: '#111', color: '#fff' })
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
        status: 'pending'
      }]).select().single()

      if (orderError) throw orderError

      for (const item of cart) {
        await supabase.from('invoice_items').insert([{
          invoice_id: orderData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price,
          total_price: item.product.price * item.quantity
        }])
        
        await supabase.from('products').update({ 
          stock: Math.max(0, (item.product.stock || 0) - item.quantity) 
        }).eq('id', item.product.id)
      }

      await supabase.from('notifications').insert([{
        user_id: profile.id,
        title: '📦 أوردر جديد!',
        message: `العميل ${customer.name} طلب منتجات بقيمة ${total} ج.م`,
        type: 'order'
      }])

      const itemsMsg = cart.map(i => `• ${i.product.name} (×${i.quantity})`).join('\n')
      const msg = `🚀 *طلب جديد من متجر ${shopName}*\n\n👤 *العميل:* ${customer.name}\n📞 *الهاتف:* ${customer.phone}\n📍 *العنوان:* ${customer.address}\n\n📦 *الطلبات:*\n${itemsMsg}\n\n💰 *الإجمالي:* ${formatPrice(total)}`
      
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
      setOrdered(true)
      window.open(`https://wa.me/${profile.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'فشل الإرسال', text: 'حاول مرة أخرى لاحقاً' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white" dir="rtl" style={{fontFamily:"'IBM Plex Sans Arabic', sans-serif"}}>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold">{shopName}</h1>
              <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest">مزايا لاكجري</span>
            </div>
          </div>
          <button onClick={() => setShowCart(true)} className="relative p-2 bg-white/5 rounded-xl border border-white/10">
            <ShoppingCart size={20} className="text-[#D4AF37]" />
            {count > 0 && <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-600 text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black">{count}</span>}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 pb-32">
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <motion.div layout key={product.id} className="bg-white/5 border border-white/5 rounded-[1.5rem] overflow-hidden group">
              <div className="aspect-square relative bg-white/5">
                {product.image_url ? <img src={product.image_url} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center opacity-20">📦</div>}
                {product.stock <= 0 && <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-red-500 uppercase tracking-tighter">نفذت الكمية</div>}
              </div>
              <div className="p-4">
                <h3 className="text-xs font-bold text-gray-300 line-clamp-1 mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-[#D4AF37]">{formatPrice(product.price)}</span>
                  <button onClick={() => addToCart(product)} disabled={product.stock <= 0} className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center hover:bg-[#D4AF37] transition-colors"><Plus size={16}/></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCart(false)}/>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-2xl bg-[#0f0f0f] border-t border-white/10 rounded-t-[2.5rem] p-8 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black flex items-center gap-2">السلة <Sparkles size={18} className="text-[#D4AF37]"/></h2>
                <X onClick={() => setShowCart(false)} className="text-gray-500" />
              </div>
              {cart.length === 0 ? <div className="text-center py-10 opacity-30">السلة فارغة</div> : (
                <div className="space-y-4">
                  {cart.map(({product, quantity}) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex-1 font-bold text-sm">{product.name}</div>
                      <div className="flex items-center gap-3 bg-black rounded-xl p-1 border border-white/10">
                        <Minus size={14} className="text-red-500 cursor-pointer" onClick={() => updateQty(product.id, quantity - 1)} />
                        <span className="font-black text-sm">{quantity}</span>
                        <Plus size={14} className="text-green-500 cursor-pointer" onClick={() => updateQty(product.id, quantity + 1)} />
                      </div>
                    </div>
                  ))}
                  <div className="p-5 bg-[#D4AF37] rounded-2xl flex justify-between items-center text-black font-black mt-6">
                    <span>الإجمالي</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <button onClick={() => {setShowCart(false); setShowOrder(true)}} className="w-full py-4 bg-white text-black rounded-2xl font-black mt-2 shadow-xl">تأكيد البيانات</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowOrder(false)}/>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-white/[0.05] border border-white/10 p-8 rounded-[2rem]">
              <h3 className="text-center font-black text-lg mb-6">بيانات التوصيل 🚚</h3>
              <div className="space-y-4">
                <input placeholder="الاسم" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-[#D4AF37]" value={customer.name} onChange={e=>setCustomer({...customer, name:e.target.value})}/>
                <input placeholder="رقم الموبايل" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-[#D4AF37]" value={customer.phone} onChange={e=>setCustomer({...customer, phone:e.target.value})}/>
                <input placeholder="العنوان" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-[#D4AF37]" value={customer.address} onChange={e=>setCustomer({...customer, address:e.target.value})}/>
                <button disabled={loading} onClick={handleOrder} className="w-full py-4 bg-[#D4AF37] text-black rounded-xl font-black mt-4 flex items-center justify-center gap-2">
                  <MessageCircle size={18}/> تأكيد (واتساب)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {count > 0 && !showCart && !showOrder && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-6 inset-x-0 flex justify-center px-6 z-[90]">
          <button onClick={() => setShowCart(true)} className="w-full max-w-md bg-white text-black h-14 rounded-xl flex items-center justify-between px-6 shadow-2xl">
            <span className="font-black text-sm">عرض السلة ({count})</span>
            <span className="font-black">{formatPrice(total)}</span>
          </button>
        </motion.div>
      )}
    </div>
  )
}

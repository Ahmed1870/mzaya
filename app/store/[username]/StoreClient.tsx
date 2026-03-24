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

  // الربط اللحظي (Real-time) للمخزن
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
    if (!currentProduct || currentProduct.stock <= 0) {
      Swal.fire({ icon: 'error', title: 'نفذت الكمية', text: 'هذا المنتج غير متوفر حالياً في المخزن الفضائي', background: '#111', color: '#fff', confirmButtonColor: '#D4AF37' })
      return
    }
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id)
      if (ex) return prev.map(i => i.product.id === product.id ? {...i, quantity: i.quantity+1} : i)
      return [...prev, { product: currentProduct, quantity: 1 }]
    })
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.9 }, colors: ['#D4AF37', '#ffffff'] })
  }

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.product.id !== id))
    else {
      const p = products.find(prod => prod.id === id)
      if (p && qty > p.stock) {
        Swal.fire({ toast: true, position: 'top-end', timer: 2000, title: 'عذراً، هذه أقصى كمية متاحة', icon: 'warning', showConfirmButton: false })
        return
      }
      setCart(prev => prev.map(i => i.product.id === id ? {...i, quantity: qty} : i))
    }
  }

  const total = cart.reduce((s, i) => s + (i.product.price * i.quantity), 0)
  const count = cart.reduce((s, i) => s + i.quantity, 0)

  const handleOrder = async () => {
    if (!customer.name || !customer.phone) {
      Swal.fire({ icon: 'warning', title: 'بيانات ناقصة', text: 'من فضلك أخبرنا من أنت لنرسل لك الطلب!', background: '#111', color: '#fff' })
      return
    }
    setLoading(true)

    try {
      // 1. تسجيل الفاتورة الرئيسية
      const { data: orderData, error: orderError } = await supabase.from('invoices').insert([{
        user_id: profile.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        total_amount: total,
        status: 'pending',
        type: 'sale'
      }]).select().single()

      if (orderError) throw orderError

      // 2. تسجيل تفاصيل المنتجات وتحديث المخزن (Batch)
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

      // 3. تحديث المحفظة (إضافة العملية للتاجر)
      await supabase.from('transactions').insert([{
        user_id: profile.id,
        amount: total,
        type: 'income',
        description: `أوردر متجر من العميل: ${customer.name}`,
        status: 'pending'
      }])

      // 4. إشعار التاجر
      await supabase.from('notifications').insert([{
        user_id: profile.id,
        title: '🌟 أوردر فضائي جديد!',
        message: `العميل ${customer.name} طلب منتجات بقيمة ${total} ج.م`,
        type: 'order'
      }])

      // 5. رسالة الواتساب الاحترافية
      const itemsMsg = cart.map(i => `• ${i.product.name} (×${i.quantity})`).join('\n')
      const msg = `🚀 *طلب جديد من متجر ${shopName}*\n\n👤 *العميل:* ${customer.name}\n📞 *الهاتف:* ${customer.phone}\n📍 *العنوان:* ${customer.address}\n\n📦 *الطلبات:*\n${itemsMsg}\n\n💰 *الإجمالي:* ${formatPrice(total)}\n\n✨ *تم الطلب عبر نظام مزايا الفضائي*`
      
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
      
      setOrdered(true)
      window.open(`https://wa.me/${profile.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
    } catch (err) {
      console.error(err)
      Swal.fire({ icon: 'error', title: 'عذراً', text: 'فشل الاتصال بالقاعدة الفضائية، حاول ثانية' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black" dir="rtl" style={{fontFamily:"'IBM Plex Sans Arabic', sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;600;700&display=swap" rel="stylesheet"/>

      {/* Header الفضائي */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#AA841D] flex items-center justify-center text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <ShoppingBag size={24} weight="fill" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">{shopName}</h1>
              <span className="text-[10px] text-[#D4AF37] uppercase tracking-[2px] font-bold">بواسطة مزايا</span>
            </div>
          </motion.div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowCart(true)} className="relative p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <ShoppingCart size={22} className="text-[#D4AF37]" />
            {count > 0 && <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#050505]">{count}</span>}
          </motion.button>
        </div>
      </header>

      {/* قائمة المنتجات */}
      <main className="max-w-2xl mx-auto px-6 py-8 pb-32">
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence>
            {products.map((product, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={product.id} 
                className="group relative bg-white/[0.03] border border-white/5 rounded-[2rem] overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-500"
              >
                <div className="aspect-square relative overflow-hidden bg-white/5">
                   {product.image_url ? (
                     <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name}/>
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📦</div>
                   )}
                   {product.stock <= 0 && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center font-bold text-red-500 text-xs uppercase tracking-widest">نفذت الكمية</div>}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-200 line-clamp-2 h-10 mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-black text-[#D4AF37]">{formatPrice(product.price)}</span>
                    <motion.button 
                      whileHover={{ scale: 1.1 }} 
                      whileTap={{ scale: 0.9 }} 
                      disabled={product.stock <= 0}
                      onClick={() => addToCart(product)}
                      className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center shadow-lg hover:bg-[#D4AF37] transition-colors"
                    >
                      <Plus size={20} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* سلة المشتريات (Drawer) */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCart(false)}/>
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-[#0f0f0f] border-t border-white/10 rounded-t-[3rem] p-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black flex items-center gap-3">السلة <Sparkles className="text-[#D4AF37]" /></h2>
                <X onClick={() => setShowCart(false)} className="cursor-pointer text-gray-500 hover:text-white" />
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-20 opacity-30 font-bold tracking-widest uppercase">الفضاء فارغ هنا.. أضف منتجات!</div>
              ) : (
                <div className="space-y-4">
                  {cart.map(({product, quantity}) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10">
                        <img src={product.image_url} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{product.name}</h4>
                        <span className="text-[#D4AF37] font-black">{formatPrice(product.price)}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-black rounded-2xl p-2 border border-white/5">
                        <Minus size={16} className="text-red-500 cursor-pointer" onClick={() => updateQty(product.id, quantity - 1)} />
                        <span className="font-black w-6 text-center">{quantity}</span>
                        <Plus size={16} className="text-green-500 cursor-pointer" onClick={() => updateQty(product.id, quantity + 1)} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-8 p-6 bg-[#D4AF37] rounded-[2rem] flex justify-between items-center text-black">
                    <span className="font-bold">إجمالي المبلغ</span>
                    <span className="text-2xl font-black">{formatPrice(total)}</span>
                  </div>
                  <button onClick={() => {setShowCart(false); setShowOrder(true)}} className="w-full py-5 bg-white text-black rounded-[2rem] font-black text-lg mt-4 hover:bg-[#D4AF37] transition-colors shadow-2xl shadow-white/5">إتمام الطلب الآن</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* فورم البيانات الفضائية */}
      <AnimatePresence>
        {showOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowOrder(false)}/>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-white/[0.03] border border-white/10 p-8 rounded-[3rem] shadow-2xl">
              <h3 className="text-center font-black text-2xl mb-8">أين نسلمك طلبك؟ 🛰️</h3>
              <div className="space-y-4">
                <div className="relative group">
                  <User className="absolute right-4 top-4 text-gray-500 group-focus-within:text-[#D4AF37]" size={20}/>
                  <input placeholder="اسمك الكريم" className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl focus:border-[#D4AF37] outline-none transition-all" value={customer.name} onChange={e=>setCustomer({...customer, name:e.target.value})}/>
                </div>
                <div className="relative group">
                  <Phone className="absolute right-4 top-4 text-gray-500 group-focus-within:text-[#D4AF37]" size={20}/>
                  <input placeholder="رقم الموبايل" className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl focus:border-[#D4AF37] outline-none transition-all" value={customer.phone} onChange={e=>setCustomer({...customer, phone:e.target.value})}/>
                </div>
                <div className="relative group">
                  <MapPin className="absolute right-4 top-4 text-gray-500 group-focus-within:text-[#D4AF37]" size={20}/>
                  <input placeholder="عنوان التوصيل" className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl focus:border-[#D4AF37] outline-none transition-all" value={customer.address} onChange={e=>setCustomer({...customer, address:e.target.value})}/>
                </div>
                <button disabled={loading} onClick={handleOrder} className="w-full py-5 bg-[#D4AF37] text-black rounded-2xl font-black text-lg mt-4 flex items-center justify-center gap-3">
                  {loading ? 'جاري الاتصال بالقاعدة...' : <><MessageCircle /> تأكيد عبر واتساب</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* شريط السلة العائم */}
      <AnimatePresence>
        {count > 0 && !showCart && !showOrder && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-8 inset-x-0 flex justify-center z-[90] px-6">
            <button onClick={() => setShowCart(true)} className="w-full max-w-md bg-white text-black h-16 rounded-2xl flex items-center justify-between px-8 shadow-[0_20px_50px_rgba(255,255,255,0.1)] group">
               <div className="flex items-center gap-3 font-black">
                  <ShoppingCart className="group-hover:rotate-12 transition-transform" />
                  سلة المشتريات ({count})
               </div>
               <span className="font-black text-lg">{formatPrice(total)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

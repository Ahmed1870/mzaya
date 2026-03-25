'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Plus, Minus, MessageCircle, CheckCircle2, MapPin, Phone, User, X, Sparkles, Rocket, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import confetti from 'canvas-confetti'

export function StoreClient({ profile, products: initialProducts }: { profile: any; products: any[] }) {
  const supabase = createClient()
  const [products, setProducts] = useState(initialProducts)
  const [cart, setCart] = useState<any[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showOrder, setShowOrder] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState({ name:'', phone:'', address:'' })
  const [ordered, setOrdered] = useState(false)

  const shopName = profile.shop_name || 'متجر مزايا'

  // الربط اللحظي للمخزن
  useEffect(() => {
    const channel = supabase.channel('store-sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (p) => {
        setProducts(prev => prev.map(item => item.id === p.new.id ? { ...item, stock: p.new.stock } : item))
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const addToCart = (product: any) => {
    const inCart = cart.find(i => i.id === product.id)
    if (product.stock <= (inCart?.quantity || 0)) {
        Swal.fire({ 
            title: 'المخزن الفضائي نفذ!', 
            text: `متاح ${product.stock} قطع فقط`, 
            icon: 'warning', background: '#0a0a0a', color: '#D4AF37', confirmButtonColor: '#D4AF37' 
        })
        return
    }
    setCart(prev => inCart ? prev.map(i => i.id === product.id ? {...i, quantity: i.quantity+1} : i) : [...prev, {...product, quantity: 1}])
    confetti({ particleCount: 20, spread: 30, origin: { y: 0.8 }, colors: ['#D4AF37'] })
  }

  const handleFinalOrder = async () => {
    if (!customer.name || !customer.phone) return Swal.fire({ title: 'بياناتك ناقصة!', icon: 'error', background: '#0a0a0a', color: '#fff' })
    setLoading(true)
    
    try {
        // نداء الـ Database Function الأخطبوطية
        const { error } = await supabase.from('invoices').insert({
            user_id: profile.id,
            customer_name: customer.name,
            customer_phone: customer.phone,
            customer_address: customer.address,
        source: 'online_store',
        order_status: 'pending',
            total_amount: cart.reduce((s, i) => s + (i.price * i.quantity), 0),
        source: 'online_store',
        status: 'pending',
        order_status: 'pending',
            p_items: cart.map(i => ({ product_id: i.id, product_name: i.name, unit_price: i.price, quantity: i.quantity }))
        })

        if (error) throw error

        confetti({ particleCount: 150, spread: 70, origin: { y: 0.5 } })
        setOrdered(true)
        const msg = `🚀 طلب جديد من: ${customer.name}\n📦 المنتجات:\n${cart.map(i => `- ${i.name} (${i.quantity})`).join('\n')}\n💰 الإجمالي: ${cart.reduce((s, i) => s + (i.price * i.quantity), 0)}`
        window.open(`https://wa.me/${profile.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`)
    } catch (err: any) {
        Swal.fire({ title: 'خطأ في الربط', text: err.message, icon: 'error' })
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-[#D4AF37]/30" dir="rtl">
      <style>{`
        @keyframes orbit { from { transform: rotate(0deg) translateX(100px) rotate(0deg); } to { transform: rotate(360deg) translateX(100px) rotate(-360deg); } }
        .nebula { position: fixed; top: 50%; left: 50%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%); filter: blur(60px); z-index: 0; pointer-events: none; }
      `}</style>
      
      <div className="nebula" style={{ animation: 'orbit 20s linear infinite' }} />

      {/* Header الفضائي */}
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="sticky top-0 z-[60] backdrop-blur-2xl bg-black/40 border-b border-white/5 p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 1 }} className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-black shadow-[0_0_20px_#D4AF37]">
                <Rocket size={20} />
             </motion.div>
             <h1 className="text-xl font-black tracking-tighter">{shopName}</h1>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowCart(true)} className="p-3 bg-white/5 rounded-2xl relative">
             <ShoppingCart className="text-[#D4AF37]" />
             {cart.length > 0 && <span className="absolute -top-1 -left-1 bg-red-500 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-black">{cart.length}</span>}
          </motion.button>
        </div>
      </motion.header>

      {/* المنتجات كأنها طائرة في الفضاء */}
      <main className="max-w-2xl mx-auto p-6 grid grid-cols-2 gap-6 relative z-10">
        {products.map((p, idx) => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-4 group relative overflow-hidden backdrop-blur-md"
          >
            <div className="aspect-square rounded-[2rem] overflow-hidden mb-4 bg-black/40">
              <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <h3 className="font-bold text-sm mb-2 line-clamp-1 opacity-80">{p.name}</h3>
            <div className="flex justify-between items-center">
               <span className="text-[#D4AF37] font-black">{formatPrice(p.price)}</span>
               <motion.button 
                whileHover={{ scale: 1.2, backgroundColor: '#D4AF37', color: '#000' }}
                onClick={() => addToCart(p)}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all"
               >
                 <Plus size={18} />
               </motion.button>
            </div>
          </motion.div>
        ))}
      </main>

      {/* فورم البيانات - التركيز على الكيبورد وجمال الإدخال */}
      <AnimatePresence>
        {showOrder && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }}
              className="w-full max-w-md bg-white/[0.02] border border-[#D4AF37]/20 p-8 rounded-[3rem] shadow-[0_0_50px_rgba(212,175,55,0.1)]"
            >
              <h2 className="text-2xl font-black mb-8 text-center flex items-center justify-center gap-3">
                <Sparkles className="text-[#D4AF37]" /> بوابتك للفضاء
              </h2>
              <div className="space-y-6">
                {[
                  { id: 'name', icon: User, label: 'اسمك بالكامل', val: customer.name },
                  { id: 'phone', icon: Phone, label: 'رقم الموبايل', val: customer.phone },
                  { id: 'address', icon: MapPin, label: 'عنوان التوصيل', val: customer.address }
                ].map((input) => (
                  <div key={input.id} className="relative group">
                    <input 
                      type="text" required
                      className="w-full bg-white/5 border-b-2 border-white/10 p-4 pr-12 outline-none focus:border-[#D4AF37] focus:bg-white/[0.02] transition-all rounded-t-2xl text-lg font-bold"
                      placeholder={input.label}
                      value={input.val}
                      onChange={e => setCustomer({...customer, [input.id]: e.target.value})}
                    />
                    <input.icon className="absolute right-4 top-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                  </div>
                ))}
                <motion.button 
                  disabled={loading}
                  onClick={handleFinalOrder}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-5 bg-[#D4AF37] text-black rounded-2xl font-black text-xl shadow-[0_10px_30px_rgba(212,175,55,0.3)] flex items-center justify-center gap-3"
                >
                  {loading ? 'يتم الإطلاق...' : <><MessageCircle /> تأكيد الطلب الفضائي</>}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* شريط السلة العائم */}
      {cart.length > 0 && !showOrder && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-8 inset-x-0 z-[50] flex justify-center px-6">
           <button onClick={() => setShowOrder(true)} className="w-full max-w-lg bg-white text-black h-16 rounded-[2rem] flex items-center justify-between px-8 shadow-2xl group">
              <div className="flex items-center gap-3 font-black text-lg">
                <ChevronRight className="group-hover:translate-x-[-5px] transition-transform" /> استكمال الطلب ({cart.length})
              </div>
              <span className="font-black text-xl">{formatPrice(cart.reduce((s,i)=>s+(i.price*i.quantity),0))}</span>
           </button>
        </motion.div>
      )}
    </div>
  )
}

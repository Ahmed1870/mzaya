'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, Wallet, TrendingUp, ArrowUpRight, 
  PlusCircle, Globe, ShoppingBag, Stars, 
  Zap, ChevronRight, Activity
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const [newOrderNotify, setNewOrderNotify] = useState(false);

  useEffect(() => {
    const channel = supabase.channel('realtime_orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'invoices' }, (payload) => {
        setNewOrderNotify(true);
        new Audio('/notification.mp3').play().catch(() => {});
        loadStats();
      }).subscribe();
    async function fetchStats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [products, orders, wallet, profile] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', user.id).neq('status', 'returned'),
        supabase.from('wallet').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('shop_name, username').eq('id', user.id).maybeSingle()
      ])

      setData({
        products: products.count || 0, maxProducts: profile.data?.max_products || 10,
        orders: orders.count || 0,
        balance: wallet?.balance || 0,
        revenue: wallet?.total_revenue || 0,
        businessName: profile.data?.shop_name || 'إمبراطوريتك',
        username: profile.data?.username || ''
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-12 h-12 border-t-2 border-[#D4AF37] rounded-full"
      />
    </div>
  )

  const stats = [
    { label: 'الأسطول (منتجاتك)', value: data.products, icon: Package, color: '#D4AF37', shadow: 'rgba(212,175,55,0.2)' },
    { label: 'رادار الطلبات', value: data.orders, icon: ShoppingBag, color: '#2ECC71', shadow: 'rgba(46,204,113,0.2)' },
    { label: 'خزنة الرصيد', value: `${data.balance} EGP`, icon: Wallet, color: '#3498DB', shadow: 'rgba(52,152,219,0.2)' },
    { label: 'وقود الأرباح', value: `${data.revenue} EGP`, icon: TrendingUp, color: '#9B59B6', shadow: 'rgba(155,89,182,0.2)' },
  ]

  const storeUrl = `mzaya.shop/store/${data.username}`

  return (
    <div className="min-h-screen text-white p-4 md:p-8 font-['IBM_Plex_Sans_Arabic'] relative overflow-hidden" dir="rtl">
      
      {/* Space Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
        <motion.div 
          initial={{ x: 50, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
              <Activity size={20} className="animate-pulse" />
            </div>
            <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest">Command Center / مركز القيادة</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
             {data.businessName} <Stars className="text-[#D4AF37]" />
          </h1>
        </motion.div>

        <Link href="/dashboard/products">
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(212,175,55,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#D4AF37] text-black px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl transition-all"
          >
            <PlusCircle size={22} /> إضافة شحنة جديدة
          </motion.button>
        </Link>
      </header>

      {/* Stats Grid - The Space Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white/[0.03] backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-12"
              style={{ backgroundColor: `${stat.color}15`, boxShadow: `inset 0 0 20px ${stat.color}10` }}
            >
              <stat.icon size={28} style={{ color: stat.color }} />
            </div>
            <p className="text-gray-500 text-sm font-bold mb-1">{stat.label}</p>
            <h2 className="text-2xl font-black text-white">{stat.value}</h2>
            
            {/* Decoration line */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent group-hover:w-full transition-all duration-500" />
          </motion.div>
        ))}
      </div>

      {/* Store Link Section - The Global Uplink */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37]/20 to-blue-500/20 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative bg-black border border-white/5 p-10 rounded-[3rem] overflow-hidden flex flex-col items-center text-center">
          
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Globe size={200} className="text-[#D4AF37] animate-[spin_20s_linear_infinite]" />
          </div>

          <div className="p-4 bg-white/5 rounded-full mb-6">
            <Zap className="text-[#D4AF37]" size={32} />
          </div>
          
          <h3 className="text-2xl font-black mb-4">بوابة البيع العالمية</h3>
          <p className="text-gray-400 max-w-xl mb-10 leading-relaxed text-lg">
            متجرك جاهز لاستقبال الطلبات من جميع أنحاء المجرة. <br /> انسخ الرابط وشغل الرادار!
          </p>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-2xl">
            <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-2xl font-mono text-[#D4AF37] text-sm break-all w-full">
              {storeUrl}
            </div>
            <a href={`/store/${data.username}`} target="_blank" className="w-full md:w-auto">
              <motion.button 
                whileHover={{ x: 5 }}
                className="w-full bg-white/10 hover:bg-white/20 text-white px-8 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all"
              >
                معاينة <ArrowUpRight size={20} />
              </motion.button>
            </a>
          </div>
        </div>
      </motion.div>

    </div>
  )
}

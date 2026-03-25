'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  TrendingUp, Users, Package, Wallet, 
  AlertTriangle, ArrowUpRight, ShoppingCart, 
  Clock, ChevronRight 
} from 'lucide-react'

export default function MerchantDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersCount: 0,
    lowStock: 0,
    balance: 0,
    recentOrders: [] as any[]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. جلب المبيعات والأوردرات من الفواتير
      const { data: inv } = await supabase.from('invoices').select('total_amount').eq('user_id', user.id)
      const totalSales = inv?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0
      
      // 2. جلب المنتجات اللي قربت تخلص (المخزن < 5)
      const { count: lowStock } = await supabase.from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .lt('stock', 5)

      // 3. جلب الرصيد من المحفظة
      const { data: wall } = await supabase.from('wallet').select('balance').eq('user_id', user.id).single()

      // 4. أحدث 5 أوردرات
      const { data: recent } = await supabase.from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalSales,
        ordersCount: inv?.length || 0,
        lowStock: lowStock || 0,
        balance: wall?.balance || 0,
        recentOrders: recent || []
      })
      setLoading(false)
    }
    loadDashboardData()
  }, [])

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#D4AF37] animate-pulse font-bold">جاري تحضير البيانات الملكية...</div>

  return (
    <div className="min-h-screen bg-[#020202] text-white p-4 lg:p-8" style={{ direction: 'rtl', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">لوحة التحكم</h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">مرحباً بك مجدداً، إليك ملخص أداء متجرك اللحظي.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="إجمالي المبيعات" value={`${stats.totalSales} ج.م`} icon={<TrendingUp size={20} className="text-green-500" />} color="from-green-500/10" />
        <StatCard title="إجمالي الطلبات" value={stats.ordersCount} icon={<ShoppingCart size={20} className="text-blue-500" />} color="from-blue-500/10" />
        <StatCard title="نواقص المخزن" value={stats.lowStock} icon={<AlertTriangle size={20} className="text-red-500" />} color="from-red-500/10" />
        <StatCard title="رصيد متاح" value={`${stats.balance} ج.م`} icon={<Wallet size={20} className="text-[#D4AF37]" />} color="from-[#D4AF37]/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Clock size={20} className="text-[#D4AF37]" /> أحدث العمليات</h2>
            <button className="text-[#D4AF37] text-xs font-bold hover:underline flex items-center gap-1">المزيد <ChevronRight size={14}/></button>
          </div>
          <div className="space-y-4">
            {stats.recentOrders.length > 0 ? stats.recentOrders.map((order: any) => (
              <div key={order.id} className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-[#D4AF37]/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold">
                    {order.customer_name?.[0] || 'ع'}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{order.customer_name || 'عميل مجهول'}</p>
                    <p className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-[#D4AF37]">{order.total_amount} ج.م</p>
                  <p className="text-[9px] text-gray-600 font-bold uppercase">{order.status || 'معلق'}</p>
                </div>
              </div>
            )) : <p className="text-center py-10 text-gray-600 text-sm">لا توجد أوردرات مسجلة بعد.</p>}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-8 flex flex-col justify-between items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/50"></div>
          <div>
            <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-12 transition-transform">
              <Package size={30} className="text-[#D4AF37]" />
            </div>
            <h3 className="text-lg font-bold mb-3">حالة المخزون</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              لديك <span className="text-red-500 font-bold">{stats.lowStock} منتجات</span> على وشك النفاذ. قم بزيادة الكمية لضمان استمرار مبيعاتك بنجاح.
            </p>
          </div>
          <button className="mt-8 w-full py-4 bg-white/5 rounded-2xl text-xs font-bold hover:bg-white/10 transition-colors">إدارة المنتجات</button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className={`bg-[#0A0A0A] border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group hover:border-[#D4AF37]/20 transition-all`}>
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} to-transparent opacity-40 blur-2xl group-hover:opacity-100 transition-opacity`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black">{value}</h3>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl">{icon}</div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-[10px] text-green-500 font-bold relative z-10">
        <ArrowUpRight size={12} /> +8.5% <span className="text-gray-600 font-medium">مقارنة بأمس</span>
      </div>
    </div>
  )
}

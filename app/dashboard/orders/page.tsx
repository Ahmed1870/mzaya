'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { ShoppingBag, Clock, CheckCircle2, Package } from 'lucide-react'

export default function OrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: dbInvoices, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) setOrders(dbInvoices || [])
      setLoading(false)
    }
    loadOrders()
  }, [])

  if (loading) return <div className="p-6 text-white text-center font-bold">جاري تحميل طلباتك... 🚀</div>

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag className="w-8 h-8 text-[#D4AF37]" />
        <h1 className="text-2xl font-bold">إدارة الطلبات الواردة</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">لا توجد طلبات حتى الآن.. انشر رابط متجرك وابدأ البيع!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-[#D4AF37]">{order.customer_name}</h3>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('ar-EG')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${order.order_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                  {order.order_status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}
                </span>
              </div>
              <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-3">
                <span className="text-sm font-medium">{order.total_amount} ج.م</span>
                <button className="text-xs bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-bold">تفاصيل الطلب</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

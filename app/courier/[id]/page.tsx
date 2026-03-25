'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { User, Phone, MapPin, Package, CheckCircle2, Clock, Navigation, MessageSquare, Bike, ChevronLeft } from 'lucide-react'
import Swal from 'sweetalert2'

export default function CourierOrderConsole() {
  const params = useParams()
  const supabase = createClient()
  const [orders, setOrders] = useState<any[]>([])
  const [courier, setCourier] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // جلب البيانات
  const loadData = async () => {
    setLoading(true)
    // 1. جلب بيانات المندوب للتأكد من الرابط
    const { data: cData } = await supabase.from('couriers').select('*').eq('id', params.id).single()
    if (!cData) {
        setLoading(false)
        return
    }
    setCourier(cData)

    // 2. جلب الأوردرات المربوطة بالمندوب ده (غير المدفوعة فقط)
    const { data: oData } = await supabase
      .from('invoices')
      .select('*')
      .eq('courier_id', params.id)
      .neq('status', 'paid') 
      .order('created_at', { ascending: false })

    setOrders(oData || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [params.id])

  // أكشن "تم التسليم"
  const handleDelivery = async (orderId: string) => {
    const { isConfirmed } = await Swal.fire({
      title: 'تأكيد التسليم؟',
      text: "هل استلمت المبلغ كامل من العميل؟",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#D4AF37',
      confirmButtonText: 'نعم، تم التحصيل',
      cancelButtonText: 'ليس بعد'
    })

    if (isConfirmed) {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid', // "كلمة السر" لتشغيل محرك المحفظة
          order_status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (!error) {
        Swal.fire({ title: 'عاش يا بطل!', text: 'تم تحديث رصيد التاجر فوراً', icon: 'success', timer: 2000 })
        loadData()
      }
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#D4AF37] font-bold">جاري تحميل مهامك...</div>
  
  if (!courier) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6">
      <XCircle size={60} className="text-red-600 mb-4" />
      <h1 className="text-white text-2xl font-black">عفواً! الرابط غير صحيح</h1>
      <p className="text-gray-500 mt-2">يرجى التواصل مع التاجر للحصول على الرابط الصحيح.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#020202] text-white p-4 pb-24" style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="bg-[#0A0A0A] p-6 rounded-[2rem] border border-white/5 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37]">
          <Bike size={32} />
        </div>
        <div>
          <h1 className="text-xl font-black">أهلاً، {courier.name}</h1>
          <p className="text-gray-500 text-xs">لديك {orders.length} أوردرات بانتظار التوصيل</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-[#111] border border-white/5 p-5 rounded-[2.5rem] shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] px-3 py-1 rounded-full font-bold">
                طلب جديد #{order.id.slice(0,6)}
              </span>
              <span className="text-gray-600 text-[10px]">{new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center"><User size={16} className="text-gray-400" /></div>
                <p className="font-bold text-lg">{order.customer_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center"><MapPin size={16} className="text-gray-400" /></div>
                <p className="text-gray-400 text-sm">{order.customer_address}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <a href={`tel:${order.customer_phone}`} className="bg-green-600/10 text-green-500 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-95 transition-all">
                <Phone size={20} /> اتصل بالعميل
              </a>
              <a href={`https://wa.me/${order.customer_phone}`} className="bg-green-500 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-95 transition-all">
                <MessageSquare size={20} /> واتساب
              </a>
            </div>

            {/* Price and Confirm */}
            <div className="bg-white/5 p-4 rounded-3xl flex justify-between items-center">
              <div>
                <p className="text-[10px] text-gray-500">المطلوب تحصيله</p>
                <p className="text-2xl font-black text-[#D4AF37]">{order.total_amount} <span className="text-xs">ج.م</span></p>
              </div>
              <button 
                onClick={() => handleDelivery(order.id)}
                className="bg-[#D4AF37] text-black h-14 px-6 rounded-2xl font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <CheckCircle2 size={20} /> تم التسليم
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-20 opacity-30">
            <Package size={60} className="mx-auto mb-4" />
            <p>لا توجد مهام حالياً.. استمتع بوقتك!</p>
          </div>
        )}
      </div>
    </div>
  )
}

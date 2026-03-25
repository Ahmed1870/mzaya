'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { User, Phone, Plus, Copy, ExternalLink, Trash2, Bike, CheckCircle } from 'lucide-react'
import Swal from 'sweetalert2'

export default function CouriersManagement() {
  const supabase = createClient()
  const [couriers, setCouriers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadCouriers = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('couriers').select('*').eq('user_id', user.id)
    setCouriers(data || [])
    setLoading(false)
  }

  useEffect(() => { loadCouriers() }, [])

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/courier/${id}`
    navigator.clipboard.writeText(link)
    Swal.fire({ title: 'تم نسخ الرابط!', text: 'أرسله للمندوب الآن ليبدأ العمل', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false })
  }

  const addCourier = async (e: any) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('couriers').insert({
      name: formData.get('name'),
      phone: formData.get('phone'),
      user_id: user?.id
    })

    if (!error) {
      Swal.fire('تم الإضافة!', 'المندوب جاهز لاستلام الأوردرات', 'success')
      e.target.reset()
      loadCouriers()
    }
  }

  return (
    <div className="p-6 text-white min-h-screen bg-[#050505]" style={{ direction: 'rtl' }}>
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37]">🚴 إدارة المناديب</h1>
          <p className="text-gray-500">تحكم في فريق التوصيل الخاص بك</p>
        </div>
      </header>

      {/* نموذج إضافة مندوب */}
      <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 mb-8">
        <form onSubmit={addCourier} className="flex flex-wrap gap-4">
          <input name="name" required placeholder="اسم المندوب" className="flex-1 min-w-[200px] bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-[#D4AF37]" />
          <input name="phone" required placeholder="رقم الموبايل" className="flex-1 min-w-[200px] bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-[#D4AF37]" />
          <button className="bg-[#D4AF37] text-black px-8 py-4 rounded-xl font-black flex items-center gap-2 hover:scale-105 transition-transform">
            <Plus size={20} /> إضافة مندوب جديد
          </button>
        </form>
      </div>

      {/* قائمة المناديب */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {couriers.map(c => (
          <div key={c.id} className="bg-[#0A0A0A] border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37]">
                <Bike size={30} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{c.name}</h3>
                <p className="text-gray-500 text-sm">{c.phone}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => copyLink(c.id)}
                className="flex-1 bg-[#D4AF37] text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Copy size={16} /> نسخ رابط العمل
              </button>
              <button className="bg-white/5 p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600">
              <span>الحالة: {c.is_active ? 'نشط' : 'غير نشط'}</span>
              <CheckCircle size={12} className="text-green-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

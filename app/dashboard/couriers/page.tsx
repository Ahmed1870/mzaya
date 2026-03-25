'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Bike, Wallet, UserPlus, Phone, Trash2, Info } from 'lucide-react'
import Swal from 'sweetalert2'

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<any[]>([])
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', commission_rate: '10' })
  const supabase = createClient()

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [cRes, wRes] = await Promise.all([
      supabase.from('couriers').select('*').eq('user_id', user.id),
      supabase.from('wallet').select('*').eq('user_id', user.id).maybeSingle()
    ])
    setCouriers(cRes.data || [])
    setWallet(wRes.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addCourier = async () => {
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('couriers').insert([{ ...form, user_id: user?.id }])
    setForm({ name: '', phone: '', commission_rate: '10' })
    load()
    setAdding(false)
  }

  const deleteCourier = async (id: string) => {
    await supabase.from('couriers').delete().eq('id', id)
    load()
  }

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-[#D4AF37]">جاري التحميل...</div>

  return (
    <div className="p-6 bg-black min-h-screen text-white font-['Tajawal']" dir="rtl">
      <h1 className="text-2xl font-black mb-8 flex items-center gap-2"><Bike className="text-[#D4AF37]"/> إدارة المناديب</h1>
      <div className="grid gap-6">
         {/* Wallet Card */}
         <div className="bg-gradient-to-br from-[#111] to-[#000] p-8 rounded-3xl border border-[#D4AF37]/20 text-center">
            <p className="text-gray-500 text-sm mb-2">الرصيد المتاح</p>
            <h2 className="text-4xl font-black text-[#D4AF37]">{wallet?.balance || 0} EGP</h2>
         </div>
         {/* Add Form */}
         <div className="bg-white/5 p-6 rounded-3xl space-y-4">
            <input className="w-full bg-black border border-white/10 p-4 rounded-xl" placeholder="اسم المندوب" value={form.name} onChange={e=>setForm({...form, name: e.target.value})}/>
            <button onClick={addCourier} className="w-full bg-[#D4AF37] text-black font-black p-4 rounded-xl">إضافة مندوب</button>
         </div>
         {/* List */}
         {couriers.map(c => (
           <div key={c.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
              <div><p className="font-bold">{c.name}</p><p className="text-xs text-gray-500">{c.phone}</p></div>
              <button onClick={()=>deleteCourier(c.id)} className="text-red-500 p-2"><Trash2 size={18}/></button>
           </div>
         ))}
      </div>
    </div>
  )
}

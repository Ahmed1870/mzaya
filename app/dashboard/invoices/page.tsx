'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Plus, Clock, CheckCircle2, XCircle, Search, Lock, UserCheck, Globe } from 'lucide-react'
import Swal from 'sweetalert2'

const STATUS_MAP: Record<string, { label: string, color: string, icon: any }> = {
  pending: { label: 'قيد الانتظار', color: '#D4AF37', icon: Clock },
  paid: { label: 'مدفوعة', color: '#2ecc71', icon: CheckCircle2 },
  cancelled: { label: 'ملغية', color: '#e74c3c', icon: XCircle }
}

export default function InvoicesPage() {
  const supabase = createClient()
  const [invoices, setInvoices] = useState<any[]>([])
  const [plan, setPlan] = useState('free')
  const [couriers, setCouriers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [invs, prof, dbCouriers] = await Promise.all([
      supabase.from('invoices').select('*, couriers(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('plan_name').eq('id', user.id).single(),
      supabase.from('couriers').select('id, name').eq('user_id', user.id).eq('is_active', true)
    ])

    setInvoices(invs.data || [])
    setPlan(prof.data?.plan_name || 'free')
    setCouriers(dbCouriers.data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const assignCourier = async (invoiceId: string, courierId: string) => {
    const { error } = await supabase.from('invoices').update({ courier_id: courierId }).eq('id', invoiceId)
    if (!error) {
      Swal.fire({ title: 'تم تعميد المندوب!', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false })
      loadData()
    }
  }

  const isPro = plan === 'احترافية' || plan === 'البيزنس'
  const filtered = invoices.filter(inv => 
    inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || inv.customer_phone?.includes(searchTerm)
  )

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"/></div>

  return (
    <div className="p-4 md:p-6 text-white dir-rtl" style={{ direction: 'rtl' }}>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#D4AF37]">📄 سجل الفواتير</h1>
          <p className="text-gray-500 text-sm">إدارة مبيعاتك بنظام {plan}</p>
        </div>
        <Link href="/dashboard/invoices/new" className="bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
          <Plus size={20} /> فاتورة جديدة
        </Link>
      </header>

      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input 
          className="w-full bg-[#111] border border-white/5 p-4 pr-12 rounded-2xl focus:border-[#D4AF37] outline-none transition-all"
          placeholder="ابحث باسم العميل أو رقم الموبايل..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filtered.map(inv => {
          const status = STATUS_MAP[inv.status] || STATUS_MAP.pending
          return (
            <div key={inv.id} className="bg-[#0A0A0A] border border-white/5 p-5 rounded-[2rem] hover:border-[#D4AF37]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{inv.customer_name || 'عميل نقدي'}</h3>
                    {inv.source === 'online_store' && <Globe size={14} className="text-blue-400" title="طلب من المتجر" />}
                  </div>
                  <p className="text-xs text-gray-600">#{inv.id.slice(0,8).toUpperCase()} • {new Date(inv.created_at).toLocaleDateString('ar-EG')}</p>
                </div>
                <div className="text-left">
                  <p className="text-xl font-black text-[#D4AF37]">{formatPrice(inv.total_amount)}</p>
                  <div className="flex items-center gap-1 text-[10px]" style={{ color: status.color }}>
                    <status.icon size={12} /> {status.label}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
                {/* قسم اختيار المندوب */}
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl flex-1 min-w-[200px]">
                  <UserCheck size={16} className="text-gray-500" />
                  <select 
                    className="bg-transparent text-sm outline-none w-full"
                    value={inv.courier_id || ''}
                    onChange={(e) => assignCourier(inv.id, e.target.value)}
                  >
                    <option value="">إسناد لمندوب...</option>
                    {couriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <Link href={`/dashboard/invoices/${inv.id}`} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-colors">
                  <Plus size={18} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

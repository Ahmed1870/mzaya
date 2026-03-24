'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Gift, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ReferralData {
  commissions: any[];
  total: number;
}

export default function ReferralPage() {
  const [data, setData] = useState<ReferralData>({ commissions: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: comms } = await supabase
        .from('referral_commissions')
        .select('*')
        .eq('referrer_id', user.id)

      const totalAmount = comms?.reduce((acc: number, curr: any) => acc + (curr.commission_amount || 0), 0) || 0
      
      setData({ 
        commissions: (comms as any[]) || [], 
        total: totalAmount 
      })
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="p-10 text-center text-white">جاري تحميل البيانات...</div>

  return (
    <div className="p-4 md:p-8 text-white font-['IBM_Plex_Sans_Arabic']" dir="rtl">
      <header className="mb-10 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 bg-white/5 rounded-xl text-gray-400">
           <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-black">نظام الإحالات 🎁</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#D4AF37]/20 to-transparent p-8 rounded-[2.5rem] border border-[#D4AF37]/20">
          <Gift className="text-[#D4AF37] mb-4" size={32} />
          <p className="text-gray-400 font-bold mb-1">إجمالي أرباحك</p>
          <h2 className="text-4xl font-black text-white">{data.total} EGP</h2>
        </div>

        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
          <Users className="text-blue-400 mb-4" size={32} />
          <p className="text-gray-400 font-bold mb-1">عدد الإحالات الناجحة</p>
          <h2 className="text-4xl font-black text-white">{data.commissions.length}</h2>
        </div>
      </div>
    </div>
  )
}

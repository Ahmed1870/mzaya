'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { BarChart3, TrendingUp, Wallet, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ReportsPage() {
  // استخدام any بشكل صريح ومباشر في الـ State لمنع الـ never type تماماً
  const [data, setData] = useState<any>({ inv: [], wallet: null, profile: null })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [ { data: inv }, { data: wall }, { data: prof } ] = await Promise.all([
        supabase.from('invoices').select('*').eq('user_id', user.id),
        supabase.from('wallets').select('*').eq('user_id', user.id).single(),
        supabase.from('profiles').select('*').eq('id', user.id).single()
      ])

      // إجبار البيانات على التحول لنوع any لمنع اعتراض الـ Build
      const reportData: any = {
        inv: inv || [],
        wallet: wall,
        profile: prof
      }
      
      setData(reportData)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="p-10 text-center text-white">جاري تحليل البيانات...</div>

  return (
    <div className="p-4 md:p-8 text-white font-['IBM_Plex_Sans_Arabic']" dir="rtl">
      <header className="mb-10 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 bg-white/5 rounded-xl text-gray-400">
           <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-black">التقارير والإحصائيات 📊</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
          <TrendingUp className="text-green-400 mb-4" size={32} />
          <p className="text-gray-400 font-bold mb-1">إجمالي الفواتير</p>
          <h2 className="text-4xl font-black text-white">{data.inv?.length || 0}</h2>
        </div>
        
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
          <Wallet className="text-[#D4AF37] mb-4" size={32} />
          <p className="text-gray-400 font-bold mb-1">الرصيد الحالي</p>
          <h2 className="text-4xl font-black text-white">{data.wallet?.balance || 0} EGP</h2>
        </div>

        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
          <BarChart3 className="text-blue-400 mb-4" size={32} />
          <p className="text-gray-400 font-bold mb-1">نوع الباقة</p>
          <h2 className="text-2xl font-black text-white">{data.profile?.plan || 'Standard'}</h2>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Trophy, Star, Target, Zap, ShieldCheck, Award } from 'lucide-react'

export default function AchievementsPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<any>({
    totalSales: 0,
    productCount: 0,
    badges: []
  })

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [ { data: invData }, { data: pData }, { data: allProfiles } ] = await Promise.all([
        supabase.from('invoices').select('*').eq('user_id', user.id),
        supabase.from('products').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('profiles').select('id, plan_name')
      ])

      const inv = invData || []
      const paid = inv.filter((i: any) => i.status === 'paid')
      const now = new Date()
      const thisMonthRev = paid
        .filter((i: any) => new Date(i.created_at).getMonth() === now.getMonth())
        .reduce((s: any, i: any) => s + Number(i.total_amount), 0)

      const productCount = pData?.length || 0
      const userProfile = allProfiles?.find((p: any) => p.id === user.id)

      const badges = [
        { id: 'business', icon: '💎', name: 'وسام البيزنس', desc: 'تاجر معتمد في باقة الاحتراف', unlocked: (userProfile as any)?.plan_name === 'البيزنس' },
        { id: 'rocket', icon: '🚀', name: 'وسام الصاروخ', desc: 'أتممت ١٠ أوردرات ناجحة', unlocked: paid.length >= 10 },
        { id: 'gold', icon: '🏆', name: 'وسام الذهب', desc: 'إيرادات تخطت ٥٠٠٠ ج.م', unlocked: thisMonthRev >= 5000 },
        { id: 'stock', icon: '📦', name: 'خبير المخازن', desc: 'لديك أكثر من ٢٠ منتج', unlocked: productCount >= 20 },
        { id: 'loyal', icon: '⭐', name: 'شريك مؤسس', desc: 'من أوائل تجار المنصة', unlocked: true }
      ]

      setStats({
        totalSales: paid.length,
        productCount,
        badges
      })
    }
    loadData()
  }, [])

  return (
    <div className="p-6 bg-[#020202] min-height-screen text-white text-right" dir="rtl">
      <h1 className="text-2xl font-black text-[#D4AF37] mb-8 flex items-center gap-3">
        <Award size={32} /> قائمة الإنجازات
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.badges.map((badge: any) => (
          <div key={badge.id} className={`p-6 rounded-2xl border ${badge.unlocked ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-white/10 bg-white/5 opacity-50'}`}>
            <div className="text-4xl mb-4">{badge.icon}</div>
            <h3 className="text-xl font-bold mb-2">{badge.name}</h3>
            <p className="text-gray-400 text-sm">{badge.desc}</p>
            {badge.unlocked && <div className="mt-4 text-[#D4AF37] text-xs font-bold">✓ تم الإنجاز</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

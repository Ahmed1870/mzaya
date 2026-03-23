'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Lock, Crown, BarChart3, PieChart, Activity, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
  const supabase = createClient()
  const [data, setData] = useState({ revenue: 0, profit: 0, expenses: 0, sales: 0, cogs: 0 })
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState('مجانية')
  const [trials, setTrials] = useState(0)
  const MAX_TRIALS = 5 // زودناها شوية عشان التاجر ياخد ثقة

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profile }, { data: inv }, { data: exp }, { data: prod }] = await Promise.all([
        supabase.from('profiles').select('plan_name, trial_count').eq('id', user.id).maybeSingle(),
        supabase.from('invoices').select('*, invoice_items(*)').eq('user_id', user.id).eq('status', 'paid'),
        supabase.from('expenses').select('*').eq('user_id', user.id),
        supabase.from('products').select('id, cost').eq('user_id', user.id)
      ])

      const currentPlan = profile?.plan_name || 'مجانية'
      const currentTrials = profile?.trial_count || 0
      setPlan(currentPlan)
      setTrials(currentTrials)

      // حسابات سنيور دقيقة
      const totalRevenue = inv?.reduce((s, i) => s + (Number(i.total_amount) || 0), 0) || 0
      const operationalExpenses = exp?.reduce((s, e) => s + (Number(e.amount) || 0), 0) || 0
      
      const totalCogs = inv?.reduce((s, i) => {
        const invoiceCogs = i.invoice_items?.reduce((ss: number, item: any) => {
          const p = prod?.find(pr => pr.id === item.product_id)
          return ss + (Number(p?.cost || 0) * (item.quantity || 0))
        }, 0) || 0
        return s + invoiceCogs
      }, 0) || 0

      setData({
        revenue: totalRevenue,
        cogs: totalCogs,
        expenses: operationalExpenses,
        profit: totalRevenue - (totalCogs + operationalExpenses),
        sales: inv?.length || 0
      })

      // زيادة العداد فقط عند وجود بيانات (منطق ذكي)
      if (currentPlan === 'مجانية' && totalRevenue > 0 && currentTrials < MAX_TRIALS) {
        await supabase.from('profiles').update({ trial_count: currentTrials + 1 }).eq('id', user.id)
      }

      setLoading(false)
    }
    load()
  }, [])

  const isLocked = plan === 'مجانية' && trials >= MAX_TRIALS

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><div className="animate-spin" style={{width:30,height:30,border:'3px solid #D4AF37',borderTopColor:'transparent',borderRadius:'50%'}}/></div>

  return (
    <div className="animate-fade-up" style={{ position: 'relative', color: 'white', paddingBottom: '2rem' }}>
      
      {isLocked && (
        <div style={{ position: 'absolute', inset: '-10px', zIndex: 100, backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2rem', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div style={{ background: '#0a0a0a', padding: '2.5rem', borderRadius: '2.5rem', border: '1px solid #D4AF37', textAlign: 'center', maxWidth: '320px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ background: 'linear-gradient(45deg, #D4AF37, #AA8419)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 20px rgba(212,175,55,0.3)' }}>
              <Lock color="#000" size={24} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.5rem' }}>الرادار يحتاج ترقية 🚀</h2>
            <p style={{ color: '#555', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '2rem' }}>لقد استنفدت محاولات المشاهدة المجانية. اشترك الآن لفتح التقارير المالية المتقدمة.</p>
            <Link href="/dashboard/subscription" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', background: 'linear-gradient(45deg, #D4AF37, #fbf5b7)', color: '#000', padding: '1rem', borderRadius: '15px', fontWeight: 900, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                امتلك "مزايا برو" الآن <Crown size={18} />
              </button>
            </Link>
          </div>
        </div>
      )}

      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37' }}>📊 رادار الأرباح</h1>
          <div style={{ fontSize: '0.7rem', color: '#444', background: '#111', padding: '5px 12px', borderRadius: '99px', border: '1px solid #222' }}>
            نسخة: {plan} {plan === 'مجانية' && `(${trials}/${MAX_TRIALS})`}
          </div>
        </div>
        <p style={{ color: '#444', fontSize: '0.85rem' }}>تحليل الأداء المالي والنمو</p>
      </header>

      <div style={{ opacity: isLocked ? 0.2 : 1 }}>
        {/* Main Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#111', padding: '1.5rem', borderRadius: '1.8rem', border: '1px solid #222' }}>
            <div style={{ color: '#D4AF37', marginBottom: '10px' }}><Activity size={20} /></div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{formatPrice(data.revenue)}</div>
            <div style={{ fontSize: '0.7rem', color: '#444', marginTop: '4px' }}>إجمالي المبيعات</div>
          </div>
          <div style={{ background: '#111', padding: '1.5rem', borderRadius: '1.8rem', border: '1px solid #2ecc7120' }}>
            <div style={{ color: '#2ecc71', marginBottom: '10px' }}><TrendingUp size={20} /></div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2ecc71' }}>{formatPrice(data.profit)}</div>
            <div style={{ fontSize: '0.7rem', color: '#444', marginTop: '4px' }}>صافي الأرباح</div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #222' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="#D4AF37" /> تحليل المصروفات والتكاليف
          </h3>
          
          <div style={{ display: 'grid', gap: '1.2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
                <span style={{ color: '#666' }}>تكلفة البضاعة (COGS)</span>
                <span style={{ fontWeight: 700 }}>{formatPrice(data.cogs)}</span>
              </div>
              <div style={{ height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(data.cogs / data.revenue) * 100 || 0}%`, height: '100%', background: '#D4AF37' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
                <span style={{ color: '#666' }}>مصاريف تشغيلية</span>
                <span style={{ fontWeight: 700 }}>{formatPrice(data.expenses)}</span>
              </div>
              <div style={{ height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(data.expenses / data.revenue) * 100 || 0}%`, height: '100%', background: '#e74c3c' }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900 }}>{data.sales}</div>
              <div style={{ fontSize: '0.65rem', color: '#444' }}>عملية بيع</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900 }}>{((data.profit / data.revenue) * 100 || 0).toFixed(1)}%</div>
              <div style={{ fontSize: '0.65rem', color: '#444' }}>هامش الربح</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Download, TrendingUp, TrendingDown, Award, Star, Zap, Target, Trophy, Calendar } from 'lucide-react'

// ── Animated Counter ──
function Counter({ end, duration = 1500, prefix = '', suffix = '' }: any) {
  const [count, setCount] = useState(0)
  const ref = useRef<any>(null)
  useEffect(() => {
    let start = 0
    const step = end / (duration / 16)
    ref.current = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(ref.current) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(ref.current)
  }, [end])
  return <span>{prefix}{count.toLocaleString('ar-EG')}{suffix}</span>
}

// ── Line Chart ──
function LineChart({ thisMonth, lastMonth }: { thisMonth: number[], lastMonth: number[] }) {
  const max = Math.max(...thisMonth, ...lastMonth, 1)
  const W = 100, H = 60
  const points = (data: number[]) =>
    data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * H}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 120, overflow: 'visible' }}>
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="silverGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4361ee" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#4361ee" stopOpacity="0"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Grid lines */}
      {[0,1,2,3].map(i => (
        <line key={i} x1="0" y1={H*(i/3)} x2={W} y2={H*(i/3)} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
      ))}
      {/* Last month area */}
      <polygon points={`0,${H} ${points(lastMonth)} ${W},${H}`} fill="url(#silverGrad)"/>
      <polyline points={points(lastMonth)} fill="none" stroke="#4361ee" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="2,2"/>
      {/* This month area */}
      <polygon points={`0,${H} ${points(thisMonth)} ${W},${H}`} fill="url(#goldGrad)"/>
      <polyline points={points(thisMonth)} fill="none" stroke="#D4AF37" strokeWidth="2" filter="url(#glow)"/>
      {/* Dots */}
      {thisMonth.map((v, i) => (
        <circle key={i} cx={(i/(thisMonth.length-1))*W} cy={H-(v/max)*H} r="2" fill="#D4AF37" filter="url(#glow)"/>
      ))}
    </svg>
  )
}

export default function AchievementsPage() {
  const supabase = createClient()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: invoices }, { data: couriers }] = await Promise.all([
        supabase.from('invoices').select('*, invoice_items(*)'),
        supabase.from('couriers').select('*'),
      ])

      const inv = invoices || []
      const paid = inv.filter((i: any) => i.status === 'paid')
      const returned = inv.filter((i: any) => i.order_status === 'returned')
      const now = new Date()
      const thisMonthIdx = now.getMonth()
      const lastMonthIdx = (thisMonthIdx - 1 + 12) % 12

      // Monthly breakdown
      const monthly = Array(12).fill(0).map((_, mi) =>
        paid.filter((i: any) => new Date(i.created_at).getMonth() === mi)
          .reduce((s: number, i: any) => s + Number(i.total_amount), 0)
      )

      const thisMonthDaily = Array(30).fill(0).map((_, di) => {
        const d = new Date(now.getFullYear(), thisMonthIdx, di + 1)
        return paid.filter((i: any) => {
          const id = new Date(i.created_at)
          return id.getFullYear() === d.getFullYear() && id.getMonth() === d.getMonth() && id.getDate() === d.getDate()
        }).reduce((s: number, i: any) => s + Number(i.total_amount), 0)
      })

      const lastMonthDays = new Date(now.getFullYear(), lastMonthIdx + 1, 0).getDate()
      const lastMonthDaily = Array(lastMonthDays).fill(0).map((_, di) => {
        const d = new Date(now.getFullYear(), lastMonthIdx, di + 1)
        return paid.filter((i: any) => {
          const id = new Date(i.created_at)
          return id.getFullYear() === d.getFullYear() && id.getMonth() === d.getMonth() && id.getDate() === d.getDate()
        }).reduce((s: number, i: any) => s + Number(i.total_amount), 0)
      })

      // Best month
      const bestMonthIdx = monthly.indexOf(Math.max(...monthly))
      const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

      // Best courier
      const courierMap: Record<string, number> = {}
      paid.forEach((i: any) => { if (i.courier_name) courierMap[i.courier_name] = (courierMap[i.courier_name] || 0) + 1 })
      const bestCourier = Object.entries(courierMap).sort(([,a],[,b]) => b - a)[0]

      // This month stats
      const thisMonthOrders = inv.filter((i: any) => new Date(i.created_at).getMonth() === thisMonthIdx)
      const lastMonthOrders = inv.filter((i: any) => new Date(i.created_at).getMonth() === lastMonthIdx)
      const thisRevenue = paid.filter((i: any) => new Date(i.created_at).getMonth() === thisMonthIdx).reduce((s: number,i: any) => s+Number(i.total_amount), 0)
      const lastRevenue = paid.filter((i: any) => new Date(i.created_at).getMonth() === lastMonthIdx).reduce((s: number,i: any) => s+Number(i.total_amount), 0)
      const growth = lastRevenue > 0 ? ((thisRevenue - lastRevenue) / lastRevenue * 100) : 0

      // Badges
      const returnRate = inv.length > 0 ? (returned.length / inv.length) * 100 : 0
      const badges = [
        { id: 'rocket', icon: '🚀', name: 'وسام الصاروخ', desc: '١٠٠ أوردر في شهر', unlocked: thisMonthOrders.length >= 100 },
        { id: 'precision', icon: '🎯', name: 'وسام الدقة', desc: 'نسبة مرتجعات أقل من ٥٪', unlocked: returnRate < 5 && inv.length > 0 },
        { id: 'gold', icon: '🏆', name: 'وسام الذهب', desc: 'إيراد شهري أكثر من ١٠,٠٠٠ ج', unlocked: thisRevenue >= 10000 },
        { id: 'growth', icon: '📈', name: 'وسام النمو', desc: 'نمو ٢٠٪ عن الشهر السابق', unlocked: growth >= 20 },
        { id: 'loyalty', icon: '⭐', name: 'وسام الولاء', desc: 'استخدام مزايا أكثر من شهر', unlocked: true },
        { id: 'first', icon: '🥇', name: 'وسام البداية', desc: 'أول أوردر ناجح', unlocked: paid.length > 0 },
      ]

      // Top products
      const prodMap: Record<string, { name: string, revenue: number, count: number }> = {}
      paid.forEach((inv: any) => {
        (inv.invoice_items || []).forEach((item: any) => {
          const k = item.product_name
          if (!prodMap[k]) prodMap[k] = { name: k, revenue: 0, count: 0 }
          prodMap[k].revenue += Number(item.total_price)
          prodMap[k].count += Number(item.quantity)
        })
      })
      const topProducts = Object.values(prodMap).sort((a,b) => b.revenue - a.revenue).slice(0,5)

      setData({
        totalOrders: inv.length,
        paidOrders: paid.length,
        totalRevenue: paid.reduce((s: number, i: any) => s + Number(i.total_amount), 0),
        returnRate: returnRate.toFixed(1),
        growth: growth.toFixed(1),
        bestMonth: months[bestMonthIdx],
        bestMonthRevenue: monthly[bestMonthIdx],
        bestCourier: bestCourier ? { name: bestCourier[0], count: bestCourier[1] } : null,
        thisMonthOrders: thisMonthOrders.length,
        lastMonthOrders: lastMonthOrders.length,
        thisRevenue, lastRevenue,
        thisMonthDaily: thisMonthDaily.slice(0, now.getDate()),
        lastMonthDaily,
        badges, topProducts, months,
        monthly,
        userName: user.user_metadata?.full_name || 'التاجر',
        shopName: user.user_metadata?.shop_name || 'مزايا',
      })
      setLoading(false)
    }
    load()
  }, [])

  const exportReport = () => {
    if (!data) return
    setExporting(true)
    const content = `تقرير مزايا - ${data.shopName}
تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}
=====================================

📊 ملخص الأداء:
- إجمالي الأوردرات: ${data.totalOrders}
- الأوردرات الناجحة: ${data.paidOrders}
- إجمالي الإيرادات: ${formatPrice(data.totalRevenue)}
- نسبة المرتجعات: ${data.returnRate}%
- النمو عن الشهر السابق: ${data.growth}%

🏆 أفضل شهر: ${data.bestMonth} (${formatPrice(data.bestMonthRevenue)})
${data.bestCourier ? `🛵 أفضل مندوب: ${data.bestCourier.name} (${data.bestCourier.count} توصيلة)` : ''}

📦 أفضل المنتجات:
${data.topProducts.map((p: any, i: number) => `${i+1}. ${p.name}: ${formatPrice(p.revenue)} (${p.count} قطعة)`).join('\n')}

🏅 الأوسمة المحققة:
${data.badges.filter((b: any) => b.unlocked).map((b: any) => `${b.icon} ${b.name}: ${b.desc}`).join('\n')}
=====================================
Powered by MAZAYA`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mazaya-report-${new Date().toISOString().slice(0,10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setTimeout(() => setExporting(false), 1000)
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:'1rem'}}>
      <div style={{width:40,height:40,border:'2px solid rgba(212,175,55,0.15)',borderTopColor:'#D4AF37',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <p style={{color:'rgba(255,255,255,0.25)',fontSize:'.875rem'}}>يتم تحليل بياناتك...</p>
    </div>
  )

  const { growth, thisRevenue, lastRevenue } = data
  const isGrowth = Number(growth) >= 0

  return (
    <div className="animate-fade-up" style={{display:'grid',gap:'1.5rem'}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem'}}>
        <div>
          <h1 className="page-title">🏆 مركز الإنجازات</h1>
          <p style={{color:'rgba(255,255,255,0.35)',fontSize:'.875rem'}}>تقرير أداء {data.shopName}</p>
        </div>
        <button onClick={exportReport} disabled={exporting} className="btn-primary" style={{fontSize:'.85rem',padding:'.65rem 1.25rem'}}>
          <Download size={14}/> {exporting ? 'جاري التحميل...' : 'تحميل التقرير'}
        </button>
      </div>

      {/* Hero KPIs */}
      <div style={{
        background:'linear-gradient(135deg,#080808 0%,#0f0f08 50%,#080808 100%)',
        border:'1px solid rgba(212,175,55,0.2)',borderRadius:'1.5rem',padding:'2rem',
        position:'relative',overflow:'hidden',
        boxShadow:'0 0 60px rgba(212,175,55,0.05), 0 0 120px rgba(212,175,55,0.03)'
      }}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 30% 50%,rgba(212,175,55,0.04),transparent 60%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:0,left:0,right:0,height:'1px',background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.5),transparent)'}}/>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'2rem',position:'relative',zIndex:1}}>
          {[
            { label:'إجمالي الأوردرات', value:data.totalOrders, suffix:'', color:'#D4AF37', icon:'📦' },
            { label:'أوردرات ناجحة', value:data.paidOrders, suffix:'', color:'#2ecc71', icon:'✅' },
            { label:'إجمالي الإيرادات', value:Math.round(data.totalRevenue), suffix:' ج', color:'#D4AF37', icon:'💰', big:true },
            { label:'نسبة المرتجعات', value:parseFloat(data.returnRate), suffix:'%', color: parseFloat(data.returnRate)<5?'#2ecc71':'#e74c3c', icon:'↩️' },
          ].map((kpi,i) => (
            <div key={i} style={{textAlign:'center'}}>
              <div style={{fontSize:'1.8rem',marginBottom:'.5rem'}}>{kpi.icon}</div>
              <div style={{fontFamily:'Tajawal,sans-serif',fontWeight:900,fontSize:(kpi as any).big?'1.4rem':'2rem',color:kpi.color,textShadow:`0 0 20px ${kpi.color}40`,lineHeight:1}}>
                <Counter end={kpi.value} suffix={kpi.suffix}/>
              </div>
              <div style={{fontSize:'.72rem',color:'rgba(255,255,255,0.3)',marginTop:'.4rem'}}>{kpi.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Comparison */}
      <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:'1.5rem'}}>
        <div style={{background:'#0A0A0A',border:'1px solid rgba(212,175,55,0.12)',borderRadius:'1.5rem',padding:'1.5rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <h3 style={{fontFamily:'Tajawal,sans-serif',fontWeight:700,color:'white',margin:0,fontSize:'.95rem'}}>📊 مقارنة الأداء</h3>
            <div style={{display:'flex',gap:'1rem',fontSize:'.72rem'}}>
              <span style={{display:'flex',alignItems:'center',gap:'.3rem',color:'#D4AF37'}}><span style={{width:20,height:2,background:'#D4AF37',display:'inline-block',borderRadius:1}}/>هذا الشهر</span>
              <span style={{display:'flex',alignItems:'center',gap:'.3rem',color:'#4361ee'}}><span style={{width:20,height:2,background:'#4361ee',display:'inline-block',borderRadius:1,opacity:.6}}/>الشهر السابق</span>
            </div>
          </div>
          <LineChart thisMonth={data.thisMonthDaily} lastMonth={data.lastMonthDaily}/>
          <div className="gold-divider" style={{margin:'1rem 0'}}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            {[
              { label:'هذا الشهر', value:thisRevenue, color:'#D4AF37', orders:data.thisMonthOrders },
              { label:'الشهر السابق', value:lastRevenue, color:'rgba(255,255,255,0.4)', orders:data.lastMonthOrders },
            ].map((s,i) => (
              <div key={i} style={{padding:'.75rem',background:'rgba(255,255,255,0.03)',borderRadius:'.75rem'}}>
                <p style={{fontSize:'.72rem',color:'rgba(255,255,255,0.3)',marginBottom:'.3rem'}}>{s.label}</p>
                <p style={{fontWeight:700,color:s.color,fontSize:'1rem'}}>{formatPrice(s.value)}</p>
                <p style={{fontSize:'.7rem',color:'rgba(255,255,255,0.3)',marginTop:'.2rem'}}>{s.orders} أوردر</p>
              </div>
            ))}
          </div>
          <div style={{
            marginTop:'1rem',padding:'.85rem 1rem',borderRadius:'.85rem',
            background: isGrowth ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.08)',
            border:`1px solid ${isGrowth ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)'}`,
            display:'flex',alignItems:'center',gap:'.6rem'
          }}>
            {isGrowth ? <TrendingUp size={18} color="#2ecc71"/> : <TrendingDown size={18} color="#e74c3c"/>}
            <div>
              <span style={{fontFamily:'Tajawal,sans-serif',fontWeight:900,fontSize:'1.1rem',color: isGrowth?'#2ecc71':'#e74c3c'}}>
                {isGrowth?'+':''}{growth}%
              </span>
              <span style={{color:'rgba(255,255,255,0.4)',fontSize:'.8rem',marginRight:'.5rem'}}> عن الشهر السابق</span>
            </div>
          </div>
        </div>

        {/* Year Summary */}
        <div style={{background:'#0A0A0A',border:'1px solid rgba(212,175,55,0.12)',borderRadius:'1.5rem',padding:'1.5rem',display:'grid',gap:'1rem',alignContent:'start'}}>
          <h3 style={{fontFamily:'Tajawal,sans-serif',fontWeight:700,color:'white',margin:0,fontSize:'.95rem'}}>📅 ملخص السنة</h3>
          <div style={{padding:'1.25rem',background:'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(10,10,10,0.9))',borderRadius:'1rem',border:'1px solid rgba(212,175,55,0.15)',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'.4rem'}}>🌟</div>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'.72rem',marginBottom:'.2rem'}}>أفضل شهر</p>
            <p style={{fontFamily:'Tajawal,sans-serif',fontWeight:900,fontSize:'1.2rem',color:'#D4AF37'}}>{data.bestMonth}</p>
            <p style={{fontSize:'.8rem',color:'rgba(255,255,255,0.5)',marginTop:'.2rem'}}>{formatPrice(data.bestMonthRevenue)}</p>
          </div>
          {data.bestCourier && (
            <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',borderRadius:'1rem',border:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',gap:'.85rem'}}>
              <div style={{fontSize:'1.8rem'}}>🛵</div>
              <div>
                <p style={{color:'rgba(255,255,255,0.35)',fontSize:'.7rem',margin:0}}>أفضل مندوب</p>
                <p style={{fontWeight:700,color:'white',fontSize:'.9rem',margin:'.2rem 0 0'}}>{data.bestCourier.name}</p>
                <p style={{color:'rgba(255,255,255,0.35)',fontSize:'.72rem',margin:'.1rem 0 0'}}>{data.bestCourier.count} توصيلة</p>
              </div>
            </div>
          )}
          <div style={{display:'grid',gap:'.5rem'}}>
            <p style={{color:'rgba(255,255,255,0.3)',fontSize:'.72rem',margin:0}}>🏆 أفضل المنتجات</p>
            {data.topProducts.slice(0,3).map((p: any, i: number) => (
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.55rem .75rem',background:'rgba(255,255,255,0.03)',borderRadius:'.6rem'}}>
                <span style={{fontSize:'.75rem',color:'rgba(255,255,255,0.5)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{p.name}</span>
                <span style={{fontSize:'.75rem',fontWeight:700,color:'#D4AF37',flexShrink:0,marginRight:'.5rem'}}>{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div style={{background:'#0A0A0A',border:'1px solid rgba(212,175,55,0.12)',borderRadius:'1.5rem',padding:'1.5rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'.75rem',marginBottom:'1.5rem'}}>
          <div style={{width:36,height:36,borderRadius:'.75rem',background:'rgba(212,175,55,0.1)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 12px rgba(212,175,55,0.15)'}}>
            <Award size={18} color="#D4AF37"/>
          </div>
          <div>
            <h3 style={{fontFamily:'Tajawal,sans-serif',fontWeight:700,color:'white',margin:0}}>أوسمة مزايا</h3>
            <p style={{color:'rgba(255,255,255,0.3)',fontSize:'.75rem',margin:0}}>{data.badges.filter((b:any)=>b.unlocked).length} من {data.badges.length} محققة</p>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'1rem'}}>
          {data.badges.map((badge: any) => (
            <div key={badge.id} style={{
              padding:'1.25rem',borderRadius:'1.25rem',textAlign:'center',
              background: badge.unlocked ? 'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(10,10,10,0.9))' : 'rgba(255,255,255,0.03)',
              border:`1px solid ${badge.unlocked ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.06)'}`,
              boxShadow: badge.unlocked ? '0 0 20px rgba(212,175,55,0.08)' : 'none',
              filter: badge.unlocked ? 'none' : 'grayscale(1) opacity(0.4)',
              transition:'all .3s',position:'relative',overflow:'hidden'
            }}>
              {badge.unlocked && <div style={{position:'absolute',top:0,left:0,right:0,height:'1px',background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.6),transparent)'}}/>}
              <div style={{fontSize:'2.5rem',marginBottom:'.6rem',filter: badge.unlocked ? 'drop-shadow(0 0 8px rgba(212,175,55,0.4))' : 'none'}}>{badge.icon}</div>
              <p style={{fontWeight:700,fontSize:'.82rem',color: badge.unlocked ? '#D4AF37' : 'rgba(255,255,255,0.3)',marginBottom:'.3rem'}}>{badge.name}</p>
              <p style={{fontSize:'.68rem',color:'rgba(255,255,255,0.3)',lineHeight:1.4}}>{badge.desc}</p>
              {badge.unlocked && <div style={{marginTop:'.6rem',fontSize:'.65rem',color:'rgba(212,175,55,0.6)',fontWeight:700}}>✅ محقق</div>}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Download, TrendingUp, TrendingDown, Award, Star, Zap, Target, Trophy, Calendar, RefreshCw, Users } from 'lucide-react'
import { PDFDownloadLink, Document, Page, Text, View, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Cairo',
  src: 'https://fonts.gstatic.com/s/cairo/v20/SLVPE1_6n78vS2m9NYY.ttf'
});

const MazayaPDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={{ padding: 40, backgroundColor: '#050505', color: '#fff', fontFamily: 'Cairo' }}>
      <View style={{ border: '4pt solid #D4AF37', padding: 30, height: '100%', position: 'relative' }}>
        <Text style={{ fontSize: 38, color: '#D4AF37', textAlign: 'center', marginBottom: 10 }}>مـزايـا</Text>
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 40, color: '#888' }}>MAZAYA E-COMMERCE HUB</Text>
        <View style={{ textAlign: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 22, marginBottom: 10 }}>شهادة تميز تجاري</Text>
          <Text style={{ fontSize: 14, color: '#aaa' }}>تمنح هذه الشهادة لمتجر</Text>
          <Text style={{ fontSize: 26, color: '#D4AF37', marginTop: 10, fontWeight: 'bold' }}>{data.shopName}</Text>
        </View>
        <View style={{ borderTop: '1pt solid #222', paddingTop: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 14, marginBottom: 10 }}>المركز الحالي في المنصة: #{data.rank}</Text>
          <Text style={{ fontSize: 12, color: '#888' }}>• إجمالي الأرباح المحققة: {formatPrice(data.totalRevenue)}</Text>
          <Text style={{ fontSize: 12, color: '#888' }}>• الأوردرات المكتملة: {data.paidOrders} أوردر</Text>
        </View>
        <View>
          <Text style={{ fontSize: 14, color: '#D4AF37', marginBottom: 10 }}>الأوسمة المحققة:</Text>
          {data.badges.filter((b: any) => b.unlocked).map((b: any, i: number) => (
            <Text key={i} style={{ fontSize: 11, color: '#fff', marginBottom: 4 }}>✓ {b.name}: {b.desc}</Text>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

function Counter({ end, suffix = '' }: any) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0; const duration = 1000; const step = end / (duration / 16);
    const timer = setInterval(() => { start += step; if (start >= end) { setCount(end); clearInterval(timer); } else setCount(Math.floor(start)); }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count.toLocaleString('ar-EG')}{suffix}</span>
}

function LineChart({ thisMonth, lastMonth }: { thisMonth: number[], lastMonth: number[] }) {
  const max = Math.max(...thisMonth, ...lastMonth, 1); const W = 100, H = 50;
  const points = (data: number[]) => data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * H}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 100, overflow: 'visible' }}>
      <polyline points={points(lastMonth)} fill="none" stroke="#4361ee" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="2,1"/>
      <polyline points={points(thisMonth)} fill="none" stroke="#D4AF37" strokeWidth="2"/>
    </svg>
  )
}

export default function AchievementsPage() {
  const supabase = createClient()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: invData }, { count: productCount }, { count: referralCount }, { data: allProfiles }] = await Promise.all([
        supabase.from('invoices').select('*').eq('user_id', user.id),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('commissions').select('*', { count: 'exact', head: true }).eq('referrer_id', user.id),
        supabase.from('profiles').select('id')
      ])
      const inv = invData || []; const paid = inv.filter(i => i.status === 'paid'); const now = new Date();
      const thisMonthRev = paid.filter(i => new Date(i.created_at).getMonth() === now.getMonth()).reduce((s, i) => s + Number(i.total_amount), 0);
      const badges = [
        { id: 'rocket', icon: '🚀', name: 'وسام الصاروخ', desc: 'أتممت ١٠ أوردرات ناجحة', unlocked: paid.length >= 10 },
        { id: 'gold', icon: '🏆', name: 'وسام الذهب', desc: 'إيرادات تخطت ٥٠٠٠ ج.م', unlocked: thisMonthRev >= 5000 },
        { id: 'stock', icon: '📦', name: 'خبير المخازن', desc: 'لديك أكثر من ٢٠ منتج', unlocked: (productCount || 0) >= 20 },
        { id: 'loyal', icon: '⭐', name: 'شريك مؤسس', desc: 'من أوائل تجار المنصة', unlocked: true },
      ]
      setData({
        shopName: user.user_metadata?.shop_name || 'تاجر مزايا',
        totalRevenue: paid.reduce((s, i) => s + Number(i.total_amount), 0),
        paidOrders: paid.length, rank: 1 + (allProfiles?.length || 0) % 10,
        thisMonthDaily: Array(now.getDate()).fill(0).map((_, i) => paid.filter(d => new Date(d.created_at).getDate() === i+1).reduce((s,d) => s+Number(d.total_amount), 0)),
        lastMonthDaily: Array(30).fill(0), badges
      }); setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><RefreshCw className="animate-spin" color="#D4AF37" size={40}/></div>

  return (
    <div className="animate-fade-up" style={{display: 'grid', gap: '1.5rem', direction: 'rtl', fontFamily: 'Tajawal, sans-serif'}}>
      <div style={{background: 'rgba(212,175,55,0.1)', border: '1px dashed #D4AF37', padding: '15px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><Trophy size={20} color="#D4AF37"/><span style={{color: '#fff', fontSize: '.9rem'}}>المركز العالمي:</span></div>
        <span style={{color: '#D4AF37', fontWeight: 900}}>#{data.rank}</span>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 style={{fontSize: '1.5rem', color: '#D4AF37'}}>🏆 الإنجازات</h1>
        <PDFDownloadLink document={<MazayaPDF data={data} />} fileName="Success.pdf">
          {({ loading }) => <button style={{background: '#D4AF37', color: '#000', padding: '8px 15px', borderRadius: '10px', fontWeight: 'bold'}}>{loading ? '...' : 'الشهادة'}</button>}
        </PDFDownloadLink>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
        <div style={statCard}><div style={{fontSize: '1.2rem', color: '#D4AF37'}}><Counter end={data.totalRevenue}/></div><div style={{fontSize: '.6rem'}}>إيرادات</div></div>
        <div style={statCard}><div style={{fontSize: '1.2rem', color: '#2ecc71'}}><Counter end={data.paidOrders}/></div><div style={{fontSize: '.6rem'}}>أوردرات</div></div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem'}}>
        {data.badges.map((badge: any) => (
          <div key={badge.id} style={{padding: '1rem', background: '#0A0A0A', borderRadius: '15px', border: `1px solid ${badge.unlocked ? '#D4AF37' : '#1a1a1a'}`, opacity: badge.unlocked ? 1 : 0.3}}>
            <div style={{fontSize: '2rem'}}>{badge.icon}</div><div style={{fontSize: '.8rem', color: '#fff'}}>{badge.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
const statCard = { background: '#0A0A0A', padding: '15px', borderRadius: '15px', border: '1px solid #1a1a1a', textAlign: 'center' as const }

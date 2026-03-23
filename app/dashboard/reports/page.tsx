'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { PieChart, TrendingUp, Download, RefreshCw, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react'
import Swal from 'sweetalert2'

export default function ReportsPage() {
  const supabase = createClient()
  const [data, setData] = useState({ inv: [], wallet: null, profile: null })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [generating, setGenerating] = useState(false)

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: inv }, { data: wall }, { data: prof }] = await Promise.all([
      supabase.from('invoices').select('*').eq('status', 'paid'),
      supabase.from('wallet').select('*').eq('user_id', user.id).single(),
      supabase.from('profiles').select('*').eq('id', user.id).single()
    ])
    setData({ inv: inv || [], wallet: wall, profile: prof })
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const filterItems = (items: any[]) => {
    const now = new Date()
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365
    return items.filter(i => (now.getTime() - new Date(i.created_at).getTime()) <= days * 86400000)
  }

  const filteredInv = filterItems(data.inv)
  const totalRev = filteredInv.reduce((s, i) => s + Number(i.total_amount), 0)
  const totalComm = filteredInv.reduce((s, i) => s + Number(i.commission_amount || 0), 0)
  const netProfit = totalRev - totalComm

  const handleDownload = () => {
    setGenerating(true)
    const date = new Date().toLocaleDateString('ar-EG')
    
    // إعداد بيانات الإكسيل
    const headers = ["رقم الفاتورة", "التاريخ", "المبلغ الإجمالي", "العمولة", "صافي الربح"]
    const rows = filteredInv.map(i => [
      i.id.substring(0, 8),
      new Date(i.created_at).toLocaleDateString('ar-EG'),
      i.total_amount,
      i.commission_amount || 0,
      (i.total_amount - (i.commission_amount || 0))
    ])

    // إضافة \uFEFF لضمان دعم اللغة العربية في Excel (UTF-8 BOM)
    let csvContent = "\uFEFF" + headers.join(",") + "\n"
    rows.forEach(row => {
      csvContent += row.join(",") + "\n"
    })

    // إضافة ملخص في آخر الملف
    csvContent += `\nإجمالي المبيعات,${totalRev}\n`
    csvContent += `صافي الأرباح,${netProfit}\n`
    csvContent += `اسم المتجر,${data.profile?.business_name || data.profile?.shop_name}\n`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `تقرير-مزايا-${date}.csv`
    a.click()
    
    setGenerating(false)
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'تم تحميل التقرير بنجاح ✅', showConfirmButton: false, timer: 2500 })
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><RefreshCw className="animate-spin" color="#D4AF37"/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={28} /> تحليلات الأداء
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>راقب نمو مبيعاتك وأرباحك</p>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', background: '#111', padding: '5px', borderRadius: '15px' }}>
        {['week', 'month', 'year'].map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
            background: period === p ? '#D4AF37' : 'transparent',
            color: period === p ? '#000' : '#888',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: '0.3s'
          }}>
            {p === 'week' ? 'أسبوع' : p === 'month' ? 'شهر' : 'سنة'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '1.8rem', border: '1px solid #222' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2ecc71', marginBottom: '0.5rem' }}>
            <ArrowUpRight size={18} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>إيرادات</span>
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900 }}>{formatPrice(totalRev)}</h2>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '1.8rem', border: '1px solid #222' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D4AF37', marginBottom: '0.5rem' }}>
            <TrendingUp size={18} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>صافي أرباح</span>
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900 }}>{formatPrice(netProfit)}</h2>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #111 0%, #080808 100%)', padding: '2rem', borderRadius: '2.2rem', border: '1px solid #222', textAlign: 'center' }}>
        <Download size={32} color="#D4AF37" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>تحميل شيت البيانات</h3>
        <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '1.5rem' }}>تحميل تقرير مفصل بصيغة CSV يفتح على جميع الموبايلات لدراسة أداء التجارة.</p>
        <button onClick={handleDownload} disabled={generating} style={{
          width: '100%', padding: '1rem', borderRadius: '15px', border: 'none',
          background: '#D4AF37', color: '#000', fontWeight: 900, cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(212,175,55,0.15)'
        }}>
          {generating ? 'جاري التصدير...' : 'تصدير بيانات المبيعات'}
        </button>
      </div>
    </div>
  )
}

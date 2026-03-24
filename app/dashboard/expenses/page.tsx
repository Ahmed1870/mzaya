'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Receipt, RefreshCw, ArrowDownCircle, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'

export default function ExpensesPage() {
  const supabase = createClient()
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [balance, setBalance] = useState(0)
  const [form, setForm] = useState({ title: '', amount: '' })

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const [expData, walletData] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('wallet').select('balance').eq('user_id', user.id).maybeSingle()
    ])
    
    setExpenses(expData.data || [])
    setBalance(walletData.data?.balance || 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number(form.amount)
    if (!amt || amt <= 0 || !form.title.trim()) return
    
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('غير مسجل')

      // الربط مع أعمدة الجداول: name و amount
      const { error } = await supabase.from('expenses').insert([{ 
        name: form.title.trim(), 
        amount: amt, 
        user_id: user.id 
      }])
      
      if (error) throw error

      setForm({ title: '', amount: '' })
      await load() 
      
      Swal.fire({ 
        toast: true, position: 'top-end', icon: 'success', 
        title: 'تم تسجيل المصروف وتحديث المحفظة تلقائياً', 
        showConfirmButton: false, timer: 2000, background: '#111', color: '#fff' 
      })
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'خطأ', text: err.message, background: '#111', color: '#fff' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><Loader2 className="animate-spin" color="#D4AF37"/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem', direction: 'rtl' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt size={28} /> إدارة المصاريف
          </h1>
          <p style={{ color: '#444', fontSize: '0.85rem' }}>مراقبة التكاليف التشغيلية</p>
        </div>
        <div style={{ background: '#111', padding: '1rem 1.5rem', borderRadius: '1.5rem', border: '1px solid #222', textAlign: 'right' }}>
          <p style={{ fontSize: '0.7rem', color: '#444', marginBottom: '4px' }}>رصيد المحفظة</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 950, color: '#2ecc71', margin: 0 }}>{formatPrice(balance)}</p>
        </div>
      </header>

      <form onSubmit={handleAdd} style={{ background: '#111', padding: '1.8rem', borderRadius: '2rem', border: '1px solid #222', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: '#666', marginBottom: '8px', display: 'block' }}>بيان المصروف</label>
          <input required style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1.1rem', borderRadius: '18px', color: '#fff', outline: 'none' }} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="مثلاً: إيجار، فاتورة، صيانة..." />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: '#666', marginBottom: '8px', display: 'block' }}>المبلغ</label>
          <input required type="number" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1.1rem', borderRadius: '18px', color: '#ff7675', fontWeight: 900, outline: 'none' }} value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" />
        </div>
        <button disabled={saving} type="submit" style={{ background: 'linear-gradient(45deg, #e74c3c, #ff7675)', color: '#fff', border: 'none', padding: '1.1rem', borderRadius: '18px', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {saving ? <RefreshCw className="animate-spin" size={20}/> : <><ArrowDownCircle size={20}/> تسجيل وخصم</>}
        </button>
      </form>

      <div style={{ background: '#111', borderRadius: '2rem', overflow: 'hidden', border: '1px solid #222' }}>
        <div style={{ padding: '1.5rem', fontWeight: 900, fontSize: '1rem', borderBottom: '1px solid #222', background: '#0c0c0c' }}>السجل المالي للمصاريف</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#080808', color: '#444', fontSize: '0.75rem' }}>
              <tr>
                <th style={{ padding: '1.2rem', textAlign: 'right' }}>البيان</th>
                <th style={{ padding: '1.2rem', textAlign: 'right' }}>التاريخ</th>
                <th style={{ padding: '1.2rem', textAlign: 'left' }}>القيمة</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: '4rem', textAlign: 'center', color: '#444' }}>لا توجد مصاريف حالية</td></tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '1.2rem' }}><div style={{ fontWeight: 800 }}>{exp.name}</div></td>
                    <td style={{ padding: '1.2rem', color: '#444', fontSize: '0.8rem' }}>{new Date(exp.created_at).toLocaleDateString('ar-EG')}</td>
                    <td style={{ padding: '1.2rem', fontWeight: 950, color: '#ff7675', textAlign: 'left' }}>-{formatPrice(exp.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

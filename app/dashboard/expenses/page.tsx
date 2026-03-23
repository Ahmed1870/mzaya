'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Receipt, Plus, Trash2, Tag, RefreshCw, Wallet, ArrowDownCircle } from 'lucide-react'
import Swal from 'sweetalert2'

export default function ExpensesPage() {
  const supabase = createClient()
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [balance, setBalance] = useState(0)
  const [form, setForm] = useState({ title: '', amount: '', category: 'تشغيل' })

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // تحميل المصروفات والرصيد الحالي
    const { data: expData } = await supabase.from('expenses').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    const { data: walletData } = await supabase.from('wallet').select('balance').eq('user_id', user.id).maybeSingle()
    
    setExpenses(expData || [])
    setBalance(walletData?.balance || 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number(form.amount)
    if (!amt || amt <= 0) return
    
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('غير مسجل')

      // 1. تسجيل المصروف
      const { error: expErr } = await supabase.from('expenses').insert([{ 
        title: form.title, 
        amount: amt, 
        category: form.category, 
        user_id: user.id 
      }])
      if (expErr) throw expErr

      // 2. تحديث رصيد المحفظة (خصم)
      const { error: walletErr } = await supabase.from('wallet').update({ 
        balance: balance - amt 
      }).eq('user_id', user.id)
      if (walletErr) throw walletErr

      // 3. تسجيل المعاملة في السجل المالي
      await supabase.from('transactions').insert([{
        user_id: user.id,
        amount: amt,
        type: 'expense',
        category: 'expenses',
        description: `مصروف: ${form.title}`
      }])

      setForm({ title: '', amount: '', category: 'تشغيل' })
      await load()
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'تم الخصم من المحفظة ✅', showConfirmButton: false, timer: 2000, background: '#111', color: '#fff' })
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'خطأ في العملية', text: err.message, background: '#111', color: '#fff' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><RefreshCw className="animate-spin" color="#D4AF37"/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt size={28} /> إدارة المصاريف
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>سجل تكاليفك لضبط ميزان أرباحك</p>
        </div>
        <div style={{ background: '#111', padding: '0.8rem 1.2rem', borderRadius: '1rem', border: '1px solid #222', textAlign: 'left' }}>
          <p style={{ fontSize: '0.65rem', color: '#444', margin: 0 }}>الرصيد المتاح</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: 0 }}>{formatPrice(balance)}</p>
        </div>
      </header>

      <form onSubmit={handleAdd} style={{ background: '#111', padding: '1.5rem', borderRadius: '1.8rem', border: '1px solid #222', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: '#444', marginBottom: '0.5rem', display: 'block' }}>بيان المصروف</label>
          <input required style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1rem', borderRadius: '15px', color: '#fff' }} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="إيجار، كهرباء، شحن..." />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: '#444', marginBottom: '0.5rem', display: 'block' }}>المبلغ المستقطع</label>
          <input required type="number" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1rem', borderRadius: '15px', color: '#fff' }} value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" />
        </div>
        <button disabled={saving} type="submit" style={{ background: 'linear-gradient(45deg, #e74c3c, #ff7675)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '15px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {saving ? <RefreshCw className="animate-spin" size={18}/> : <><ArrowDownCircle size={18}/> تسجيل وخصم</>}
        </button>
      </form>

      <div style={{ background: '#111', borderRadius: '2rem', overflow: 'hidden', border: '1px solid #222' }}>
        <div style={{ padding: '1.2rem', fontWeight: 800, fontSize: '0.9rem', borderBottom: '1px solid #222', color: '#D4AF37' }}>سجل المصاريف الأخيرة</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#080808', color: '#444', fontSize: '0.75rem' }}>
              <tr>
                <th style={{ padding: '1.2rem', textAlign: 'right' }}>البند</th>
                <th style={{ padding: '1.2rem', textAlign: 'right' }}>التاريخ</th>
                <th style={{ padding: '1.2rem', textAlign: 'right' }}>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: '#444', fontSize: '0.85rem' }}>لا توجد مصاريف مسجلة</td></tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '1.2rem' }}><div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{exp.title}</div></td>
                    <td style={{ padding: '1.2rem', color: '#444', fontSize: '0.75rem' }}>{new Date(exp.created_at).toLocaleDateString('ar-EG')}</td>
                    <td style={{ padding: '1.2rem', fontWeight: 900, color: '#ff7675' }}>-{formatPrice(exp.amount)}</td>
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

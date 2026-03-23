'use client'
import { useState } from 'react'
import { formatPrice, calcProfit } from '@/lib/utils'
import { TrendingUp, TrendingDown, RefreshCcw, Info, Calculator, Percent } from 'lucide-react'

export default function CalculatorPage() {
  const [form, setForm] = useState({ sellingPrice: '', costPrice: '', shippingCost: '', extra: '0', quantity: '1' })

  const price = Number(form.sellingPrice) || 0
  const cost = Number(form.costPrice) || 0
  const shipping = Number(form.shippingCost) || 0
  const extra = Number(form.extra) || 0
  const qty = Number(form.quantity) || 1

  const { profit, margin } = calcProfit(price, cost + extra, shipping)
  const totalProfit = profit * qty
  const profitColor = profit >= 0 ? '#2ecc71' : '#e74c3c'

  const reset = () => setForm({ sellingPrice: '', costPrice: '', shippingCost: '', extra: '0', quantity: '1' })

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calculator size={28} /> حاسبة الأرباح
          </h1>
          <p style={{ color: '#444', fontSize: '0.85rem' }}>احسب صافي ربحك بدقة قبل البدء</p>
        </div>
        <button onClick={reset} style={{ background: '#111', border: 'none', color: '#666', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
          <RefreshCcw size={20} />
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {/* Input Card */}
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #222' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem', display: 'block' }}>سعر البيع</label>
              <input type="number" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '0.8rem', borderRadius: '12px', color: '#fff' }} 
                placeholder="0.00" value={form.sellingPrice} onChange={e => setForm({...form, sellingPrice: e.target.value})} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem', display: 'block' }}>سعر التكلفة</label>
              <input type="number" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '0.8rem', borderRadius: '12px', color: '#fff' }} 
                placeholder="0.00" value={form.costPrice} onChange={e => setForm({...form, costPrice: e.target.value})} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem', display: 'block' }}>شحن/تغليف</label>
              <input type="number" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '0.8rem', borderRadius: '12px', color: '#fff' }} 
                placeholder="0.00" value={form.shippingCost} onChange={e => setForm({...form, shippingCost: e.target.value})} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem', display: 'block' }}>كمية القطع</label>
              <input type="number" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '0.8rem', borderRadius: '12px', color: '#fff' }} 
                placeholder="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div style={{ background: '#D4AF37', color: '#000', padding: '2rem', borderRadius: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', left: '-10px', opacity: 0.1 }}><Percent size={100} /></div>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>صافي الربح المتوقع</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>{formatPrice(totalProfit)}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
            <span style={{ background: '#000', color: '#D4AF37', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 900 }}>
              هامش الربح: {margin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Advice Note */}
        {price > 0 && (
          <div style={{ background: '#111', padding: '1rem', borderRadius: '1.5rem', border: `1px solid ${profitColor}40`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            {profit >= 0 ? <TrendingUp color="#2ecc71" /> : <TrendingDown color="#e74c3c" />}
            <p style={{ fontSize: '0.85rem', color: '#fff', margin: 0 }}>
              {margin >= 30 ? 'هذا المنتج "منجم ذهب"، توكل على الله.' : margin >= 15 ? 'ربح معقول، حاول ضغط تكاليف الشحن.' : 'احذر، هامش الربح ضعيف جداً!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

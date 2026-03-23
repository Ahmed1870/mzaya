'use client'
import React, { useState } from 'react'
import { Wallet, ArrowUpRight, ShieldCheck, History, CreditCard, ChevronLeft } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function WalletCard({ balance, transactions = [] }: { balance: number, transactions: any[] }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* كارت الرصيد الرئيسي */}
      <div style={{ 
        background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)', 
        padding: '24px', 
        borderRadius: '24px', 
        marginBottom: '25px',
        boxShadow: '0 10px 20px rgba(67, 97, 238, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
          <Wallet size={120} color="white" />
        </div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginBottom: '8px' }}>
            <ShieldCheck size={16} /> رصيدك المتوفر في مزايا
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', marginBottom: '20px' }}>
            {formatPrice(balance)}
          </div>
          
          <button 
            onClick={() => setShowModal(true)} 
            style={{ 
              background: 'white', 
              color: '#4361ee', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '14px', 
              fontWeight: 800, 
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
            <CreditCard size={18} /> سحب الأرباح
          </button>
        </div>
      </div>

      {/* سجل العمليات المترابط */}
      <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '20px', border: '1px solid #1a1a1a' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontSize: '1rem' }}>
          <History size={18} color="#4361ee"/> أحدث مبيعاتك
        </h4>
        
        {transactions.length === 0 ? (
          <p style={{ color: '#444', textAlign: 'center', padding: '20px' }}>لا توجد عمليات مسجلة حالياً</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {transactions.slice(0, 3).map((t, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px', 
                background: '#111',
                borderRadius: '12px',
                border: '1px solid #1a1a1a'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.customer_name || 'عميل نقدي'}</div>
                  <div style={{ fontSize: '0.7rem', color: '#555' }}>{new Date(t.created_at).toLocaleDateString('ar-EG')}</div>
                </div>
                <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
                  +{formatPrice(t.total_amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal تأكيد السحب */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }}>
          <div className="animate-fade-up" style={{ background: '#0a0a0a', padding: '30px', borderRadius: '24px', border: '1px solid #1a1a1a', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(67, 97, 238, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Wallet size={30} color="#4361ee" />
            </div>
            <h3 style={{ marginBottom: '10px' }}>طلب سحب الأرباح</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '25px' }}>
              سيتم تحويل مبلغ <span style={{ color: 'white', fontWeight: 700 }}>{formatPrice(balance)}</span> إلى وسيلة الدفع المسجلة.
            </p>
            <div style={{ display: 'grid', gap: '10px' }}>
              <button 
                className="btn-primary" 
                style={{ width: '100%', height: '50px' }}
                onClick={() => setShowModal(false)}
              >
                تأكيد عملية السحب
              </button>
              <button 
                style={{ background: 'transparent', border: 'none', color: '#666', padding: '10px', cursor: 'pointer' }}
                onClick={() => setShowModal(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

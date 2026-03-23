'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Send, Upload, MessageCircle, Mail, Phone, CheckCircle, Clock, X, Headphones, Sparkles, ChevronDown } from 'lucide-react'

const SUPPORT_EMAIL = 'ahmedgomaelsayed@gmail.com'
const SUPPORT_PHONE = '201019672878' 

const FAQS = [
  { q: 'إزاي أضيف منتج جديد؟', icon: '📦' },
  { q: 'إزاي أربط متجري بالواتساب؟', icon: '📱' },
  { q: 'إزاي أضيف مندوب جديد؟', icon: '🛵' },
  { q: 'إزاي أشوف تقارير الأرباح؟', icon: '📊' },
  { q: 'إزاي أعمل فاتورة وأبعتها للزبون؟', icon: '🧾' },
  { q: 'إزاي أستخدم مولد الإعلانات؟', icon: '🎯' },
]

export default function SupportPage() {
  const supabase = createClient()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [faqAnswers, setFaqAnswers] = useState<Record<number, string>>({})
  const [faqLoading, setFaqLoading] = useState<number | null>(null)

  const askAI = async (question: string) => {
    const prompt = `أنت مساعد دعم فني لمنصة مزايا MAZAYA لإدارة التجارة. أجب على السؤال التالي بالعربي المصري في خطوات بسيطة: ${question}`;

    // المحاولة الأولى: Groq (الخيار الأسرع)
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3-8b-8192",
          messages: [{ role: "user", content: prompt }]
        })
      });
      if (!groqRes.ok) throw new Error('Groq failed');
      const data = await groqRes.json();
      return data.choices[0].message.content;
    } catch (err) {
      console.log("Switching to Gemini...");
      // المحاولة الثانية: Gemini (البديل الاستراتيجي)
      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        const data = await geminiRes.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (geminiErr) {
        throw new Error('Both AI services failed');
      }
    }
  };

  const handleFaqClick = async (index: number, question: string) => {
    if (activeFaq === index) { setActiveFaq(null); return }
    setActiveFaq(index)
    if (faqAnswers[index]) return

    setFaqLoading(index)
    try {
      const answer = await askAI(question);
      setFaqAnswers(prev => ({ ...prev, [index]: answer || 'جاري التحضير...' }))
    } catch {
      setFaqAnswers(prev => ({ ...prev, [index]: 'عذراً، أنظمة الذكاء الاصطناعي مشغولة حالياً. حاول كمان شوية.' }))
    }
    setFaqLoading(null)
  }

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${SUPPORT_PHONE}`, '_blank')
  }

  return (
    <div className="animate-fade-up" style={{ color: 'white', display: 'grid', gap: '2rem', paddingBottom: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D4AF37' }}>🎧 مركز الدعم</h1>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>نظام دعم ذكي هجين (Groq + Gemini)</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* WhatsApp Card */}
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #222', textAlign: 'center' }}>
          <MessageCircle size={40} color="#25d366" style={{marginBottom:'1rem'}}/>
          <h3 style={{marginBottom:'.5rem'}}>دعم فني مباشر</h3>
          <p style={{fontSize:'.8rem', color:'#666', marginBottom:'1.5rem'}}>كلمنا واتساب وهنرد عليك فوراً</p>
          <button onClick={handleWhatsApp} style={{ width:'100%', background: '#25d366', color: '#000', border: 'none', padding: '0.8rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
            فتح المحادثة
          </button>
        </div>

        {/* AI FAQ Card */}
        <div style={{ background: '#080808', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #D4AF3720' }}>
          <h3 style={{ marginBottom: '1.2rem', fontSize: '1rem', color: '#D4AF37' }}><Sparkles size={18} style={{marginLeft:'8px', verticalAlign:'middle'}}/> الأسئلة الذكية</h3>
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: '#111', borderRadius: '1rem', border: '1px solid #222' }}>
                <button onClick={() => handleFaqClick(i, faq.q)} style={{ width: '100%', padding: '1rem', background: 'none', border: 'none', color: '#fff', textAlign: 'right', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span>{faq.icon} {faq.q}</span>
                  <ChevronDown size={14} style={{ transform: activeFaq === i ? 'rotate(180deg)' : 'none', transition: '0.3s' }}/>
                </button>
                {activeFaq === i && (
                  <div style={{ padding: '1rem', background: '#050505', color: '#aaa', fontSize: '0.82rem', lineHeight: '1.7', borderTop: '1px solid #1a1a1a', whiteSpace: 'pre-wrap' }}>
                    {faqLoading === i ? <div className="animate-pulse">جاري الاستعانة بالذكاء الاصطناعي...</div> : faqAnswers[i]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

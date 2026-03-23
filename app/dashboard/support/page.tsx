'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { MessageCircle, Sparkles, ChevronDown, Loader2 } from 'lucide-react'

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

    // المحاولة الأولى: Groq (السرعة القصوى)
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
      const answer = data.choices[0].message.content;
      await saveToStorage(question, answer);
      return answer;

    } catch (err) {
      console.log("Switching to Gemini...");
      // المحاولة الثانية: Gemini (البديل الاستراتيجي)
      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await geminiRes.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "نعتذر، هناك ضغط على الخدمة.";
        await saveToStorage(question, answer);
        return answer;
      } catch (geminiErr) {
        return "الخدمة مشغولة حالياً، تواصل معنا واتساب.";
      }
    }
  };

  const saveToStorage = async (q: string, a: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('ai_support_chats').insert({
        user_id: user.id,
        question: q,
        answer: a
      });
    }
  };

  const handleFaqClick = async (index: number, question: string) => {
    if (activeFaq === index) { setActiveFaq(null); return }
    setActiveFaq(index)
    if (faqAnswers[index]) return
    setFaqLoading(index)
    const answer = await askAI(question);
    setFaqAnswers(prev => ({ ...prev, [index]: answer }))
    setFaqLoading(null)
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between bg-[#111] p-6 rounded-3xl border border-[#D4AF3720]">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#D4AF37]">🎧 مركز الدعم الذكي</h1>
          <p className="text-gray-500 text-sm mt-1 text-right">نظام هجين (Groq + Gemini)</p>
        </div>
        <Sparkles className="text-[#D4AF37] animate-pulse" size={32} />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] p-6 rounded-3xl border border-[#222] hover:border-[#25d36650] transition-all group text-right">
          <MessageCircle size={40} className="text-[#25d366] mb-4 group-hover:scale-110 transition-transform mr-auto" />
          <h3 className="text-xl font-bold mb-2 text-white">دعم بشري مباشر</h3>
          <p className="text-gray-500 text-sm mb-6 font-medium">كلمنا واتساب وهنرد عليك فوراً.</p>
          <button onClick={() => window.open(`https://wa.me/${SUPPORT_PHONE}`, '_blank')} className="w-full bg-[#25d366] text-black py-3 rounded-xl font-black hover:bg-[#20bd5b] transition-all active:scale-95">
            فتح الواتساب
          </button>
        </div>

        <div className="bg-[#080808] p-6 rounded-3xl border border-[#D4AF3720] text-right">
          <h3 className="text-white font-bold mb-4 flex items-center justify-end gap-2">
             الأسئلة الشائعة (AI) <Sparkles size={18} className="text-[#D4AF37]" />
          </h3>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden transition-all">
                <button onClick={() => handleFaqClick(i, faq.q)} className="w-full p-4 flex justify-between items-center text-right text-white hover:bg-[#161616] transition-colors">
                  <ChevronDown size={16} className={`transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} />
                  <span className="text-sm font-medium">{faq.q} {faq.icon}</span>
                </button>
                {activeFaq === i && (
                  <div className="p-4 bg-black/50 text-gray-400 text-xs leading-relaxed border-t border-[#1a1a1a] animate-in slide-in-from-top-2 text-right">
                    {faqLoading === i ? <div className="flex items-center justify-end gap-2 text-[#D4AF37]"><Loader2 size={14} className="animate-spin" /> جاري التحليل...</div> : <div className="whitespace-pre-wrap">{faqAnswers[i]}</div>}
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

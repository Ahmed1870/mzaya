import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // جلب بيانات التاجر من بروفايله في مزايا لتعزيز التناغم
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single()

    const shopName = profile?.full_name || 'تاجر مزايا'
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json({ reply: 'عذراً، مساعد مزايا غير متصل حالياً.' })
    }

    const SYSTEM_PROMPT = `
    أنت "مساعد مزايا الذكي" (Mazaya AI). مهمتك مساعدة التاجر المصري في إدارة مشروعه.
    أنت الآن تتحدث مع صاحب متجر: "${shopName}".
    
    عن منصة مزايا:
    - نظام متكامل (مخازن، فواتير، محفظة، رادار عملاء).
    - باقات: الاحترافية (99 ج.م) والبيزنس (199 ج.م).
    - الدفع وسرعة التحصيل عبر فودافون كاش (01019672878).
    
    قواعد الرد:
    1. اتكلم بالعامية المصرية بلهجة سنيور تقني (جدع وفاهم).
    2. خليك مختصر ومفيد جداً.
    3. شجع التاجر يستخدم أدوات مزايا زي "توليد وصف المنتجات" و "متابعة النواقص".
    `

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m: any) => ({ 
            role: m.role === 'assistant' ? 'assistant' : 'user', 
            content: m.content 
          }))
        ],
        max_tokens: 500,
        temperature: 0.6,
      })
    })

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || 'معلش يا بطل، حاول تاني!'
    return NextResponse.json({ reply })

  } catch (err: any) {
    return NextResponse.json({ reply: `خطأ تقني: ${err.message}` })
  }
}

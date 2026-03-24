import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { productName, productDesc, platform, tone, targetAudience } = await req.json()
    
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]
    
    if (!token) return NextResponse.json({ error: 'Auth Token Missing' }, { status: 401 })

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Invalid Session' }, { status: 401 })

    // جلب البروفايل للتأكد من الباقة (البيزنس أو الاحترافية)
    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('plan_name, ads_generated')
      .eq('id', user.id)
      .single()

    if (profError) return NextResponse.json({ error: 'Profile Database Error' }, { status: 500 })

    // برومبت "خبير تسويق مصري" - ذكي، سريع، ومختصر عشان نتجنب الـ Timeout
    const prompt = `أنت خبير تسويق مصري داهية. اكتب إعلان بيّاع لمنتج: (${productName}).
وصفه: ${productDesc}. المنصة: ${platform}. الروح: ${tone}. الجمهور: ${targetAudience}.
ابدأ بـ Hook (خبطة) تجذب الانتباه، استخدم لغة الشارع المصرية "الشيك" اللي بتبيع، ركز على الفوايد، وانهي بـ CTA قوي.
رد بالنص الإعلاني فقط وبسرعة قوية.`;

    let adResult = ""
    
    // 1. محاولة Gemini 1.5 Flash (الأسرع في الاستجابة والأذكى حالياً)
    try {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.85, maxOutputTokens: 600 }
        })
      })
      const gData = await geminiRes.json()
      adResult = gData.candidates?.[0]?.content?.parts?.[0]?.text || ""
    } catch (e) {
      console.log("Gemini Flash failed, switching to Llama 70B...")
    }

    // 2. Backup Groq (Llama 3.1 70B) - لو Gemini اتأخر أو فشل
    if (!adResult) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.1-70b-versatile",
            messages: [
              { role: "system", content: "أنت كاتب إعلانات مصري محترف ومبدع." },
              { role: "user", content: prompt }
            ],
            temperature: 0.8
          })
        })
        if (groqRes.ok) {
          const data = await groqRes.json()
          adResult = data.choices[0].message.content
        }
      } catch (e) {}
    }

    if (!adResult) return NextResponse.json({ error: 'AI Models Unreachable' }, { status: 503 })

    // تحديث العداد بعد نجاح التوليد
    await supabase.from('profiles').update({ 
      ads_generated: (profile.ads_generated || 0) + 1 
    }).eq('id', user.id)

    return NextResponse.json({ result: adResult })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json()
    if (!imageBase64) return NextResponse.json({ error: 'لم يتم استلام صورة' }, { status: 400 })

    const prompt = `أنت خبير تسويق مصري. حلل صورة المنتج واستخرج: اسم المنتج، وصف تسويقي بيّاع بلهجة مصرية، الفئة، سعر مقترح بالجنيه المصري كرقُم فقط. الرد يكون JSON فقط: {"name":"","description":"","category":"","suggested_price":0}`;

    // --- المحاولة الأولى: Groq (Llama 3.2 Vision إذا توفر أو الاستعانة بـ Gemini) ---
    // ملحوظة: Groq حالياً يتفوق في السرعة، لذا سنبدأ بـ Gemini للرؤية (Vision) ونستخدم Groq للوصف النصي لو لزم الأمر
    // لكن الأفضل هنا هو Gemini 2.0 Flash لأنه يدعم Vision و JSON Mode ببراعة
    
    try {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } },
              { text: prompt }
            ]
          }],
          generationConfig: { response_mime_type: "application/json" }
        })
      })

      if (geminiRes.ok) {
        const data = await geminiRes.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
        return NextResponse.json(JSON.parse(text))
      }
    } catch (e) {
      console.log("Gemini failed, trying Groq fallback for text processing...")
    }

    // --- الخطة البديلة (Fallback): Groq (للتحليل النصي فقط لو الصورة فشلت) ---
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: "اكتب وصف لمنتج تجاري مصري من الاسم فقط لو تعذر تحليل الصورة." }],
        response_format: { type: "json_object" }
      })
    })

    const groqData = await groqRes.json()
    return NextResponse.json(JSON.parse(groqData.choices[0].message.content))

  } catch (err: any) {
    console.error('AI Route Error:', err)
    return NextResponse.json({ error: 'فشل التحليل الهجين' }, { status: 500 })
  }
}

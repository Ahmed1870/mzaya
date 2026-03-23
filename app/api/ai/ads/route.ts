import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { productName, productDesc, platform, tone, targetAudience } = await req.json()
    
    const prompt = `أنت خبير إعلانات مصري محترف. اكتب إعلان واحد "بيّاع" جداً لمنتج: ${productName}.
    وصف المنتج: ${productDesc}.
    المنصة: ${platform}.
    الأسلوب: ${tone}.
    الجمهور المستهدف: ${targetAudience}.
    استخدم إيموجي، لهجة مصرية جذابة، نداء لاتخاذ إجراء (CTA) قوي. رد بالنص المباشر فقط.`;

    // المحاولة الأولى: Groq
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }]
        })
      });
      if (groqRes.ok) {
        const data = await groqRes.json();
        return NextResponse.json({ result: data.choices[0].message.content });
      }
    } catch (e) { console.log("Groq Error, switching..."); }

    // المحاولة الثانية: Gemini
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const gData = await geminiRes.json();
    const result = gData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return NextResponse.json({ result });

  } catch (err) {
    return NextResponse.json({ error: 'حدث خطأ في النظام' }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const data = await req.json();
    
    // قراءة البيانات بمرونة
    const product = data.productName || data.product || data.name || "منتج";
    const tone = data.tone || data.style || "احترافي";
    const platform = data.platform || data.target || "فيسبوك";

    const prompt = `اكتب إعلان احترافي، خفيف وفكاهي (ميجريش العميل) لـ: ${product}، باللهجة المصرية التسويقية الجذابة. للمنصة: ${platform}. ضيف رموز تعبيرية.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
    });

    const adContent = completion.choices[0].message.content;

    // الرد بكل الأشكال عشان الفرونت يختار اللي يعجبه
    return NextResponse.json({ 
      result: adContent,       // الصيغة 1
      content: adContent,      // الصيغة 2
      ad: adContent,           // الصيغة 3
      choices: [{ message: { content: adContent } }], // صيغة OpenAI
      status: "success"
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "تعذر الاتصال بالذكاء الاصطناعي" }, { status: 500 });
  }
}

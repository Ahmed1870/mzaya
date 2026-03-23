import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// تأكد إنك ضايف GROQ_API_KEY في Vercel
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const data = await req.json();
    
    const product = data.productName || data.product || data.name || "منتج جديد";
    const tone = data.tone || "احترافي";
    const platform = data.platform || "فيسبوك";

    const prompt = `اكتب إعلان احترافي باللهجة المصرية لـ: ${product}، بأسلوب: ${tone}، لمنصة: ${platform}. ضيف Emojis وقسم الإعلان لفقرات جذابة.`;

    // استخدام موديل Llama 3 من جروك مباشرة
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192", // النسخة الأقوى من لاما
      temperature: 0.7,
    });

    const adContent = completion.choices[0].message.content;

    return NextResponse.json({ 
      result: adContent, 
      content: adContent, 
      status: "success" 
    });

  } catch (error) {
    console.error("Groq Error:", error);
    return NextResponse.json({ 
      error: "فشل التوليد عبر جروك", 
      details: error.message 
    }, { status: 500 });
  }
}

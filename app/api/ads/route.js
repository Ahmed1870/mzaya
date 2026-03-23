import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { userId, productName, tone, platform, targetAudience } = await req.json();

    if (!userId) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('plan_name, ads_generated, shop_name').eq('id', userId).single();
    
    const ADS_LIMIT = profile?.plan_name === 'مجانية' ? 3 : profile?.plan_name === 'احترافية' ? 20 : 999;
    if (profile && profile.ads_generated >= ADS_LIMIT) {
      return NextResponse.json({ error: "استهلكت محاولاتك", code: "LIMIT_REACHED" }, { status: 403 });
    }

    // الـ Prompt الذكي الجديد: نظام "التحليل قبل الكتابة"
    const finalPrompt = `
      بصفتك خبير إعلانات Performance Marketing في السوق المصري:
      المنتج: ${productName}
      اسم البراند: ${profile?.shop_name || "متجرنا"}
      الجمهور المستهدف: ${targetAudience || "عام"}
      المنصة: ${platform}
      الأسلوب: ${tone}

      المطلوب منك كتابة إعلان "بيّاع" يلتزم بالآتي:
      1. تحليل سريع للمنتج: استخرج ميزتين أساسيتين يهموا المشتري المصري.
      2. Hook (خطفة): جملة أولى قوية تلمس وجع أو احتياج عند الزبون.
      3. Body: شرح بسيط ومغري بلهجة مصرية (مكس بين الشعبي الشيك واللغة البيضاء).
      4. استغلال الـ Scarcity: (مثال: الشحن مجاني النهاردة بس، الكمية قربت تخلص).
      5. CTA: دعوة صريحة للفعل (اطلب دلوقتي من خلال الرسائل أو الموقع).

      * ممنوع تماماً استخدام لغة عربية فصحى خشبية.
      * استخدم كلمات مصرية دارجة محببة (يا وحش، شياكة، لقطة، فرصة).
      * ضيف Emojis بطريقة احترافية مش عشوائية.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "أنت مسوق مصري عبقري، كلامك بيحول المشاهد لمشتري فوراً." },
        { role: "user", content: finalPrompt }
      ],
      model: "llama3-8b-8192",
      temperature: 0.65, // تقليل الحرارة لضمان الدقة وعدم الهلوسة
    });

    const adContent = completion.choices[0].message.content;

    await supabase.from('profiles').update({ ads_generated: (profile?.ads_generated || 0) + 1 }).eq('id', userId);

    return NextResponse.json({ result: adContent, status: "success" });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

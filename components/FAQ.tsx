'use client';
import { useState } from 'react';

export default function FAQ() {
  const faqs = [
    { q: "إزاي أبدأ مع مزايا؟", a: "ببساطة سجل دخول وابدأ في توليد إعلاناتك وإدارة عملائك فوراً." },
    { q: "هل الخدمة مجانية؟", a: "نعم، بنوفر باقة مجانية وباقات احترافية للمسوقين والشركات." }
  ];
  const [open, setOpen] = useState(null);
  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-[#111] rounded-xl border border-yellow-500/20">
      <h2 className="text-2xl font-bold mb-6 text-center text-yellow-500">الأسئلة الشائعة</h2>
      {faqs.map((item, i) => (
        <div key={i} className="border-b border-gray-800 py-4 cursor-pointer" onClick={() => setOpen(open === i ? null : i)}>
          <div className="flex justify-between items-center text-white font-medium">
            <span>{item.q}</span>
            <span className="text-yellow-500">{open === i ? '-' : '+'}</span>
          </div>
          {open === i && <p className="mt-3 text-gray-400 leading-relaxed text-sm">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}

'use client'
import { useState } from 'react'

const faqs = [
  { q: "ما هي منصة مزايا؟", a: "منصة متكاملة لإدارة المحلات والشركات التجارية بسهولة وفخامة." },
  { q: "هل يدعم النظام ضريبة القيمة المضافة؟", a: "نعم، النظام يدعم الضرائب والتقارير المالية بشكل كامل." },
  { q: "هل يمكنني العمل من الموبايل؟", a: "بالتأكيد، النظام مصمم ليعمل بكفاءة عالية على كافة الأجهزة." }
]

export default function FAQ() {
  const [open, setOpen] = useState<any>(null)

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-yellow-500">الأسئلة الشائعة</h2>
      {faqs.map((item, i) => (
        <div key={i} className="border-b border-gray-800 py-4 cursor-pointer" onClick={() => setOpen(open === i ? null : i)}>
          <div className="flex justify-between items-center text-white font-medium">
            <span>{item.q}</span>
            <span className="text-yellow-500">{open === i ? '-' : '+'}</span>
          </div>
          {open === i && (
            <p className="text-gray-400 mt-2 text-sm leading-relaxed animate-in fade-in duration-300">
              {item.a}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

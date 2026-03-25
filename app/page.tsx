'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { 
  Rocket, ShieldCheck, Zap, BarChart3, CheckCircle2, 
  ArrowLeft, Star, Mail, MessageCircle 
} from 'lucide-react'

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-[#D4AF37] selection:text-black font-['IBM_Plex_Sans_Arabic'] overflow-x-hidden" dir="rtl">
      
      {/* خلفية النجوم المتحركة */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <div className="stars-container"></div>
      </div>

      {/* Navbar الفاخر */}
      <nav className="fixed top-0 w-full z-[100] bg-black/20 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 cursor-pointer">
             <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#8A6D3B] rounded-xl rotate-12 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                <span className="text-black -rotate-12 font-black text-2xl">M</span>
             </div>
             <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent uppercase">Mazaya</span>
          </motion.div>
          
          <div className="flex gap-6 items-center">
            <Link href="/auth/login" className="text-sm font-bold text-gray-400 hover:text-[#D4AF37] transition-all relative group">
              دخول
              <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-[#D4AF37] group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/auth/register" className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold text-black transition-all bg-[#D4AF37] rounded-full group">
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
              <span className="relative">ابدأ الآن</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-56 pb-32 px-6 flex flex-col items-center">
        <motion.div style={{ opacity, scale }} className="text-center z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] text-xs font-black mb-12"
          >
            <Star size={14} fill="#D4AF37" /> نظام إدارة النخبة
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1 }}
            className="text-7xl md:text-[120px] font-black leading-none mb-12 tracking-tighter"
          >
            عصر جديد <br />
            <span className="text-outline-gold hover:text-[#D4AF37] transition-all duration-700 cursor-default">من القوة</span>
          </motion.h1>

          <motion.p className="text-gray-400 text-xl md:text-3xl max-w-4xl mx-auto mb-16 font-light leading-relaxed">
            بنينا "مزايا" لنمنحك السيطرة الكاملة على إمبراطوريتك التجارية. <br/> فخامة التصميم تلتقي بذكاء الأرقام.
          </motion.p>

          <Link href="/auth/register" className="px-16 py-7 bg-white text-black rounded-3xl font-black text-2xl hover:bg-[#D4AF37] transition-all hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] inline-flex items-center gap-4">
               انطلق الآن <Rocket size={24} />
          </Link>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-6">
        <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
           <div className="relative p-1 bg-[#080808] rounded-[4rem] border border-white/5 p-16">
                <h3 className="text-2xl font-bold text-gray-500 mb-6 uppercase tracking-[5px]">Professional</h3>
                <div className="text-7xl font-black mb-12">99 <span className="text-xl font-light opacity-40">EGP</span></div>
                <ul className="space-y-6 mb-16">
                  {['مخازن ذكية', 'تقارير يومية', 'دعم واتساب'].map(i => (
                    <li key={i} className="flex items-center gap-4 text-xl opacity-70"><CheckCircle2 className="text-[#D4AF37]" /> {i}</li>
                  ))}
                </ul>
                <button className="w-full py-6 rounded-3xl border border-white/10 font-black text-xl hover:bg-white hover:text-black transition-all">اشتراك</button>
           </div>

           <div className="relative p-16 bg-[#D4AF37] text-black rounded-[4rem] shadow-[0_40px_100px_rgba(212,175,55,0.15)] flex flex-col">
                <div className="flex justify-between items-start mb-6">
                   <h3 className="text-2xl font-black uppercase tracking-[5px]">Business</h3>
                </div>
                <div className="text-7xl font-black mb-12">199 <span className="text-xl font-black opacity-60">EGP</span></div>
                <ul className="space-y-6 mb-16 flex-grow">
                  {['ذكاء اصطناعي', 'تعدد الفروع', 'دعم VIP 24/7'].map(i => (
                    <li key={i} className="flex items-center gap-4 text-xl font-black"><CheckCircle2 /> {i}</li>
                  ))}
                </ul>
                <button className="w-full py-6 rounded-3xl bg-black text-[#D4AF37] font-black text-xl hover:scale-95 transition-all">ابدأ الآن</button>
           </div>
        </div>
      </section>

      {/* Footer مع الأيقونات اللي كانت ناقصة */}
      <footer className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="text-right">
              <h4 className="text-2xl font-black mb-4">تواصل مع المبتكر</h4>
              <p className="text-gray-500 max-w-xs">أحمد - مطور منصة مزايا لإدارة الأعمال الذكية.</p>
           </div>
           <div className="flex gap-8">
              <a href="mailto:xcm3108@gmail.com" className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center hover:bg-[#D4AF37] transition-all transition-colors"><Mail size={32} /></a>
              <a href="https://wa.me/201019672878" className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center hover:bg-[#25D366] transition-all transition-colors"><MessageCircle size={32} /></a>
           </div>
        </div>
      </footer>

      <style jsx global>{`
        .text-outline-gold { color: transparent; -webkit-text-stroke: 1px #D4AF37; }
        .stars-container {
          background-image: radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0));
          background-repeat: repeat; background-size: 200px 200px;
          animation: stars-move 100s linear infinite; width: 100%; height: 100%;
        }
        @keyframes stars-move { from { background-position: 0 0; } to { background-position: 1000px 1000px; } }
      `}</style>
    </div>
  )
}

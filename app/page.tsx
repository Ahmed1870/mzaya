'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Rocket, ShieldCheck, Zap, BarChart3, CheckCircle2, 
  Mail, MessageCircle, ArrowLeft, Smartphone, Globe, LayoutDashboard
} from 'lucide-react'

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-[#D4AF37] selection:text-black font-['IBM_Plex_Sans_Arabic'] overflow-x-hidden" dir="rtl">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-[100] bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-[#D4AF37] rounded-lg rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <div className="text-black -rotate-45 font-black text-xl">M</div>
            </div>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-l from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent uppercase">Mazaya</span>
          </motion.div>
          
          <div className="flex gap-4 items-center">
            <Link href="/auth/login" className="text-sm font-bold text-gray-400 hover:text-[#D4AF37] transition-all">دخول</Link>
            <Link href="/auth/register" className="bg-[#D4AF37] text-black px-7 py-2.5 rounded-full text-sm font-black hover:bg-[#FFD700] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]">ابدأ مجاناً</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[120px] rounded-full animate-pulse" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-white/10 to-transparent border border-white/10 px-5 py-2 rounded-full text-[#D4AF37] text-xs font-black mb-10 shadow-xl"
          >
            <Zap size={14} className="animate-pulse" /> مستقبل التجارة الذكية في مصر
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-6xl md:text-[90px] font-black leading-[0.9] mb-10 tracking-tighter"
          >
            إدارة أعمالك <br />
            <span className="bg-gradient-to-b from-[#FFD700] via-[#D4AF37] to-[#8A6D3B] bg-clip-text text-transparent italic">بفخامة استثنائية</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-xl md:text-3xl max-w-4xl mx-auto mb-14 leading-relaxed font-light"
          >
            "مزايا" هو النظام الوحيد الذي يدمج القوة بالبساطة. <br className="hidden md:block"/> تابع أرباحك ومخزونك لحظة بلحظة من جيبك.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <Link href="/auth/register" className="group bg-[#D4AF37] text-black px-14 py-6 rounded-[2rem] font-black text-2xl flex items-center gap-4 hover:shadow-[0_20px_40px_rgba(212,175,55,0.3)] transition-all transform hover:-translate-y-2">
              سجل مجاناً الآن <ArrowLeft className="group-hover:-translate-x-3 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing - تحديث الأسعار */}
      <section className="py-32 px-6 relative bg-white/[0.01]">
        <div className="max-w-5xl mx-auto text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">باقات تناسب نموك</h2>
          <div className="h-1.5 w-32 bg-[#D4AF37] mx-auto rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Pro - 99 EGP */}
          <motion.div 
            whileHover={{ y: -15 }}
            className="p-14 rounded-[4rem] border border-white/10 bg-black flex flex-col hover:border-[#D4AF37]/50 transition-all"
          >
            <div className="mb-10">
              <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">الباقة الاحترافية</span>
              <div className="text-6xl font-black mt-4">99 <span className="text-xl opacity-30 italic font-light">ج.م / شهر</span></div>
            </div>
            <ul className="space-y-6 mb-16 flex-grow">
              {['إدارة 500 منتج', 'تقارير مبيعات ذكية', 'دعم فني واتساب', 'مستخدم واحد'].map(t => (
                <li key={t} className="flex items-center gap-4 text-xl font-medium text-gray-300"><CheckCircle2 size={24} className="text-[#D4AF37]" /> {t}</li>
              ))}
            </ul>
            <button className="w-full py-6 rounded-3xl border border-white/10 font-black text-xl hover:bg-white hover:text-black transition-all">ابدأ الآن</button>
          </motion.div>

          {/* Business - 199 EGP */}
          <motion.div 
            initial={{ scale: 0.95 }}
            whileInView={{ scale: 1.05 }}
            className="p-14 rounded-[4rem] bg-[#D4AF37] text-black relative shadow-[0_40px_80px_rgba(212,175,55,0.2)]"
          >
            <div className="absolute top-8 left-8 bg-black text-[#D4AF37] px-6 py-1.5 rounded-full text-[12px] font-black tracking-widest uppercase">الأكثر طلباً</div>
            <div className="mb-10">
              <span className="opacity-70 font-bold uppercase tracking-widest text-xs">باقة البيزنس</span>
              <div className="text-6xl font-black mt-4">199 <span className="text-xl opacity-60 italic font-light">ج.م / شهر</span></div>
            </div>
            <ul className="space-y-6 mb-16 flex-grow">
              {['منتجات غير محدودة', 'تحليل بالذكاء الاصطناعي', 'تعدد فروع ومخازن', 'دعم VIP 24/7'].map(t => (
                <li key={t} className="flex items-center gap-4 text-xl font-black"><CheckCircle2 size={24} /> {t}</li>
              ))}
            </ul>
            <button className="w-full py-6 rounded-3xl bg-black text-[#D4AF37] font-black text-xl hover:scale-95 transition-all shadow-2xl">امتلك القوة</button>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto bg-[#080808] border border-white/5 p-16 md:p-24 rounded-[5rem] text-center relative overflow-hidden group">
          <h2 className="text-4xl md:text-5xl font-black mb-6">تواصل مع المطور</h2>
          <p className="text-gray-400 text-xl mb-16 leading-relaxed">أنا أحمد، وموجود دايماً عشان أطور لك السيستم بما يناسب احتياجاتك.</p>
          
          <div className="flex flex-col md:flex-row justify-center gap-10">
            <a href="mailto:xcm3108@gmail.com" className="group flex items-center gap-6 bg-white/5 p-6 rounded-3xl hover:bg-[#D4AF37] hover:text-black transition-all">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-[#D4AF37]">
                <Mail size={28} />
              </div>
              <div className="text-right">
                <div className="text-xs opacity-50 font-bold">البريد الإلكتروني</div>
                <div className="font-black text-lg">xcm3108@gmail.com</div>
              </div>
            </a>

            <a href="https://wa.me/201019672878" target="_blank" className="group flex items-center gap-6 bg-white/5 p-6 rounded-3xl hover:bg-[#25D366] hover:text-white transition-all">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-[#25D366]">
                <MessageCircle size={28} />
              </div>
              <div className="text-right">
                <div className="text-xs opacity-50 font-bold">واتساب مباشر</div>
                <div className="font-black text-lg">01019672878</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <footer className="py-20 text-center opacity-30">
        <div className="text-xl font-black mb-4 tracking-[10px]">MAZAYA</div>
        <p className="text-[10px] font-bold tracking-[2px]">CRAFTED WITH PASSION BY AHMED © 2026</p>
      </footer>
    </div>
  )
}

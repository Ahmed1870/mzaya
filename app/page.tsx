'use client'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Shield, Rocket, Mail, MessageSquare } from 'lucide-react'

export default function LandingPage() {
  return (
    <div style={{background:'#020202',minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic',sans-serif",color:'#fff',overflowX:'hidden'}}>
      {/* Navbar الاحترافي */}
      <nav style={{position:'fixed',top:0,width:'100%',zIndex:100,padding:'1.5rem 2.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(2,2,2,0.8)',backdropFilter:'blur(15px)',borderBottom:'1px solid rgba(212,175,55,0.05)'}}>
        <div style={{fontSize:'1.8rem',fontWeight:950,color:'#D4AF37',letterSpacing:'-1px'}}>MAZAYA</div>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <Link href="/auth/login" style={{color:'#999',textDecoration:'none',fontSize:'.9rem',fontWeight:600, marginTop:'10px'}}>دخول</Link>
          <Link href="/auth/register" style={{background:'#D4AF37',color:'#000',padding:'.7rem 1.8rem',borderRadius:'.9rem',textDecoration:'none',fontWeight:900,fontSize:'.9rem',boxShadow:'0 8px 20px rgba(212,175,55,0.2)'}}>ابدأ مجاناً</Link>
        </div>
      </nav>

      {/* Hero Section - الـ Animation الأساسي */}
      <section style={{padding:'12rem 2rem 6rem',textAlign:'center',position:'relative'}}>
        <div className="gold-glow" style={{position:'absolute',top:'10%',left:'50%',transform:'translateX(-50%)',width:'400px',height:'400px',background:'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',filter:'blur(50px)'}}/>
        
        <div style={{position:'relative',zIndex:2}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(212,175,55,0.05)',border:'1px solid rgba(212,175,55,0.2)',padding:'.5rem 1.2rem',borderRadius:'99px',color:'#D4AF37',fontSize:'.8rem',fontWeight:700,marginBottom:'2rem'}}>
            <Sparkles size={14} /> أذكى نظام لإدارة التجارة في مصر
          </div>
          
          <h1 style={{fontSize:'clamp(2.5rem, 8vw, 5rem)',fontWeight:950,lineHeight:1,marginBottom:'1.5rem',letterSpacing:'-2px'}}>
            تجارتك تستحق <br/> <span style={{color:'#D4AF37',textShadow:'0 0 30px rgba(212,175,55,0.3)'}}>مزايا</span> استثنائية
          </h1>
          
          <p style={{fontSize:'1.2rem',color:'#888',maxWidth:'600px',margin:'0 auto 3rem',lineHeight:1.8}}>
            ودّع الحسابات اليدوية. صوّر منتجاتك، تتبع أرباحك، وأدر مخزنك بالذكاء الاصطناعي في منصة واحدة فاخرة.
          </p>

          <div style={{display:'flex',gap:'1.5rem',justifyContent:'center',flexWrap:'wrap'}}>
             <Link href="/auth/register" style={{background:'linear-gradient(135deg,#D4AF37,#FFD700)',color:'#000',padding:'1.2rem 3rem',borderRadius:'1.2rem',textDecoration:'none',fontWeight:950,fontSize:'1.1rem',display:'flex',alignItems:'center',gap:'10px'}}>🚀 انضم الآن مجاناً</Link>
             <Link href="#features" style={{border:'1px solid #333',padding:'1.2rem 3rem',borderRadius:'1.2rem',textDecoration:'none',color:'#fff',fontWeight:700}}>استكشف المزايا</Link>
          </div>
        </div>
      </section>

      {/* Footer الجديد - مربوط ببياناتك */}
      <footer style={{padding:'5rem 2rem',background:'#050505',borderTop:'1px solid #111',textAlign:'center'}}>
        <h3 style={{color:'#D4AF37',fontWeight:900,fontSize:'1.5rem',marginBottom:'2rem'}}>تواصل مع الدعم الفني</h3>
        <div style={{display:'flex',justifyContent:'center',gap:'2.5rem',flexWrap:'wrap'}}>
          <a href="https://wa.me/201019672878" target="_blank" style={{display:'flex',alignItems:'center',gap:'10px',color:'#888',textDecoration:'none',fontWeight:600}}>
            <MessageSquare color="#25D366" /> 01019672878
          </a>
          <a href="mailto:xcm3108@gmail.com" style={{display:'flex',alignItems:'center',gap:'10px',color:'#888',textDecoration:'none',fontWeight:600}}>
            <Mail color="#D4AF37" /> xcm3108@gmail.com
          </a>
        </div>
        <div style={{marginTop:'4rem',color:'#333',fontSize:'.8rem'}}>© ٢٠٢٦ مزايا - نظام إدارة التجار المعتمد</div>
      </footer>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
        body { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}

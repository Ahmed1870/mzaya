// app/page.tsx
import Link from 'next/link'
import { ArrowLeft, BarChart2, Camera, Zap, Star, TrendingUp, FileText, Search } from 'lucide-react'

export default function LandingPage() {
  return (
    <div style={{background:'#0f172a',minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic',sans-serif"}}>
      {/* Nav */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:100,
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'1rem 2rem',
        background:'rgba(15,23,42,.9)',
        backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(255,255,255,.06)'
      }}>
        <div style={{fontWeight:800,fontSize:'1.4rem',background:'linear-gradient(135deg,#4361ee,#f8961e)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          Mzaya
        </div>
        <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
          <Link href="/auth/login" style={{color:'rgba(255,255,255,.6)',textDecoration:'none',fontSize:'.875rem'}}>دخول</Link>
          <Link href="/auth/register" style={{
            background:'#4361ee',color:'white',padding:'.6rem 1.4rem',
            borderRadius:'.75rem',textDecoration:'none',fontSize:'.875rem',fontWeight:600,
            boxShadow:'0 4px 16px rgba(67,97,238,.3)'
          }}>ابدأ مجاناً</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        minHeight:'100vh',display:'flex',alignItems:'center',
        padding:'8rem 2rem 4rem',position:'relative',overflow:'hidden'
      }}>
        <div style={{
          position:'absolute',inset:0,
          background:'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(67,97,238,.12) 0%,transparent 70%)',
          pointerEvents:'none'
        }}/>
        <div style={{
          position:'absolute',inset:0,
          backgroundImage:'linear-gradient(rgba(67,97,238,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(67,97,238,.04) 1px,transparent 1px)',
          backgroundSize:'50px 50px',
          maskImage:'radial-gradient(ellipse at center,black 20%,transparent 70%)',
          pointerEvents:'none'
        }}/>

        <div style={{maxWidth:'720px',margin:'0 auto',textAlign:'center',position:'relative',zIndex:2}}>
          <div style={{
            display:'inline-flex',alignItems:'center',gap:'.5rem',
            background:'rgba(67,97,238,.1)',border:'1px solid rgba(67,97,238,.2)',
            color:'#818cf8',padding:'.4rem 1rem',borderRadius:'99px',
            fontSize:'.8rem',fontWeight:600,marginBottom:'2rem'
          }}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#2dc653',boxShadow:'0 0 6px #2dc653',display:'inline-block'}}/>
            أداة التاجر الذكي رقم ١ في مصر
          </div>

          <h1 style={{
            fontSize:'clamp(2.5rem,6vw,4.5rem)',fontWeight:800,
            color:'white',lineHeight:1.1,letterSpacing:'-2px',marginBottom:'1.5rem'
          }}>
            كل <span style={{background:'linear-gradient(135deg,#4361ee,#f8961e)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>مزايا</span> تجارتك<br/>
            في مكان واحد
          </h1>

          <p style={{fontSize:'1.1rem',color:'rgba(255,255,255,.5)',lineHeight:1.8,marginBottom:'2.5rem',maxWidth:'520px',margin:'0 auto 2.5rem'}}>
            أضف منتجاتك بالكاميرا، اعرف أرباحك لحظة بلحظة، وخلّي الذكاء الاصطناعي يعمل إعلاناتك — كل ده مجاناً.
          </p>

          <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap',marginBottom:'4rem'}}>
            <Link href="/auth/register" style={{
              background:'linear-gradient(135deg,#4361ee,#3a0ca3)',color:'white',
              padding:'.9rem 2.5rem',borderRadius:'1rem',textDecoration:'none',
              fontSize:'1rem',fontWeight:700,
              boxShadow:'0 8px 24px rgba(67,97,238,.35)',
              display:'inline-flex',alignItems:'center',gap:'.5rem'
            }}>
              🚀 ابدأ مجاناً
            </Link>
            <Link href="/auth/login" style={{
              background:'rgba(255,255,255,.06)',color:'rgba(255,255,255,.8)',
              padding:'.9rem 2.5rem',borderRadius:'1rem',textDecoration:'none',
              fontSize:'1rem',fontWeight:600,border:'1px solid rgba(255,255,255,.1)'
            }}>
              تسجيل الدخول
            </Link>
          </div>

          {/* Stats */}
          <div style={{display:'flex',gap:'3rem',justifyContent:'center',flexWrap:'wrap'}}>
            {[{v:'+500',l:'تاجر نشط'},{v:'98%',l:'رضا المستخدمين'},{v:'3x',l:'نمو المبيعات'}].map((s,i)=>(
              <div key={i} style={{textAlign:'center'}}>
                <div style={{fontSize:'2rem',fontWeight:800,background:'linear-gradient(135deg,#4361ee,#f8961e)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{s.v}</div>
                <div style={{fontSize:'.8rem',color:'rgba(255,255,255,.35)',marginTop:'.2rem'}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{padding:'5rem 2rem',background:'#0a0f1e'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:800,color:'white',marginBottom:'3rem'}}>
            كل اللي التاجر محتاجه
          </h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.2rem'}}>
            {[
              {icon:'📷',t:'رفع بالكاميرا + AI',d:'صوّر منتجك والذكاء الاصطناعي يكتبلك الاسم والوصف والسعر'},
              {icon:'💰',t:'حاسبة الأرباح',d:'اعرف صافي ربحك بعد التكلفة والشحن لحظة بلحظة'},
              {icon:'🎯',t:'مولد إعلانات AI',d:'٥ أفكار إعلانات جاهزة لفيسبوك وتيك توك بضغطة واحدة'},
              {icon:'🔍',t:'رادار المنافسة',d:'شوف منافسيك بيبيعوا بكام وسعّر بذكاء'},
              {icon:'📊',t:'داشبورد كامل',d:'كل منتجاتك وأرباحك ومخزونك في مكان واحد'},
              {icon:'⚡',t:'فاتورة واتساب',d:'أنشئ فاتورة احترافية وشاركها على واتساب في ثانية'},
            ].map((f,i)=>(
              <div key={i} style={{
                background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',
                borderRadius:'1.2rem',padding:'1.5rem',transition:'all .3s'
              }}>
                <div style={{fontSize:'2rem',marginBottom:'.8rem'}}>{f.icon}</div>
                <div style={{fontWeight:700,color:'white',marginBottom:'.5rem'}}>{f.t}</div>
                <div style={{fontSize:'.875rem',color:'rgba(255,255,255,.4)',lineHeight:1.7}}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={{padding:'5rem 2rem',background:'#0f172a'}}>
        <div style={{maxWidth:'800px',margin:'0 auto',textAlign:'center'}}>
          <h2 style={{fontSize:'2rem',fontWeight:800,color:'white',marginBottom:'3rem'}}>ابدأ مجاناً</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'1.2rem',alignItems:'center'}}>
            {[
              {name:'مجاني',price:'٠',features:['٥ منتجات','داشبورد أساسي','حاسبة الأرباح'],featured:false},
              {name:'احترافي',price:'٩٩',features:['منتجات غير محدودة','AI كامل','مولد إعلانات','رادار المنافسة','فواتير PDF'],featured:true},
              {name:'بيزنس',price:'١٩٩',features:['كل مميزات الاحترافي','تحليلات متقدمة','أولوية دعم'],featured:false},
            ].map((p,i)=>(
              <div key={i} style={{
                background: p.featured ? 'linear-gradient(135deg,#1e1b4b,#312e81)' : 'rgba(255,255,255,.04)',
                border: p.featured ? '1px solid rgba(67,97,238,.4)' : '1px solid rgba(255,255,255,.06)',
                borderRadius:'1.5rem',padding:'2rem',
                transform: p.featured ? 'scale(1.05)' : 'scale(1)',
                boxShadow: p.featured ? '0 20px 60px rgba(67,97,238,.2)' : 'none',
                position:'relative'
              }}>
                {p.featured && <div style={{
                  position:'absolute',top:'-12px',right:'50%',transform:'translateX(50%)',
                  background:'linear-gradient(135deg,#f8961e,#f3722c)',color:'white',
                  padding:'.3rem 1rem',borderRadius:'99px',fontSize:'.75rem',fontWeight:700
                }}>🔥 الأشهر</div>}
                <div style={{color:'rgba(255,255,255,.5)',fontSize:'.875rem',marginBottom:'.8rem'}}>{p.name}</div>
                <div style={{fontSize:'2.5rem',fontWeight:800,color:'white',marginBottom:'1.5rem'}}>{p.price}<span style={{fontSize:'1rem',fontWeight:400,color:'rgba(255,255,255,.4)'}}> ج/شهر</span></div>
                <div style={{display:'grid',gap:'.7rem',marginBottom:'1.5rem'}}>
                  {p.features.map((f,j)=>(
                    <div key={j} style={{display:'flex',alignItems:'center',gap:'.6rem',fontSize:'.875rem',color:'rgba(255,255,255,.6)'}}>
                      <span style={{color:'#2dc653',fontWeight:700}}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <Link href="/auth/register" style={{
                  display:'block',textAlign:'center',padding:'.8rem',borderRadius:'.8rem',
                  textDecoration:'none',fontWeight:700,fontSize:'.9rem',
                  background: p.featured ? 'linear-gradient(135deg,#f8961e,#f3722c)' : 'rgba(255,255,255,.08)',
                  color:'white'
                }}>ابدأ دلوقتي</Link>
              </div>
            ))}
          </div>
          <p style={{marginTop:'2rem',color:'rgba(255,255,255,.3)',fontSize:'.85rem'}}>
            📞 واتساب: 01019672878 · ✉️ ahmegoma@gmail.com
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding:'2rem',background:'#0a0f1e',
        borderTop:'1px solid rgba(255,255,255,.06)',
        textAlign:'center',color:'rgba(255,255,255,.25)',fontSize:'.8rem'
      }}>
        © ٢٠٢٦ Mzaya · جميع الحقوق محفوظة
      </footer>
    </div>
  )
}

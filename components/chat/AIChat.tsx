'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string }

export default function AIChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'أهلاً يا بطل! 👋 أنا مساعد مزايا الذكي. محتاج مساعدة في المخزن، الفواتير، أو عايز تطور متجرك؟ أنا معاك! 🚀' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(1)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (open) { setUnread(0) } }, [open])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'يا سنيور حصل مشكلة في الاتصال، جرب تاني!' }])
    }
    setLoading(false)
  }

  const QUICK = ['إزاي أضيف منتج؟', 'مميزات باقة الـ 199؟', 'أعمل فاتورة إزاي؟', 'تعديل بيانات المتجر']

  return (
    <>
      <style>{`
        @keyframes bluePulse{0%,100%{box-shadow:0 4px 24px rgba(67,97,238,0.4)}50%{box-shadow:0 4px 32px rgba(67,97,238,0.6)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* فقاعة المساعد الذكي */}
      {!open && (
        <button onClick={() => setOpen(true)} style={{
          position:'fixed',bottom:'1.5rem',left:'1.5rem',zIndex:999,
          width:56,height:56,borderRadius:'50%',
          background:'linear-gradient(135deg,#4361ee,#3a0ca3)',
          border:'none',cursor:'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',
          animation:'bluePulse 2s ease-in-out infinite'
        }}>
          <MessageCircle size={26} color="white"/>
          {unread > 0 && <div style={{position:'absolute',top:-2,right:-2,width:20,height:20,borderRadius:'50%',background:'#ef4444',color:'white',fontSize:'.7rem',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #020202'}}>{unread}</div>}
        </button>
      )}

      {/* نافذة المحادثة */}
      {open && (
        <div style={{
          position:'fixed',bottom:'1.5rem',left:'1.5rem',zIndex:1000,
          width:'min(360px, calc(100vw - 2rem))',
          height:'min(550px, calc(100vh - 4rem))',
          background:'#0A0A0A',
          border:'1px solid #1a1a1a',
          borderRadius:'1.5rem',
          boxShadow:'0 24px 60px rgba(0,0,0,0.8)',
          display:'flex',flexDirection:'column',
          overflow:'hidden',
          animation:'slideUp .25s ease-out'
        }}>
          {/* Header الماركة */}
          <div style={{padding:'1rem',background:'#111',borderBottom:'1px solid #1a1a1a',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
              <div style={{width:38,height:38,borderRadius:'50%',background:'rgba(67,97,238,0.1)',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(67,97,238,0.2)'}}>
                <Bot size={20} color="#4361ee"/>
              </div>
              <div>
                <p style={{fontWeight:800,color:'white',margin:0,fontSize:'.9rem'}}>مساعد مزايا 🤖</p>
                <div style={{display:'flex',alignItems:'center',gap:'.3rem'}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#10b981'}}/>
                  <p style={{color:'#666',margin:0,fontSize:'.7rem'}}>نشط الآن</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{background:'transparent',border:'none',color:'#444',cursor:'pointer'}}><X size={20}/></button>
          </div>

          {/* الرسائل */}
          <div style={{flex:1,overflowY:'auto',padding:'1rem',display:'grid',gap:'.8rem',alignContent:'start'}}>
            {messages.map((msg, i) => (
              <div key={i} style={{display:'flex',gap:'.6rem',flexDirection:msg.role==='user'?'row-reverse':'row',alignItems:'flex-end'}}>
                <div style={{width:28,height:28,borderRadius:'50%',flexShrink:0,background:msg.role==='assistant'?'#4361ee':'#222',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {msg.role==='assistant'?<Sparkles size={14} color="white"/>:<User size={14} color="white"/>}
                </div>
                <div style={{
                  maxWidth:'80%',padding:'.7rem 1rem',
                  borderRadius:msg.role==='user'?'1.2rem 1.2rem 0 1.2rem':'1.2rem 1.2rem 1.2rem 0',
                  background:msg.role==='assistant'?'#111':'rgba(67,97,238,0.1)',
                  border:`1px solid ${msg.role==='assistant'?'#1a1a1a':'rgba(67,97,238,0.2)'}`,
                  color:msg.role==='assistant'?'#ccc':'white',
                  fontSize:'.85rem',lineHeight:1.6,direction:'rtl'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{display:'flex',gap:'.6rem',alignItems:'flex-end'}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'#4361ee',display:'flex',alignItems:'center',justifyContent:'center'}}><Bot size={14} color="white"/></div>
                <div style={{padding:'.7rem 1rem',background:'#111',borderRadius:'1.2rem 1.2rem 1.2rem 0',border:'1px solid #1a1a1a'}}>
                  <div style={{display:'flex',gap:'.25rem'}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:'50%',background:'#4361ee',animation:`bounce .8s ${i*0.15}s infinite`}}/>)}</div>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* أسئلة سريعة */}
          {messages.length <= 2 && (
            <div style={{padding:'0 1rem .8rem',display:'flex',gap:'.4rem',overflowX:'auto',scrollbarWidth:'none'}}>
              {QUICK.map((q,i)=>(
                <button key={i} onClick={()=>setInput(q)} style={{padding:'.4rem .8rem',borderRadius:'12px',background:'#111',border:'1px solid #222',color:'#666',fontSize:'.75rem',cursor:'pointer',whiteSpace:'nowrap'}}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{padding:'1rem',borderTop:'1px solid #1a1a1a',display:'flex',gap:'.6rem'}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} 
              placeholder="اكتب سؤالك يا سنيور..." 
              style={{flex:1,padding:'.75rem 1rem',borderRadius:'12px',background:'#111',border:'1px solid #222',color:'white',fontSize:'.85rem',outline:'none'}}/>
            <button onClick={send} disabled={loading||!input.trim()} style={{
              width:42,height:42,borderRadius:'12px',
              background:input.trim()?'#4361ee':'#111',
              border:'none',cursor:input.trim()?'pointer':'default',
              display:'flex',alignItems:'center',justifyContent:'center'
            }}>
              <Send size={18} color={input.trim()?'white':'#444'}/>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

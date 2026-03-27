import { useState, useEffect, useRef, useCallback } from "react";

import cosminhoImg from "./assets/cosminho.png";
import luanaImg from "./assets/luana.png";
import sagiImg from "./assets/sagi.png";



const IMG = {
  cosminho: cosminhoImg,
  luana: luanaImg,
  sagicrab: sagiImg
};

const CHARACTERS = {
  cosminho: {
    id:"cosminho", name:"Cosminho", img: IMG.cosminho,
    title:"Especialista Espacial", role:"Lançamentos · Satélites · Missões",
    color:"#3b82f6", colorDark:"#1d4ed8", colorGlow:"rgba(59,130,246,0.45)",
    voicePitch:1.3, voiceRate:1.05, voiceGender:"male",
    greeting:"Olá! Sou o Cosminho! 🚀 Vou te contar tudo sobre satélites, lançamentos e o universo espacial brasileiro. O que você quer explorar hoje?",
    suggestions:["O que é o CLA?","Quais satélites o Brasil tem?","Como funciona um foguete?"],
    system:`Você é o Cosminho, assistente educacional animado do Programa AEB Escola (Agência Espacial Brasileira). Especialista em temas técnicos do setor espacial: lançamentos, satélites (SGDC, CBERS, Amazonia-1), Centro de Lançamento de Alcântara, INPE, e o Programa Espacial Brasileiro. Fale em português do Brasil, de forma animada e acessível. Respostas curtas em até 3 parágrafos, ideais para leitura em voz alta.`,
  },
  luana: {
    id:"luana", name:"Luana", img: IMG.luana,
    title:"Especialista Jurídica", role:"Legislação · Normas · Política Espacial",
    color:"#64748b", colorDark:"#334155", colorGlow:"rgba(100,116,139,0.45)",
    voicePitch:1.2, voiceRate:0.92, voiceGender:"female",
    greeting:"Olá! Sou a Luana. Posso te ajudar a entender a legislação espacial brasileira, normas da AEB e políticas públicas do setor. Como posso auxiliar?",
    suggestions:["O que é a PNAE?","Quem regula o espaço no Brasil?","O que é a Lei do Espaço?"],
    system:`Você é a Luana, assistente educacional especializada em aspectos legais do setor espacial brasileiro do Programa AEB Escola. Especialidade: Lei do Espaço (Lei nº 9.994/2000), PNAE, regulamentações da AEB. Fale em português, tom profissional mas amigável. Respostas curtas em até 3 parágrafos, ideais para leitura em voz alta.`,
  },
  sagicrab: {
    id:"sagicrab", name:"Sagi-Crab", img: IMG.sagicrab,
    title:"Orquestrador Central", role:"Coordenação · Triagem · Todos os temas",
    color:"#1e40af", colorDark:"#1e3a8a", colorGlow:"rgba(30,64,175,0.45)",
    voicePitch:0.8, voiceRate:0.88, voiceGender:"male",
    greeting:"Oi! Eu sou o Sagi-Crab! 🦀 Sou o coordenador da Turma AEB. Posso responder qualquer pergunta sobre o espaço, ou te direcionar para o Cosminho (técnico) ou a Luana (legislação). O que deseja saber?",
    suggestions:["O que é a AEB?","Conheça a Turma AEB","O que o Brasil faz no espaço?"],
    system:`Você é o Sagi-Crab, orquestrador da Turma AEB do Programa AEB Escola. Conhecimento amplo sobre o setor espacial brasileiro. Mencione o Cosminho para perguntas técnicas e a Luana para legislação. Fale com personalidade divertida. Use 🦀 ocasionalmente. Respostas curtas em até 3 parágrafos, ideais para leitura em voz alta.`,
  },
};

const STARS = Array.from({length:55},(_,i)=>({id:i,top:Math.random()*100,left:Math.random()*100,size:Math.random()*2.5+0.8,dur:(Math.random()*4+2).toFixed(1),delay:(Math.random()*5).toFixed(1)}));

function getVoicesReady() {
  return new Promise(resolve => {
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) { resolve(v); return; }
    window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices());
  });
}

function pickVoice(gender) {
  const voices  = window.speechSynthesis.getVoices();
  const ptV     = voices.filter(v => v.lang.startsWith("pt"));
  const femKeys = ["female","francisca","vitoria","vitória","luciana"];
  const malKeys = ["male","daniel","ricardo","tiago","jorge","carlos","antonio"];
  if (gender === "female") {
    const f = ptV.find(v => femKeys.some(k=>v.name.toLowerCase().includes(k)) && !malKeys.some(k=>v.name.toLowerCase().includes(k)));
    return f || ptV.find(v=>!malKeys.some(k=>v.name.toLowerCase().includes(k))) || ptV[0] || voices[0];
  }
  return ptV.find(v=>malKeys.some(k=>v.name.toLowerCase().includes(k))) || ptV[0] || voices[0];
}

function VoiceWave({active,color}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:3,height:28}}>
      {Array.from({length:7},(_,i)=>(
        <div key={i} style={{width:3,borderRadius:2,background:color,height:active?undefined:4,animation:active?`wave ${(0.5+i*0.1).toFixed(1)}s ease-in-out infinite alternate`:"none",animationDelay:`${(i*0.07).toFixed(2)}s`}}/>
      ))}
    </div>
  );
}

function CharImg({char,speaking,size=140,float:doFloat=true}){
  return(
    <div style={{width:size,height:size,borderRadius:"50%",overflow:"hidden",border:`3px solid ${char.color}99`,boxShadow:speaking?`0 0 0 5px ${char.color},0 0 50px ${char.colorGlow},0 0 100px ${char.colorGlow}`:`0 0 25px ${char.colorGlow}`,animation:doFloat&&!speaking?"float 3s ease-in-out infinite":"none",transition:"box-shadow 0.35s",flexShrink:0}}>
      <img src={char.img} alt={char.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",display:"block"}}/>
    </div>
  );
}

export default function TurmaAEB(){
  const [selected,  setSelected]  = useState(null);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [speaking,  setSpeaking]  = useState(false);
  const [listening, setListening] = useState(false);
  //const [voiceOn,   setVoiceOn]   = useState(true);
  const [voiceOn, setVoiceOn] = useState(false);
  const [error,     setError]     = useState(null);

  const bottomRef   = useRef(null);
  const recogRef    = useRef(null);
  const selectedRef = useRef(null);
  const messagesRef = useRef([]);
  const loadingRef  = useRef(false);
  const voiceOnRef  = useRef(true);

  useEffect(()=>{ selectedRef.current = selected; },  [selected]);
  useEffect(()=>{ messagesRef.current = messages; },  [messages]);
  useEffect(()=>{ loadingRef.current  = loading;  },  [loading]);
  useEffect(()=>{ voiceOnRef.current  = voiceOn;  },  [voiceOn]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  /* TTS */
  const speak = useCallback(async(text,char)=>{
    if(!char||!window.speechSynthesis)return;
    window.speechSynthesis.cancel();
    await getVoicesReady();
    const u=new SpeechSynthesisUtterance(text);
    u.lang="pt-BR"; u.pitch=char.voicePitch; u.rate=char.voiceRate; u.volume=1;
    const voice=pickVoice(char.voiceGender);
    if(voice)u.voice=voice;
    u.onstart=()=>setSpeaking(true);
    u.onend=()=>setSpeaking(false);
    u.onerror=()=>setSpeaking(false);
    window.speechSynthesis.speak(u);
  },[]);

  /* ── SEND — build history excluding greeting, only real turns ── */
  const sendText = useCallback(async (text) => {
  const char = selectedRef.current;
  if (!text || !text.trim() || !char || loadingRef.current) return;

  const trimmed = text.trim();
  const userMsg = { role: "user", content: trimmed, id: Date.now() };

  const currentMsgs = messagesRef.current;

  setMessages(prev => {
    const next = [...prev, userMsg];
    messagesRef.current = next;
    return next;
  });

  setInput("");
  setLoading(true);
  loadingRef.current = true;
  setError(null);

  try {
    // 🔗 CHAMANDO SEU BACKEND
    //const res = await fetch("http://localhost:8002/respond"
    const res = await fetch(`${import.meta.env.VITE_API_URL}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        entry: [{
          changes: [{
            value: {
              messages: [{
                type: "text",
                text: {
                  body: trimmed
                }
              }],
              contacts: [{
                wa_id: "web_user"
              }],
              metadata: {
                phone_number_id: "web",
                display_phone_number: "web"
              }
            }
          }]
        }]
      })
    });

    const data = await res.json();

    console.log("Resposta backend:", data);

    // ✅ PEGA RESPOSTA DO FASTAPI
    const reply = data.message;

    if (reply) {
      setMessages(p => [...p, {
        role: "assistant",
        content: reply,
        id: Date.now() + 1
      }]);

      if (voiceOnRef.current) speak(reply, char);
    } else {
      setMessages(p => [...p, {
        role: "assistant",
        content: "Não recebi resposta válida do servidor.",
        id: Date.now() + 1
      }]);
    }

  } catch (e) {
    console.error(e);

    setError("Erro ao conectar com o backend.");

    setMessages(p => [...p, {
      role: "assistant",
      content: "❌ Não consegui conectar ao servidor em http://localhost:8002",
      id: Date.now() + 1
    }]);
  } finally {
    setLoading(false);
    loadingRef.current = false;
  }
}, [speak]);
    const selectChar = useCallback((char)=>{
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setSelected(char);
    setError(null);
    setMessages([]);
    messagesRef.current=[];
  },[speak]);

  const startListen = useCallback(()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){setError("Reconhecimento de voz não suportado. Use Chrome ou Edge.");return;}
    const r=new SR();
    r.lang="pt-BR"; r.continuous=false; r.interimResults=false;
    r.onstart=()=>setListening(true);
    r.onresult=(e)=>{
      const transcript=e.results[0][0].transcript;
      setListening(false);
      sendText(transcript); // auto-send
    };
    r.onerror=()=>setListening(false);
    r.onend=()=>setListening(false);
    recogRef.current=r;
    r.start();
  },[sendText]);

  const handleSubmit=(e)=>{e.preventDefault();if(input.trim())sendText(input);};
  const char=selected;

  return(
    <div style={{width:"100%",height:"100vh",overflow:"hidden",background:"radial-gradient(ellipse at 20% 30%,#0d1b4b 0%,#050d26 40%,#020810 100%)",fontFamily:"'Nunito',sans-serif",display:"flex",flexDirection:"column",position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Exo+2:wght@700;800;900&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.18);border-radius:2px}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes pulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes wave{from{height:4px}to{height:22px}}
        @keyframes cardIn{from{opacity:0;transform:translateY(28px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes star{0%,100%{opacity:0.15}50%{opacity:0.9}}
        @keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.6)}50%{box-shadow:0 0 0 14px rgba(34,197,94,0)}}
        input::placeholder{color:rgba(255,255,255,0.35)}
      `}</style>

      {STARS.map(s=>(
        <div key={s.id} style={{position:"absolute",borderRadius:"50%",top:`${s.top}%`,left:`${s.left}%`,width:s.size,height:s.size,background:"white",animation:`star ${s.dur}s ease-in-out infinite`,animationDelay:`${s.delay}s`,pointerEvents:"none"}}/>
      ))}

      {/* HEADER */}
      <div style={{padding:"13px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.07)",background:"rgba(0,0,0,0.38)",backdropFilter:"blur(14px)",zIndex:10,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {char&&(
            <button onClick={()=>{setSelected(null);setMessages([]);messagesRef.current=[];window.speechSynthesis?.cancel();setSpeaking(false);}}
              style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.14)",color:"white",borderRadius:8,padding:"6px 13px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>
              ← Voltar
            </button>
          )}
          <div>
            <div style={{fontFamily:"'Exo 2',sans-serif",fontWeight:900,fontSize:19,color:"white",letterSpacing:1}}>🛸 TURMA AEB</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.38)",letterSpacing:2,textTransform:"uppercase"}}>Agência Espacial Brasileira · AEB Escola</div>
          </div>
        </div>
        {char&&(
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>{setVoiceOn(v=>{voiceOnRef.current=!v;return !v;});window.speechSynthesis?.cancel();setSpeaking(false);}}
              style={{background:voiceOn?"rgba(59,130,246,0.18)":"rgba(255,255,255,0.06)",border:`1px solid ${voiceOn?"rgba(59,130,246,0.5)":"rgba(255,255,255,0.12)"}`,color:voiceOn?"#93c5fd":"rgba(255,255,255,0.4)",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>
              {voiceOn?"🔊 Voz On":"🔇 Voz Off"}
            </button>
            <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.06)",borderRadius:10,padding:"7px 14px",border:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{width:28,height:28,borderRadius:"50%",overflow:"hidden",border:`1.5px solid ${char.color}88`}}>
                <img src={char.img} alt={char.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>
              </div>
              <span style={{fontSize:14,fontWeight:800,color:"white"}}>{char.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* SELECTION */}
      {!selected?(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"28px 20px",gap:30,overflowY:"auto"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Exo 2',sans-serif",fontSize:30,fontWeight:900,color:"white",marginBottom:8}}>Escolha seu Assistente</div>
            <div style={{fontSize:15,color:"rgba(255,255,255,0.48)",maxWidth:420,lineHeight:1.6}}>Cada personagem é especialista em um domínio do setor espacial brasileiro</div>
          </div>
          <div style={{display:"flex",gap:22,flexWrap:"wrap",justifyContent:"center",maxWidth:950}}>
            {Object.values(CHARACTERS).map((c,i)=>(
              <button key={c.id} onClick={()=>selectChar(c)}
                style={{background:`linear-gradient(160deg,${c.colorDark}44,rgba(0,0,0,0.55))`,border:`2px solid ${c.color}50`,borderRadius:22,padding:"28px 22px",cursor:"pointer",color:"white",width:255,display:"flex",flexDirection:"column",alignItems:"center",gap:16,transition:"all 0.25s cubic-bezier(0.175,0.885,0.32,1.275)",animation:`cardIn 0.5s ease-out ${i*0.1}s both`,position:"relative",overflow:"hidden"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-8px) scale(1.03)";e.currentTarget.style.borderColor=c.color;e.currentTarget.style.boxShadow=`0 20px 50px ${c.colorGlow}`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=`${c.color}50`;e.currentTarget.style.boxShadow="";}}>
                <div style={{position:"absolute",inset:0,borderRadius:20,background:`radial-gradient(circle at 50% 30%,${c.color}14,transparent 70%)`,pointerEvents:"none"}}/>
                <CharImg char={c} speaking={false} size={130} float={true}/>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:"'Exo 2',sans-serif",fontSize:21,fontWeight:900,color:"white",marginBottom:4}}>{c.name}</div>
                  <div style={{fontSize:12,color:c.color,fontWeight:700,marginBottom:6}}>{c.title}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.48)",lineHeight:1.6}}>{c.role}</div>
                </div>
                <div style={{background:`linear-gradient(135deg,${c.color},${c.colorDark})`,color:"white",borderRadius:22,padding:"9px 22px",fontSize:13,fontWeight:800,width:"100%",textAlign:"center",boxShadow:`0 4px 16px ${c.colorGlow}`}}>
                  Conversar →
                </div>
              </button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 22px"}}>
            <span style={{fontSize:18}}>🚀</span>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.38)",letterSpacing:1}}>PROGRAMA AEB ESCOLA · POPULARIZAÇÃO DA CIÊNCIA ESPACIAL BRASILEIRA</span>
          </div>
        </div>
      ):(
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          {/* Sidebar */}
          <div style={{width:200,flexShrink:0,background:`linear-gradient(180deg,${char.colorDark}30 0%,rgba(0,0,0,0.45) 100%)`,borderRight:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",alignItems:"center",padding:"22px 14px",gap:14}}>
            <CharImg char={char} speaking={speaking} size={130} float={!speaking}/>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Exo 2',sans-serif",fontSize:17,fontWeight:900,color:"white"}}>{char.name}</div>
              <div style={{fontSize:11,color:char.color,fontWeight:700,marginTop:3}}>{char.title}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
              <VoiceWave active={speaking||listening} color={char.color}/>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.32)",letterSpacing:1}}>
                {speaking?"FALANDO...":listening?"OUVINDO...":"AGUARDANDO"}
              </div>
            </div>
            <div style={{marginTop:"auto",width:"100%"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.28)",letterSpacing:1,marginBottom:8,textAlign:"center"}}>TROCAR PERSONAGEM</div>
              {Object.values(CHARACTERS).filter(c=>c.id!==char.id).map(c=>(
                <button key={c.id} onClick={()=>selectChar(c)}
                  style={{width:"100%",marginBottom:7,background:`${c.colorDark}44`,border:`1px solid ${c.color}44`,color:"white",borderRadius:10,padding:"8px 10px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:9,transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${c.color}28`;e.currentTarget.style.borderColor=c.color;}}
                  onMouseLeave={e=>{e.currentTarget.style.background=`${c.colorDark}44`;e.currentTarget.style.borderColor=`${c.color}44`;}}>
                  <div style={{width:26,height:26,borderRadius:"50%",overflow:"hidden",flexShrink:0,border:`1.5px solid ${c.color}88`}}>
                    <img src={c.img} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>
                  </div>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chat panel */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{flex:1,overflowY:"auto",padding:"20px 20px 8px"}}>
              {messages.map(msg=>(
                <div key={msg.id} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",marginBottom:14,animation:"msgIn 0.3s ease-out"}}>
                  {msg.role==="assistant"&&(
                    <div style={{width:34,height:34,borderRadius:"50%",overflow:"hidden",border:`1.5px solid ${char.color}66`,flexShrink:0,marginRight:9,alignSelf:"flex-end"}}>
                      <img src={char.img} alt={char.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>
                    </div>
                  )}
                  <div style={{maxWidth:"72%",background:msg.role==="user"?`linear-gradient(135deg,${char.color}dd,${char.colorDark})`:"rgba(255,255,255,0.07)",border:msg.role==="user"?"none":"1px solid rgba(255,255,255,0.1)",borderRadius:msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"12px 16px",fontSize:14,lineHeight:1.65,color:"white",boxShadow:msg.role==="user"?`0 4px 20px ${char.colorGlow}`:"none",fontFamily:"'Nunito',sans-serif"}}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading&&(
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <div style={{width:34,height:34,borderRadius:"50%",overflow:"hidden",border:`1.5px solid ${char.color}66`,flexShrink:0}}>
                    <img src={char.img} alt={char.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>
                  </div>
                  <div style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"18px 18px 18px 4px",padding:"14px 18px",display:"flex",gap:6,alignItems:"center"}}>
                    {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:char.color,animation:"pulse 1s ease-in-out infinite",animationDelay:`${i*0.2}s`}}/>)}
                  </div>
                </div>
              )}
              {error&&(
                <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"10px 16px",color:"#fca5a5",fontSize:13,marginBottom:14,fontFamily:"'Nunito',sans-serif"}}>
                  ⚠️ {error}
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {messages.length<=1&&(
              <div style={{padding:"0 20px 12px",display:"flex",gap:8,flexWrap:"wrap"}}>
                {char.suggestions.map(q=>(
                  <button key={q} onClick={()=>sendText(q)}
                    style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${char.color}44`,color:"rgba(255,255,255,0.7)",borderRadius:20,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,transition:"all 0.2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${char.color}22`;e.currentTarget.style.color="white";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(255,255,255,0.7)";}}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* INPUT */}
            <form onSubmit={handleSubmit} style={{padding:"14px 20px 18px",borderTop:"1px solid rgba(255,255,255,0.1)",background:"rgba(0,0,0,0.45)",backdropFilter:"blur(14px)",display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
              <button type="button" onClick={()=>listening?recogRef.current?.stop():startListen()} title={listening?"Parar":"Falar — envia automaticamente"}
                style={{width:46,height:46,borderRadius:"50%",flexShrink:0,background:listening?"rgba(34,197,94,0.25)":"rgba(255,255,255,0.08)",border:`2px solid ${listening?"#22c55e":"rgba(255,255,255,0.18)"}`,color:listening?"#86efac":"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",animation:listening?"micPulse 1s infinite":"none",transition:"all 0.2s"}}>
                {listening?"⏹":"🎤"}
              </button>

              <input value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&input.trim()){e.preventDefault();sendText(input);}}}
                placeholder={listening?"🎙 Ouvindo... fale sua pergunta!":`Digite ou fale para ${char.name}...`}
                disabled={loading||listening}
                style={{flex:1,background:"rgba(255,255,255,0.09)",border:`2px solid ${input.trim()?char.color:listening?"#22c55e":"rgba(255,255,255,0.18)"}`,borderRadius:24,padding:"12px 20px",color:"white",fontSize:15,outline:"none",fontFamily:"'Nunito',sans-serif",fontWeight:600,transition:"border-color 0.2s,box-shadow 0.2s",minWidth:0}}
                onFocus={e=>{e.target.style.borderColor=char.color;e.target.style.boxShadow=`0 0 0 3px ${char.colorGlow}`;}}
                onBlur={e=>{e.target.style.borderColor=input.trim()?char.color:"rgba(255,255,255,0.18)";e.target.style.boxShadow="none";}}
              />

              <button type="submit" disabled={!input.trim()||loading||listening} title="Enviar"
                style={{width:46,height:46,borderRadius:"50%",flexShrink:0,background:input.trim()&&!loading&&!listening?`linear-gradient(135deg,${char.color},${char.colorDark})`:"rgba(255,255,255,0.07)",border:"none",color:"white",cursor:input.trim()&&!loading&&!listening?"pointer":"not-allowed",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",boxShadow:input.trim()&&!loading&&!listening?`0 4px 18px ${char.colorGlow}`:"none",opacity:!input.trim()&&!loading?0.4:1}}>
                {loading?<div style={{width:18,height:18,border:"2px solid white",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>:"➤"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { supabase, loginCliente, fetchClients, upsertClient, insertClient,
  fetchBancos, insertBanco, deleteBanco,
  fetchCompetencias, addCompetencia, removeCompetencia,
  fetchAnosRel, addAnoRel, removeAnoRel,
  fetchEnvios, upsertEnvio,
  fetchImpCfg, upsertImpCfg, deleteImpCfg,
  fetchImpDados, upsertImpDado,
  fetchAvulsas, insertAvulsa, updateAvulsa,
  fetchNotas, insertNota, deleteNota,
  fetchResumo, upsertResumo,
  fetchRelatorios, upsertRelatorio,
  fetchMessages, sendMessage, subscribeChat,
  subscribeImpDados, subscribeAvulsas, subscribeEnvios,
  subscribeNotas, subscribeResumo, subscribeRelatorios,
  fetchNotificacoes, insertNotificacao, markNotifRead,
  uploadArquivo, getSignedUrl
} from "./supabase";
import usePWA from "./usePWA";
import UpdateBanner from "./UpdateBanner";
import { subscribePush, sendPushNotification } from "./usePush";

// ─── LOGO ────────────────────────────────────────────────────────────────────
const LOGO = "data:image/jpeg;base64,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";

const C = {
  bg:"#F7F6F2", bgAlt:"#FFFFFF", surface:"#FFFFFF", surfaceAlt:"#F0EDE6",
  border:"#E2DDD5", borderDark:"#C8C2B8",
  gold:"#B8912A", goldLight:"#D4AA45", goldDark:"#8B6914",
  text:"#1A1A1A", textSub:"#4A4540", muted:"#8A857E",
  red:"#C0392B", green:"#1E7D45", amber:"#A06000",
  blue:"#2563EB", purple:"#7B5EA7",
  shadow:"0 1px 4px rgba(0,0,0,0.08)",
};

const TODAY = new Date().toISOString().split("T")[0];
const MESES_LABELS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MES_DEF = TODAY.slice(0,7);
const MESES_EXTR = Array.from({length:4},(_,i)=>{
  const d=new Date(); d.setMonth(d.getMonth()-i);
  const id=d.toISOString().slice(0,7);
  return {id, label: MESES_LABELS[d.getMonth()]+"/"+d.getFullYear()};
});

function mesIdLabel(id){
  if(!id) return "";
  const [y,m]=id.split("-");
  return MESES_LABELS[parseInt(m)-1]+"/"+y;
}
function isVencido(v,s){return s!=="pago"&&v<TODAY;}
function getSI(t){
  if(t.status==="pago")   return{label:"Pago",        color:C.green,bg:"#E8F5ED",border:"#A8D5BB"};
  if(t.pagoCliente||t.pago_cliente) return{label:"Aguard.Conf.",color:C.amber,bg:"#FFF8E8",border:"#F0D080"};
  if(isVencido(t.venc,t.status)||t.status==="vencido")
                          return{label:"Vencida",     color:C.red,  bg:"#FDE8E8",border:"#F0AAAA"};
  return                        {label:"Pendente",    color:C.amber,bg:"#FFF3DC",border:"#F0C060"};
}

// ─── FILE VIEWER ─────────────────────────────────────────────────────────────
const ViewerCtx = createContext(null);
function FileViewerProvider({children}){
  const[file,setFile]=useState(null);
  const[url,setUrl]=useState(null);
  const[loading,setLoading]=useState(false);

  async function openFile(name, path, modulo){
    setFile({name, type: name?.split(".").pop()?.toLowerCase()||"?"});
    setUrl(null);
    if(path){
      setLoading(true);
      try{
        const u = await getSignedUrl(path, modulo||"arquivos");
        setUrl(u);
      }catch(e){ setUrl(null); }
      setLoading(false);
    }
  }

  return (
    <ViewerCtx.Provider value={{openFile}}>
      {children}
      {file&&(
        <div onClick={e=>e.target===e.currentTarget&&setFile(null)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:2000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:560,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 8px 40px rgba(0,0,0,0.3)"}}>
            <div style={{padding:"14px 18px",borderBottom:"1px solid #E2DDD5",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22}}>{file.type==="pdf"?"📄":file.type==="ofx"?"🏦":"📎"}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:"#1A1A1A",wordBreak:"break-all"}}>{file.name}</div>
                  <div style={{fontSize:11,color:"#8A857E",textTransform:"uppercase",letterSpacing:0.5}}>{file.type}</div>
                </div>
              </div>
              <button onClick={()=>setFile(null)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:22,color:"#8A857E"}}>×</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:24,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,background:"#F7F6F2"}}>
              {loading&&<div style={{fontSize:14,color:C.muted}}>⏳ Carregando...</div>}
              {!loading&&url&&file.type==="pdf"&&<iframe src={url} style={{width:"100%",height:400,borderRadius:8,border:"none"}}/>}
              {!loading&&!url&&<div style={{textAlign:"center"}}><div style={{fontSize:64,marginBottom:16}}>📄</div><div style={{fontSize:13,color:C.muted}}>{file.name}</div></div>}
            </div>
            <div style={{padding:"14px 18px",borderTop:"1px solid #E2DDD5",display:"flex",gap:10,justifyContent:"flex-end",flexShrink:0,background:"#fff"}}>
              <button onClick={()=>setFile(null)} style={{padding:"9px 18px",borderRadius:8,border:"1px solid #E2DDD5",background:"transparent",color:"#8A857E",fontSize:13,cursor:"pointer"}}>Fechar</button>
              {url&&<a href={url} download={file.name} style={{padding:"9px 20px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#D4AA45,#8B6914)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",textDecoration:"none"}}>⬇ Baixar</a>}
            </div>
          </div>
        </div>
      )}
    </ViewerCtx.Provider>
  );
}
function useFileViewer(){ return useContext(ViewerCtx)||{openFile:()=>{}}; }

function FileChip({name,path,modulo,color,bg,border}){
  const{openFile}=useFileViewer();
  if(!name) return null;
  const ext=name.split(".").pop()?.toLowerCase()||"";
  const icon=ext==="pdf"?"📄":ext==="ofx"?"🏦":"📎";
  return (
    <button onClick={()=>openFile(name,path,modulo)}
      style={{display:"inline-flex",alignItems:"center",gap:6,background:bg||"rgba(255,255,255,0.8)",borderRadius:6,padding:"4px 10px",border:`1px solid ${border||"#F0D080"}`,cursor:"pointer",fontSize:12,color:color||"#B8912A",fontWeight:600,textAlign:"left",maxWidth:"100%"}}>
      <span>{icon}</span><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</span><span style={{fontSize:10,opacity:0.7}}>▶</span>
    </button>
  );
}
function BtnView({name,path,modulo,label,sm}){
  const{openFile}=useFileViewer();
  return (
    <button onClick={()=>openFile(name,path,modulo)}
      style={{padding:sm?"6px 12px":"9px 18px",borderRadius:8,border:`1.5px solid ${C.green}`,background:"#E8F5ED",color:C.green,fontSize:sm?11:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
      {label||"👁 Visualizar"}
    </button>
  );
}

// ─── UI ATOMS ────────────────────────────────────────────────────────────────
function Card({children,style}){ return <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow,...style}}>{children}</div>; }
function FieldLabel({text}){ return <label style={{color:C.muted,fontSize:11,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",display:"block",marginBottom:6}}>{text}</label>; }
function TxtIn({value,onChange,type,placeholder,readOnly}){ return <input type={type||"text"} value={value||""} onChange={onChange} placeholder={placeholder} readOnly={readOnly} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:readOnly?C.surfaceAlt:C.bgAlt,color:C.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>; }
function SelIn({value,onChange,children}){ return <select value={value} onChange={onChange} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.bgAlt,color:C.text,fontSize:14,outline:"none"}}>{children}</select>; }
function Pill({label,color,bg,border}){ return <span style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap",background:bg||"#eee",color:color||C.muted,border:`1px solid ${border||C.border}`}}>{label}</span>; }
function BtnPri({onClick,children,full,disabled}){ return <button onClick={onClick} disabled={disabled} style={{padding:"12px 24px",borderRadius:8,border:"none",background:disabled?"#ccc":`linear-gradient(135deg,${C.goldLight},${C.goldDark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",width:full?"100%":"auto",boxShadow:"0 2px 8px rgba(184,145,42,0.3)"}}>{children}</button>; }
function BtnOut({onClick,children,sm,col}){ const c=col||C.gold; return <button onClick={onClick} style={{padding:sm?"6px 12px":"9px 18px",borderRadius:8,border:`1.5px solid ${c}`,background:"transparent",color:c,fontSize:sm?11:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>{children}</button>; }
function BtnGr({onClick,children,sm}){ return <button onClick={onClick} style={{padding:sm?"6px 12px":"9px 18px",borderRadius:8,border:`1.5px solid ${C.green}`,background:"#E8F5ED",color:C.green,fontSize:sm?11:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>{children}</button>; }
function BtnGh({onClick,children,sm}){ return <button onClick={onClick} style={{padding:sm?"5px 10px":"9px 16px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:sm?11:13,cursor:"pointer"}}>{children}</button>; }
function BtnRed({onClick,children,sm}){ return <button onClick={onClick} style={{padding:sm?"5px 10px":"9px 16px",borderRadius:8,border:`1px solid ${C.red}55`,background:"#FDE8E8",color:C.red,fontSize:sm?11:13,fontWeight:600,cursor:"pointer"}}>{children}</button>; }
function SecH({text,color}){ return <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><div style={{width:3,height:16,borderRadius:2,background:color||C.gold}}/><span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:color||C.textSub}}>{text}</span></div>; }
function ModalBox({onClose,children}){ return <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}><div style={{background:C.surface,borderRadius:16,padding:28,maxWidth:480,width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,0.2)",maxHeight:"90vh",overflowY:"auto"}}>{children}</div></div>; }
function FCard({title,children,onSave,onCancel}){ return <Card style={{padding:20,marginBottom:16}}>{title&&<h3 style={{color:C.gold,margin:"0 0 16px",fontSize:13,fontWeight:700}}>{title}</h3>}{children}<div style={{display:"flex",gap:10,marginTop:16}}><BtnPri onClick={onSave}>Salvar</BtnPri><BtnGh onClick={onCancel}>Cancelar</BtnGh></div></Card>; }
function PgH({title,action}){ return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h2 style={{color:C.text,margin:0,fontSize:18,fontWeight:700}}>{title}</h2>{action}</div>; }
function MesFilt({value,onChange,options}){ const opts=options||MESES_EXTR; return <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>{opts.map(m=>(<button key={m.id} onClick={()=>onChange(m.id)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${value===m.id?C.gold:C.border}`,background:value===m.id?C.gold:"transparent",color:value===m.id?"#fff":C.muted,fontSize:12,fontWeight:600,cursor:"pointer"}}>{m.label}</button>))}</div>; }
function Empty({icon,text}){ return <div style={{textAlign:"center",padding:"40px 20px",color:C.muted}}><div style={{fontSize:36,marginBottom:12}}>{icon}</div><p style={{fontSize:14,margin:0}}>{text}</p></div>; }
function CliSel({clients,value,onChange}){ return <SelIn value={value} onChange={e=>onChange(e.target.value)}>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</SelIn>; }
function Spin(){ return <div style={{textAlign:"center",padding:40,color:C.muted,fontSize:13}}>⏳ Carregando...</div>; }

// ─── COMPETÊNCIAS PANEL ───────────────────────────────────────────────────────
function CompetenciasPanel({clientId,modulo,label}){
  const[comps,setComps]=useState([]);
  const[show,setShow]=useState(false);
  const[val,setVal]=useState("");
  const[confirmRem,setConfirmRem]=useState(null);

  useEffect(()=>{ if(clientId) fetchCompetencias(clientId,modulo).then(setComps); },[clientId,modulo]);

  async function doAdd(){
    if(!val||comps.includes(val)) return;
    await addCompetencia(clientId,modulo,val);
    setComps(p=>[val,...p].sort((a,b)=>b.localeCompare(a)));
    setVal(""); setShow(false);
  }
  async function doRemove(c){
    await removeCompetencia(clientId,modulo,c);
    setComps(p=>p.filter(x=>x!==c));
    setConfirmRem(null);
  }

  return (
    <Card style={{padding:16,marginBottom:20,background:"#FDF5E0",border:"1px solid #F0D080"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:comps.length>0?10:0}}>
        <span style={{fontSize:12,fontWeight:600,color:C.textSub}}>📅 {label||"Competências"} ({comps.length})</span>
        <BtnOut onClick={()=>setShow(!show)} sm>+ Adicionar</BtnOut>
      </div>
      {show&&(<div style={{display:"flex",gap:8,marginBottom:10,alignItems:"flex-end"}}>
        <div style={{flex:1}}><FieldLabel text="Competência (YYYY-MM)"/><TxtIn value={val} onChange={e=>setVal(e.target.value)} placeholder="2026-06"/></div>
        <BtnPri onClick={doAdd}>Salvar</BtnPri><BtnGh onClick={()=>{setShow(false);setVal("");}}>Cancelar</BtnGh>
      </div>)}
      {confirmRem&&(<div style={{background:"#FDE8E8",borderRadius:8,padding:"10px 14px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #F0AAAA"}}>
        <span style={{fontSize:12,color:C.red,fontWeight:600}}>Excluir {mesIdLabel(confirmRem)}?</span>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>doRemove(confirmRem)} style={{padding:"5px 12px",borderRadius:6,border:"none",background:C.red,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Excluir</button>
          <BtnGh onClick={()=>setConfirmRem(null)} sm>Cancelar</BtnGh>
        </div>
      </div>)}
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {comps.map(c=>(<div key={c} style={{display:"flex",alignItems:"center",gap:4,background:"#fff",borderRadius:20,padding:"4px 10px 4px 12px",border:`1px solid ${confirmRem===c?"#F0AAAA":"#F0D080"}`}}>
          <span style={{fontSize:12,color:C.textSub,fontWeight:500}}>{mesIdLabel(c)}</span>
          <button onClick={()=>setConfirmRem(confirmRem===c?null:c)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.red,fontSize:14,lineHeight:1,padding:"0 2px"}}>×</button>
        </div>))}
        {comps.length===0&&<span style={{fontSize:12,color:C.muted}}>Nenhuma competência.</span>}
      </div>
    </Card>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin,contadorPw}){
  const saved = (() => { try{ return JSON.parse(localStorage.getItem("yfcont_savedCreds")||"null"); }catch(e){return null;} })();
  const[role,setRole]=useState(saved?.role||"contador");
  const[email,setEmail]=useState(saved?.email||"");
  const[pw,setPw]=useState(saved?.pw||"");
  const[saveLogin,setSaveLogin]=useState(!!saved);
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);

  async function go(){
    setLoading(true); setErr("");
    try{
      if(role==="contador"){
        if(email==="y.facundo@yahoo.com.br"&&pw===contadorPw){
          if(saveLogin) localStorage.setItem("yfcont_savedCreds", JSON.stringify({role,email,pw}));
          else localStorage.removeItem("yfcont_savedCreds");
          onLogin({role:"contador",name:"YF Contabilidade"});
        } else { setErr("Credenciais inválidas."); }
      } else {
        const c = await loginCliente(email,pw);
        if(saveLogin) localStorage.setItem("yfcont_savedCreds", JSON.stringify({role,email,pw}));
        else localStorage.removeItem("yfcont_savedCreds");
        onLogin({role:"cliente",...c});
      }
    }catch(e){ setErr(e.message||"Credenciais inválidas."); }
    setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",padding:16}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"inline-block",background:"#000",borderRadius:16,padding:16,marginBottom:16}}>
            <img src={LOGO} alt="YF" style={{width:140,height:"auto",display:"block",mixBlendMode:"lighten"}}/>
          </div>
          <div style={{color:C.muted,fontSize:12,fontWeight:600,letterSpacing:2,textTransform:"uppercase"}}>Portal do Cliente</div>
        </div>
        <Card style={{padding:28}}>
          <div style={{display:"flex",background:C.surfaceAlt,borderRadius:10,padding:4,marginBottom:24,gap:4}}>
            {["contador","cliente"].map(r=>(
              <button key={r} onClick={()=>{setRole(r);setErr("");}}
                style={{flex:1,padding:"10px",borderRadius:7,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:role===r?"#fff":"transparent",color:role===r?C.gold:C.muted,boxShadow:role===r?C.shadow:"none"}}>
                {r==="contador"?"Contador":"Cliente"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><FieldLabel text="E-mail"/><TxtIn value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="seu@email.com"/></div>
            <div><FieldLabel text="Senha"/>
              <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="••••••••"
                style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.bgAlt,color:C.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            </div>
            {err&&<p style={{color:C.red,fontSize:13,margin:0,background:"#FDE8E8",padding:"8px 12px",borderRadius:8}}>{err}</p>}
            <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"4px 0"}}>
              <div onClick={()=>setSaveLogin(!saveLogin)}
                style={{width:20,height:20,borderRadius:5,border:`2px solid ${saveLogin?C.gold:C.border}`,background:saveLogin?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                {saveLogin&&<span style={{color:"#fff",fontSize:12,fontWeight:900,lineHeight:1}}>✓</span>}
              </div>
              <span style={{fontSize:13,color:C.textSub}}>Lembrar meu acesso</span>
            </label>
            <BtnPri onClick={go} full disabled={loading}>{loading?"Entrando...":"Entrar"}</BtnPri>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── CLIENTES ────────────────────────────────────────────────────────────────
function ClientesTab({clients,setClients}){
  const[show,setShow]=useState(false);
  const[form,setForm]=useState({name:"",cnpj:"",email:"",password:"",regime:"Simples Nacional",insc_municipal:"",honorarios:"",cert_validade:"",cert_senha:""});
  const[loading,setLoading]=useState(false);

  async function add(){
    if(!form.name||!form.email) return;
    setLoading(true);
    try{
      const novo = await insertClient({...form,status:"ativo",nfse_cfg:{}});
      setClients(p=>[...p,novo]);
      setForm({name:"",cnpj:"",email:"",password:"",regime:"Simples Nacional",insc_municipal:"",honorarios:"",cert_validade:"",cert_senha:""});
      setShow(false);
    }catch(e){ alert("Erro: "+e.message); }
    setLoading(false);
  }

  async function toggleStatus(c){
    const updated = await upsertClient({...c,status:c.status==="ativo"?"inativo":"ativo"});
    setClients(p=>p.map(x=>x.id===c.id?updated:x));
  }

  async function deleteClient(c){
    const conf = window.confirm(
      "⚠️ EXCLUIR DEFINITIVAMENTE\n\n" +
      "Empresa: " + c.name + "\n" +
      "CNPJ: " + (c.cnpj||"—") + "\n\n" +
      "Esta ação NÃO pode ser desfeita.\n" +
      "Todos os dados desta empresa serão removidos.\n\n" +
      "Tem certeza?"
    );
    if(!conf) return;
    try{
      await supabase.from("clients").delete().eq("id",c.id);
      setClients(p=>p.filter(x=>x.id!==c.id));
    }catch(e){ alert("Erro ao excluir: "+e.message); }
  }

  return (
    <div>
      <PgH title="Clientes" action={<BtnOut onClick={()=>setShow(!show)}>+ Novo</BtnOut>}/>
      {show&&<FCard title="Novo Cliente" onSave={add} onCancel={()=>setShow(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[["Razão Social","name"],["CNPJ","cnpj"],["E-mail (usuário)","email"],["Senha de acesso","password"],["Inscrição Municipal","insc_municipal"],["Honorários mensais","honorarios"],["Validade Cert. Digital","cert_validade"],["Senha Cert. Digital","cert_senha"]].map(([l,k])=>(
            <div key={k}><FieldLabel text={l}/><TxtIn value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
          ))}
          <div><FieldLabel text="Regime"/>
            <SelIn value={form.regime} onChange={e=>setForm({...form,regime:e.target.value})}>
              <option>Simples Nacional</option><option>Lucro Presumido</option><option>Lucro Real</option><option>MEI</option>
            </SelIn>
          </div>
        </div>
      </FCard>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {clients.map(c=>(
          <Card key={c.id} style={{padding:16,opacity:c.status==="inativo"?0.65:1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:2}}>{c.name}</div>
                <div style={{fontSize:12,color:C.muted}}>{c.cnpj} · {c.regime}</div>
                <div style={{fontSize:12,color:C.muted}}>{c.email}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,flexShrink:0,marginLeft:12}}>
                <Pill label={c.status==="ativo"?"Ativo":"Inativo"} color={c.status==="ativo"?C.green:C.red} bg={c.status==="ativo"?"#E8F5ED":"#FDE8E8"} border={c.status==="ativo"?"#A8D5BB":"#F0AAAA"}/>
                <button onClick={()=>toggleStatus(c)}
                  style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${c.status==="ativo"?C.red+"55":C.green+"55"}`,background:c.status==="ativo"?"#FDE8E8":"#E8F5ED",color:c.status==="ativo"?C.red:C.green,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  {c.status==="ativo"?"🔴 Inativar":"🟢 Ativar"}
                </button>
                <button onClick={()=>deleteClient(c)}
                  style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${C.red}`,background:"#FDE8E8",color:C.red,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  🗑 Excluir
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── CADASTRO ────────────────────────────────────────────────────────────────
function CadastroTab({user,clients,setClients}){
  const id=user.role==="cliente"?user.id:(clients[0]?.id||null);
  const[selId,setSelId]=useState(id);
  const client=clients.find(c=>c.id===selId)||clients[0];
  const[editMode,setEditMode]=useState(false);
  const[form,setForm]=useState(null);
  const certRef=useRef(); const contratoRef=useRef(); const contratoSocRef=useRef();

  async function saveEdit(){
    const updated = await upsertClient({...client,...form});
    setClients(p=>p.map(c=>c.id===updated.id?updated:c));
    setEditMode(false);
  }

  async function setArq(key,file){
    const path = await uploadArquivo(client.id,"documentos",file);
    const updated = await upsertClient({...client,[key]:file.name,[key+"_path"]:path});
    setClients(p=>p.map(c=>c.id===updated.id?updated:c));
  }

  if(!client) return <Empty icon="🏢" text="Nenhum cliente cadastrado."/>;
  return (
    <div>
      <PgH title="Cadastro da Empresa"
        action={<div style={{display:"flex",gap:8,alignItems:"center"}}>
          {user.role==="contador"&&<div style={{width:160}}><SelIn value={selId||""} onChange={e=>setSelId(e.target.value)}>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</SelIn></div>}
          {user.role==="contador"&&!editMode&&<BtnOut onClick={()=>{setForm({...client});setEditMode(true);}} sm>✏️ Editar</BtnOut>}
        </div>}/>
      {editMode?(
        <FCard title="Editar Cadastro" onSave={saveEdit} onCancel={()=>setEditMode(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[["Razão Social","name"],["CNPJ","cnpj"],["Inscrição Municipal","insc_municipal"],["E-mail","email"],["Senha de acesso","password"],["Honorários mensais","honorarios"],["Validade Cert. Digital","cert_validade"],["Senha Cert. Digital","cert_senha"]].map(([l,k])=>(
              <div key={k}><FieldLabel text={l}/><TxtIn value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
            ))}
            <div><FieldLabel text="Regime"/>
              <SelIn value={form.regime||""} onChange={e=>setForm({...form,regime:e.target.value})}>
                <option>Simples Nacional</option><option>Lucro Presumido</option><option>Lucro Real</option><option>MEI</option>
              </SelIn>
            </div>
          </div>
        </FCard>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Card style={{padding:20}}>
            <SecH text="Dados da Empresa" color={C.gold}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[["Razão Social",client.name],["CNPJ",client.cnpj],["Regime",client.regime],["Inscrição Municipal",client.insc_municipal||"—"],["E-mail",client.email],["Honorários",client.honorarios||"—"]].map(([l,v])=>(
                <div key={l}><div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",marginBottom:3}}>{l}</div><div style={{fontSize:14,color:C.text,fontWeight:500}}>{v}</div></div>
              ))}
            </div>
          </Card>
          {user.role==="contador"&&(
            <Card style={{padding:20,background:"#FDF5E0",border:"1px solid #F0D080"}}>
              <SecH text="Credenciais" color={C.amber}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",marginBottom:3}}>Usuário</div><div style={{fontSize:14,color:C.text}}>{client.email}</div></div>
                <div><div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",marginBottom:3}}>Senha</div><div style={{fontSize:14,color:C.text,fontFamily:"monospace"}}>{client.password}</div></div>
                <div><div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",marginBottom:3}}>Validade Cert.</div><div style={{fontSize:14,color:C.text}}>{client.cert_validade||"—"}</div></div>
                <div><div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",marginBottom:3}}>Senha Cert.</div><div style={{fontSize:14,color:C.text,fontFamily:"monospace"}}>{client.cert_senha||"—"}</div></div>
              </div>
            </Card>
          )}
          {user.role==="contador"&&(
            <Card style={{padding:20,background:"#F0F7FF",border:"1px solid #B0D0F0"}}>
              <SecH text="Configuração NFS-e" color="#2563EB"/>
              {editMode?(
                <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:8}}>
                  {[["Endpoint (URL Webservice)","nfse_endpoint"],["Usuário","nfse_usuario"],["Senha","nfse_senha"],["Token","nfse_token"]].map(([l,k])=>(
                    <div key={k}><FieldLabel text={l}/><TxtIn value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
                  ))}
                </div>
              ):(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:8}}>
                  {[["Endpoint",client.nfse_endpoint],["Usuário",client.nfse_usuario],["Senha",client.nfse_senha],["Token",client.nfse_token]].map(([l,v])=>(
                    <div key={l}><div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",marginBottom:3}}>{l}</div><div style={{fontSize:13,color:v?C.text:C.muted,fontFamily:l!=="Endpoint"?"monospace":"inherit",wordBreak:"break-all"}}>{v||"—"}</div></div>
                  ))}
                  {!client.nfse_endpoint&&<div style={{gridColumn:"1/-1",fontSize:12,color:C.muted,fontStyle:"italic"}}>Clique em Editar para configurar o webservice NFS-e</div>}
                </div>
              )}
            </Card>
          )}
          <Card style={{padding:20}}>
            <SecH text="Documentos"/>
            <input ref={certRef} type="file" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setArq("cert_digital",e.target.files[0]);}}/>
            <input ref={contratoRef} type="file" accept=".pdf,.docx" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setArq("contrato",e.target.files[0]);}}/>
            <input ref={contratoSocRef} type="file" accept=".pdf,.docx" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setArq("contrato_social",e.target.files[0]);}}/>
            {[["Certificado Digital","cert_digital"],["Contrato de Serviços","contrato"],["Contrato Social","contrato_social"]].map(([l,k])=>(
              <div key={k} style={{background:client[k]?C.surfaceAlt:"#FFF8F0",borderRadius:8,padding:"12px 14px",border:`1px solid ${client[k]?C.border:"#F0D080"}`,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:6}}>{l}</div>
                    {client[k]?<FileChip name={client[k]} path={client[k+"_path"]} modulo="documentos"/>:<div style={{fontSize:12,color:C.muted}}>Nenhum arquivo</div>}
                  </div>
                  <div style={{display:"flex",gap:8,marginLeft:12,flexShrink:0}}>
                    {client[k]&&<BtnView name={client[k]} path={client[k+"_path"]} modulo="documentos" sm/>}
                    {user.role==="contador"&&<BtnOut onClick={()=>({cert_digital:certRef,contrato:contratoRef,contrato_social:contratoSocRef}[k].current?.click())} sm>{client[k]?"🔄 Trocar":"📎 Anexar"}</BtnOut>}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── BANCOS ───────────────────────────────────────────────────────────────────
function BancosTab({clients}){
  const[sel,setSel]=useState(clients[0]?.id||"");
  const[bancos,setBancos]=useState([]);
  const[show,setShow]=useState(false);
  const[form,setForm]=useState({nome:"",agencia:"",conta:"",tipo:"Corrente"});

  useEffect(()=>{ if(sel) fetchBancos(sel).then(setBancos); },[sel]);

  async function add(){
    if(!form.nome) return;
    const novo = await insertBanco(sel,form);
    setBancos(p=>[...p,novo]);
    setForm({nome:"",agencia:"",conta:"",tipo:"Corrente"}); setShow(false);
  }
  async function remove(id){
    await deleteBanco(id);
    setBancos(p=>p.filter(x=>x.id!==id));
  }

  return (
    <div>
      <PgH title="Bancos" action={<div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{width:160}}><SelIn value={sel} onChange={e=>setSel(e.target.value)}>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</SelIn></div>
        <BtnOut onClick={()=>setShow(!show)}>+ Banco</BtnOut>
      </div>}/>
      {show&&<FCard title="Novo Banco" onSave={add} onCancel={()=>setShow(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><FieldLabel text="Nome"/><TxtIn value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Ex: Banco do Brasil"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><FieldLabel text="Agência"/><TxtIn value={form.agencia} onChange={e=>setForm({...form,agencia:e.target.value})}/></div>
            <div><FieldLabel text="Conta"/><TxtIn value={form.conta} onChange={e=>setForm({...form,conta:e.target.value})}/></div>
          </div>
          <div><FieldLabel text="Tipo"/><SelIn value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}><option>Corrente</option><option>Poupança</option><option>Digital</option><option>Salário</option></SelIn></div>
        </div>
      </FCard>}
      {bancos.length===0&&<Empty icon="🏦" text="Nenhum banco cadastrado."/>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {bancos.map(b=>(
          <Card key={b.id} style={{padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:C.text}}>{b.nome}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:3}}>Ag. {b.agencia} · C/C {b.conta}</div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Pill label={b.tipo} color={C.gold} bg="#FDF5E0" border="#F0D080"/>
                <BtnGh sm onClick={()=>remove(b.id)}>Remover</BtnGh>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── EXTRATOS ─────────────────────────────────────────────────────────────────
function ExtratosTab({user,clients}){
  const[sel,setSel]=useState(user.role==="cliente"?user.id:(clients[0]?.id||""));
  const[bancos,setBancos]=useState([]);
  const[envios,setEnvios]=useState({});
  const[comps,setComps]=useState([]);
  const[mes,setMes]=useState(MES_DEF);
  const pdfRefs=useRef({}); const ofxRefs=useRef({});

  useEffect(()=>{ if(sel){ fetchBancos(sel).then(setBancos); fetchCompetencias(sel,"extratos").then(c=>{setComps(c);if(c[0])setMes(c[0]);}); } },[sel]);
  useEffect(()=>{
    if(!sel||!mes) return;
    const load=()=>fetchEnvios(sel,mes).then(list=>{ const m={}; list.forEach(e=>m[e.banco_id]=e); setEnvios(m); });
    load();
    const ch=subscribeEnvios(sel,load);
    return ()=>supabase.removeChannel(ch);
  },[sel,mes]);

  async function handleFile(bid,tipo,file){
    try{
      const path = await uploadArquivo(sel,"extratos",file);
      const cur = envios[bid]||{pdf_path:null,ofx_path:null};
      const pdf = tipo==="pdf"?path:cur.pdf_path;
      const ofx = tipo==="ofx"?path:cur.ofx_path;
      await upsertEnvio(sel,bid,mes,pdf,ofx);
      setEnvios(p=>({...p,[bid]:{...cur,[tipo+"_path"]:path,status:"enviado",[tipo+"_name"]:file.name}}));
    }catch(e){
      console.error("Erro ao anexar extrato:",e);
      alert("Erro ao anexar arquivo: "+e.message);
    }
  }

  const mesOpts=comps.map(id=>({id,label:mesIdLabel(id)}));
  const pend=bancos.filter(b=>!envios[b.id]||envios[b.id].status!=="enviado");
  const env=bancos.filter(b=>envios[b.id]?.status==="enviado");

  return (
    <div>
      <PgH title="Extratos Bancários" action={user.role==="contador"&&<div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{width:160}}><CliSel clients={clients} value={sel} onChange={v=>{setSel(v);setMes(MES_DEF);}}/></div>
      </div>}/>
      {user.role==="contador"&&<CompetenciasPanel clientId={sel} modulo="extratos" label="Competências — Extratos"/>}
      {mesOpts.length>0&&<MesFilt value={mes} onChange={setMes} options={mesOpts}/>}
      {bancos.length===0&&<Empty icon="🏦" text="Nenhum banco cadastrado."/>}
      {pend.length>0&&(<div style={{marginBottom:24}}>
        <SecH text="Pendentes" color={C.amber}/>
        {pend.map(b=>{
          const e=envios[b.id]||{};
          return (<Card key={b.id} style={{padding:16,background:"#FFF8E8",border:"1px solid #F0D080",marginBottom:12}}>
            <div style={{fontWeight:700,color:C.text,fontSize:14,marginBottom:6}}>🏦 {b.nome}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {["pdf","ofx"].map(tipo=>(
                <div key={tipo} style={{background:"#fff",borderRadius:8,padding:"10px 12px",border:`1px solid ${e[tipo+"_path"]?"#A8D5BB":"#E2DDD5"}`}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{tipo==="pdf"?"📄 PDF":"🏦 OFX"}</div>
                  {e[tipo+"_path"]?<div style={{marginBottom:6}}><FileChip name={e[tipo+"_name"]||tipo.toUpperCase()} path={e[tipo+"_path"]} modulo="extratos" color={C.green} bg="#E8F5ED" border="#A8D5BB"/></div>:<div style={{fontSize:12,color:C.muted,marginBottom:6}}>Não enviado</div>}
                  <input ref={el=>(tipo==="pdf"?pdfRefs:ofxRefs).current[b.id]=el} type="file" accept={tipo==="pdf"?".pdf":".ofx,.csv"} style={{display:"none"}} onChange={ev=>{if(ev.target.files[0])handleFile(b.id,tipo,ev.target.files[0]);}}/>
                  <BtnOut onClick={()=>(tipo==="pdf"?pdfRefs:ofxRefs).current[b.id]?.click()} sm>{e[tipo+"_path"]?"🔄 Trocar":"📎 Anexar"}</BtnOut>
                </div>
              ))}
            </div>
          </Card>);
        })}
      </div>)}
      {env.length>0&&(<div>
        <SecH text="Enviados" color={C.green}/>
        {env.map(b=>{
          const e=envios[b.id]||{};
          return (<Card key={b.id} style={{padding:16,background:"#E8F5ED",border:"1px solid #A8D5BB",marginBottom:12}}>
            <div style={{fontWeight:700,color:C.text,fontSize:14,marginBottom:6}}>✅ {b.nome}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {["pdf","ofx"].map(tipo=>(
                <div key={tipo} style={{background:"#fff",borderRadius:8,padding:"10px 12px",border:`1px solid ${e[tipo+"_path"]?"#A8D5BB":"#E2DDD5"}`}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>{tipo==="pdf"?"📄 PDF":"🏦 OFX"}</div>
                  {e[tipo+"_path"]?<FileChip name={e[tipo+"_name"]||tipo.toUpperCase()} path={e[tipo+"_path"]} modulo="extratos" color={C.green} bg="#E8F5ED" border="#A8D5BB"/>:<div style={{fontSize:12,color:C.muted}}>—</div>}
                  <div style={{marginTop:6}}>
                    <input ref={el=>(tipo==="pdf"?pdfRefs:ofxRefs).current[b.id]=el} type="file" accept={tipo==="pdf"?".pdf":".ofx,.csv"} style={{display:"none"}} onChange={ev=>{if(ev.target.files[0])handleFile(b.id,tipo,ev.target.files[0]);}}/>
                    <BtnOut onClick={()=>(tipo==="pdf"?pdfRefs:ofxRefs).current[b.id]?.click()} sm col={C.green}>🔄 Trocar</BtnOut>
                  </div>
                </div>
              ))}
            </div>
          </Card>);
        })}
      </div>)}
    </div>
  );
}

// ─── NOTAS FISCAIS ────────────────────────────────────────────────────────────
function NotasFiscaisTab({user,clients}){
  const[sel,setSel]=useState(user.role==="cliente"?user.id:(clients[0]?.id||""));
  const[mes,setMes]=useState(MES_DEF);
  const[notas,setNotas]=useState([]);
  const[loading,setLoading]=useState(false);
  const[comps,setComps]=useState([]);
  const notaRef=useRef();
  const[showNfse,setShowNfse]=useState(false);
  const[nfseForm,setNfseForm]=useState({tomador_nome:"",tomador_cnpj:"",tomador_email:"",servico_descricao:"",servico_valor:"",servico_codigo:"",servico_iss:""});
  const[nfseLoading,setNfseLoading]=useState(false);

  const clienteAtual=clients.find(c=>c.id===sel);

  async function emitirNfse(){
    if(!clienteAtual?.nfse_endpoint){ alert("Configure o webservice NFS-e no Cadastro desta empresa primeiro."); return; }
    if(!nfseForm.tomador_nome||!nfseForm.servico_valor){ alert("Preencha pelo menos o nome do tomador e o valor do serviço."); return; }
    setNfseLoading(true);
    try{
      const resp = await fetch("/.netlify/functions/emitir-nfse", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          endpoint: clienteAtual.nfse_endpoint,
          usuario: clienteAtual.nfse_usuario,
          senha: clienteAtual.nfse_senha,
          token: clienteAtual.nfse_token,
          prestador: { razao_social: clienteAtual.name, cnpj: clienteAtual.cnpj, insc_municipal: clienteAtual.insc_municipal },
          tomador: { nome: nfseForm.tomador_nome, cnpj: nfseForm.tomador_cnpj, email: nfseForm.tomador_email },
          servico: { descricao: nfseForm.servico_descricao, valor: parseFloat(nfseForm.servico_valor)||0, codigo: nfseForm.servico_codigo, iss: parseFloat(nfseForm.servico_iss)||0 },
          competencia: mes,
        })
      });
      const data = await resp.json();
      if(!resp.ok) throw new Error(data.error||"Erro ao emitir NFS-e");
      alert("NFS-e emitida com sucesso! Número: "+(data.numero||"—"));
      setShowNfse(false);
      setNfseForm({tomador_nome:"",tomador_cnpj:"",tomador_email:"",servico_descricao:"",servico_valor:"",servico_codigo:"",servico_iss:""});
    }catch(e){ alert("Erro: "+e.message); }
    setNfseLoading(false);
  }

  useEffect(()=>{
    if(!sel) return;
    fetchCompetencias(sel,"notas").then(c=>{setComps(c);if(c[0])setMes(c[0]);});
  },[sel]);

  useEffect(()=>{
    if(!sel||!mes) return;
    const load=()=>{ setLoading(true); fetchNotas(sel,mes).then(n=>{setNotas(n);setLoading(false);}); };
    load();
    const ch=subscribeNotas(sel,load);
    return ()=>supabase.removeChannel(ch);
  },[sel,mes]);

  async function addNota(files){
    if(!files||files.length===0) return;
    for(const file of Array.from(files)){
      try{
        const path = await uploadArquivo(sel,"notas",file);
        const nova = await insertNota(sel,mes,{nome:file.name,arquivo_path:path,data_emissao:TODAY,numero:""});
        setNotas(p=>[...p,nova]);
      }catch(e){
        console.error("Erro ao anexar nota:",e);
        alert("Erro ao anexar arquivo: "+e.message);
      }
    }
  }
  async function removeNota(id){ await deleteNota(id); setNotas(p=>p.filter(n=>n.id!==id)); }

  return (
    <div>
      <PgH title="Notas Fiscais" action={<div style={{display:"flex",gap:8,alignItems:"center"}}>
        {user.role==="contador"&&<div style={{width:130}}><CliSel clients={clients} value={sel} onChange={setSel}/></div>}
        {user.role==="contador"&&<button onClick={()=>setShowNfse(true)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#2563EB,#1D4ED8)",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>⚡ Emitir NFS-e</button>}
      </div>}/>
      {user.role==="contador"&&<CompetenciasPanel clientId={sel} modulo="notas" label="Competências — Notas Fiscais"/>}
      {comps.length>0
        ?<MesFilt value={mes} onChange={setMes} options={comps.map(id=>({id,label:mesIdLabel(id)}))}/>
        :<MesFilt value={mes} onChange={setMes}/>}
      {user.role==="contador"&&(<div style={{marginBottom:16}}>
        <input ref={notaRef} type="file" multiple accept=".pdf,.xml" style={{display:"none"}} onChange={e=>addNota(e.target.files)}/>
        <button onClick={()=>notaRef.current.click()} style={{width:"100%",padding:"14px",borderRadius:10,border:`2px dashed ${C.border}`,background:"transparent",cursor:"pointer",color:C.muted,fontSize:13}}>
          📎 Anexar notas fiscais de {mesIdLabel(mes)}
        </button>
      </div>)}
      {loading?<Spin/>:notas.length===0?<Empty icon="🧾" text="Nenhuma nota disponível."/>:(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{color:C.muted,fontSize:12,marginBottom:4}}>{notas.length} nota{notas.length>1?"s":""}</div>
          {notas.map(n=>(
            <Card key={n.id} style={{padding:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
                  <span style={{fontSize:22,flexShrink:0}}>🧾</span>
                  <div style={{minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:4}}>{n.nome}</div>
                    <FileChip name={n.nome} path={n.arquivo_path} modulo="notas"/>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexShrink:0,marginLeft:12}}>
                  <BtnView name={n.nome} path={n.arquivo_path} modulo="notas" sm/>
                  {user.role==="contador"&&<BtnGh onClick={()=>removeNota(n.id)} sm>Remover</BtnGh>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {showNfse&&(
        <ModalBox onClose={()=>setShowNfse(false)}>
          <div style={{marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:16,color:C.text,marginBottom:4}}>⚡ Emitir NFS-e</div>
            <div style={{fontSize:12,color:C.muted}}>Prestador: {clienteAtual?.name} — Competência: {mesIdLabel(mes)}</div>
            {!clienteAtual?.nfse_endpoint&&<div style={{background:"#FEF3C7",border:"1px solid #F59E0B",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#92400E",marginTop:8}}>⚠️ Webservice NFS-e não configurado. Acesse Cadastro → Editar para adicionar os dados.</div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{fontWeight:600,fontSize:12,color:C.muted,textTransform:"uppercase",letterSpacing:0.5}}>Tomador do Serviço</div>
            <div><FieldLabel text="Nome / Razão Social *"/><TxtIn value={nfseForm.tomador_nome} onChange={e=>setNfseForm({...nfseForm,tomador_nome:e.target.value})} placeholder="Nome do tomador"/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><FieldLabel text="CNPJ/CPF"/><TxtIn value={nfseForm.tomador_cnpj} onChange={e=>setNfseForm({...nfseForm,tomador_cnpj:e.target.value})} placeholder="00.000.000/0001-00"/></div>
              <div><FieldLabel text="E-mail"/><TxtIn value={nfseForm.tomador_email} onChange={e=>setNfseForm({...nfseForm,tomador_email:e.target.value})} placeholder="email@empresa.com"/></div>
            </div>
            <div style={{fontWeight:600,fontSize:12,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginTop:4}}>Serviço</div>
            <div><FieldLabel text="Descrição do Serviço *"/><TxtIn value={nfseForm.servico_descricao} onChange={e=>setNfseForm({...nfseForm,servico_descricao:e.target.value})} placeholder="Descrição dos serviços prestados"/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <div><FieldLabel text="Valor (R$) *"/><TxtIn value={nfseForm.servico_valor} onChange={e=>setNfseForm({...nfseForm,servico_valor:e.target.value})} placeholder="0,00"/></div>
              <div><FieldLabel text="Cód. Serviço"/><TxtIn value={nfseForm.servico_codigo} onChange={e=>setNfseForm({...nfseForm,servico_codigo:e.target.value})} placeholder="Ex: 17.19"/></div>
              <div><FieldLabel text="Alíquota ISS %"/><TxtIn value={nfseForm.servico_iss} onChange={e=>setNfseForm({...nfseForm,servico_iss:e.target.value})} placeholder="0,00"/></div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
            <BtnOut onClick={()=>setShowNfse(false)}>Cancelar</BtnOut>
            <button onClick={emitirNfse} disabled={nfseLoading} style={{padding:"10px 20px",borderRadius:8,border:"none",background:nfseLoading?"#ccc":"linear-gradient(135deg,#2563EB,#1D4ED8)",color:"#fff",fontSize:13,fontWeight:700,cursor:nfseLoading?"not-allowed":"pointer"}}>
              {nfseLoading?"⏳ Emitindo...":"⚡ Emitir NFS-e"}
            </button>
          </div>
        </ModalBox>
      )}
    </div>
  );
}

// ─── IMPOSTOS ─────────────────────────────────────────────────────────────────
function ImpostosTab({user,clients}){
  const[sel,setSel]=useState(user.role==="cliente"?user.id:(clients[0]?.id||""));
  const[comps,setComps]=useState([]);
  const[mes,setMes]=useState(MES_DEF);
  const[impCfg,setImpCfg]=useState([]);
  const[dados,setDados]=useState([]);
  const[avulsas,setAvulsas]=useState([]);
  const[ct,setCt]=useState(null);
  const[showCfg,setShowCfg]=useState(false);
  const[showAvul,setShowAvul]=useState(false);
  const[showNew,setShowNew]=useState(false);
  const[af,setAf]=useState({name:"",ref:"",venc:"",valor:""});
  const[newImp,setNewImp]=useState({name:"",venc_dia:"",ref:"Mensal"});
  const gRefs=useRef({});

  useEffect(()=>{ if(sel){ fetchImpCfg(sel).then(setImpCfg); fetchCompetencias(sel,"impostos").then(c=>{setComps(c);if(c[0])setMes(c[0]);}); } },[sel]);
  useEffect(()=>{
    if(!sel||!mes) return;
    const loadDados=()=>fetchImpDados(sel,mes).then(setDados);
    const loadAvul=()=>fetchAvulsas(sel,mes).then(setAvulsas);
    loadDados(); loadAvul();
    const ch1=subscribeImpDados(sel,mes,loadDados);
    const ch2=subscribeAvulsas(sel,mes,loadAvul);
    return ()=>{ supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  },[sel,mes]);

  const mesOpts=comps.map(id=>({id,label:mesIdLabel(id)}));
  const activeImps=impCfg.filter(x=>x.ativo);

  const allTaxes=[
    ...activeImps.map(imp=>{
      const d=dados.find(x=>x.imp_id===imp.imp_id||x.imp_id===imp.id)||{};
      return{id:imp.id,imp_id:imp.imp_id||imp.id,name:imp.name,ref:imp.ref,venc_dia:imp.venc_dia,
        venc:d.venc||"",valor:d.valor||"—",status:d.status||"pendente",
        pago_cliente:d.pago_cliente||false,guia_path:d.guia_path||null,origem:"rec"};
    }),
    ...avulsas.map(t=>({...t,origem:"avul"})),
  ].map(t=>({...t,status:t.status!=="pago"&&isVencido(t.venc,t.status)?"vencido":t.status}));

  const grps=[
    {key:"vencido",label:"Vencidas",color:C.red,items:allTaxes.filter(t=>t.status==="vencido"&&!t.pago_cliente)},
    {key:"aguard",label:"Aguardando Confirmação",color:C.amber,items:allTaxes.filter(t=>t.status!=="pago"&&t.pago_cliente)},
    {key:"pend",label:"Pendentes",color:C.amber,items:allTaxes.filter(t=>t.status==="pendente"&&!t.pago_cliente)},
    {key:"pago",label:"Pagas",color:C.green,items:allTaxes.filter(t=>t.status==="pago")},
  ];

  async function setSt(tax,st,pc){
    if(tax.origem==="rec"){ await upsertImpDado(sel,mes,tax.imp_id,{status:st,pago_cliente:pc,venc:tax.venc,valor:tax.valor}); }
    else { await updateAvulsa(tax.id,{status:st,pago_cliente:pc}); }
    if(tax.origem==="rec") fetchImpDados(sel,mes).then(setDados);
    else fetchAvulsas(sel,mes).then(setAvulsas);
  }
  async function setG(tax,file){
    const path = await uploadArquivo(sel,"guias",file);
    if(tax.origem==="rec") await upsertImpDado(sel,mes,tax.imp_id,{guia_path:path,status:tax.status,pago_cliente:tax.pago_cliente,venc:tax.venc,valor:tax.valor});
    else await updateAvulsa(tax.id,{guia_path:path});
    if(tax.origem==="rec") fetchImpDados(sel,mes).then(setDados);
    else fetchAvulsas(sel,mes).then(setAvulsas);
  }
  async function addAvulsa(){ if(!af.name) return; await insertAvulsa(sel,mes,{...af,status:"pendente",pago_cliente:false}); fetchAvulsas(sel,mes).then(setAvulsas); setAf({name:"",ref:"",venc:"",valor:""}); setShowAvul(false); }
  async function addImposto(){ if(!newImp.name) return; const novo=await upsertImpCfg(sel,{name:newImp.name,venc_dia:Number(newImp.venc_dia)||20,ref:newImp.ref,ativo:true}); setImpCfg(p=>[...p,novo]); setNewImp({name:"",venc_dia:"",ref:"Mensal"}); setShowNew(false); }
  async function toggleImp(id){ const imp=impCfg.find(x=>x.id===id); await upsertImpCfg(sel,{...imp,ativo:!imp.ativo}); setImpCfg(p=>p.map(x=>x.id===id?{...x,ativo:!x.ativo}:x)); }
  async function removeImp(id){ await deleteImpCfg(id); setImpCfg(p=>p.filter(x=>x.id!==id)); }

  return (
    <div>
      {ct&&<ModalBox onClose={()=>setCt(null)}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:12}}>{user.role==="cliente"?"✅":"🧾"}</div>
          <h3 style={{color:C.text,fontSize:17,margin:"0 0 6px"}}>{user.role==="cliente"?"Confirmar Pagamento":"Confirmar Recebimento"}</h3>
          <p style={{color:C.muted,fontSize:14,margin:"0 0 4px"}}>{ct.name}</p>
          <p style={{color:C.gold,fontWeight:700,fontSize:18,margin:"0 0 16px"}}>{ct.valor}</p>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            {user.role==="cliente"?<BtnPri onClick={()=>{setSt(ct,ct.status,true);setCt(null);}}>Sim, paguei</BtnPri>
              :<BtnGr onClick={()=>{setSt(ct,"pago",false);setCt(null);}}>Confirmar</BtnGr>}
            <BtnGh onClick={()=>setCt(null)}>Cancelar</BtnGh>
          </div>
        </div>
      </ModalBox>}

      {showCfg&&<ModalBox onClose={()=>setShowCfg(false)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{color:C.text,margin:0,fontSize:16,fontWeight:700}}>Impostos Recorrentes</h3>
          <BtnOut onClick={()=>setShowNew(true)} sm>+ Criar novo</BtnOut>
        </div>
        {showNew&&(<div style={{background:"#FDF5E0",borderRadius:10,padding:16,marginBottom:14,border:"1px solid #F0D080"}}>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div><FieldLabel text="Nome"/><TxtIn value={newImp.name} onChange={e=>setNewImp({...newImp,name:e.target.value})} placeholder="Ex: ISS Municipal"/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><FieldLabel text="Dia vencimento"/><TxtIn value={newImp.venc_dia} onChange={e=>setNewImp({...newImp,venc_dia:e.target.value})} type="number"/></div>
              <div><FieldLabel text="Periodicidade"/><SelIn value={newImp.ref} onChange={e=>setNewImp({...newImp,ref:e.target.value})}><option>Mensal</option><option>Trimestral</option><option>Semestral</option><option>Anual</option></SelIn></div>
            </div>
            <div style={{display:"flex",gap:8}}><BtnPri onClick={addImposto}>Adicionar</BtnPri><BtnGh onClick={()=>setShowNew(false)}>Cancelar</BtnGh></div>
          </div>
        </div>)}
        <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:360,overflowY:"auto"}}>
          {impCfg.map(imp=>(<div key={imp.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:10,background:imp.ativo?"#FDF5E0":C.surfaceAlt,border:`1.5px solid ${imp.ativo?C.gold:C.border}`}}>
            <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${imp.ativo?C.gold:C.border}`,background:imp.ativo?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} onClick={()=>toggleImp(imp.id)}>
              {imp.ativo&&<span style={{color:"#fff",fontSize:12,fontWeight:900}}>✓</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{color:C.text,fontSize:13,fontWeight:imp.ativo?600:400}}>{imp.name}</div>
              <div style={{color:C.muted,fontSize:11}}>Vence dia {imp.venc_dia} · {imp.ref}</div>
            </div>
            <BtnRed onClick={()=>removeImp(imp.id)} sm>🗑</BtnRed>
          </div>))}
          {impCfg.length===0&&<p style={{color:C.muted,textAlign:"center",padding:"20px 0",fontSize:13}}>Nenhum imposto. Clique "Criar novo".</p>}
        </div>
        <div style={{marginTop:20,display:"flex",justifyContent:"flex-end"}}><BtnPri onClick={()=>setShowCfg(false)}>Fechar</BtnPri></div>
      </ModalBox>}

      <PgH title="Impostos" action={user.role==="contador"&&<div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{width:140}}><CliSel clients={clients} value={sel} onChange={setSel}/></div>
        <BtnOut onClick={()=>setShowCfg(true)} sm>⚙ Gerenciar</BtnOut>
        <BtnOut onClick={()=>setShowAvul(!showAvul)} sm>+ Guia</BtnOut>
      </div>}/>

      {showAvul&&<FCard title="Guia Avulsa" onSave={addAvulsa} onCancel={()=>setShowAvul(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><FieldLabel text="Descrição"/><TxtIn value={af.name} onChange={e=>setAf({...af,name:e.target.value})}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><FieldLabel text="Ref."/><TxtIn value={af.ref} onChange={e=>setAf({...af,ref:e.target.value})}/></div>
            <div><FieldLabel text="Vencimento"/><TxtIn type="date" value={af.venc} onChange={e=>setAf({...af,venc:e.target.value})}/></div>
            <div><FieldLabel text="Valor"/><TxtIn value={af.valor} onChange={e=>setAf({...af,valor:e.target.value})} placeholder="R$ 0,00"/></div>
          </div>
        </div>
      </FCard>}

      {user.role==="contador"&&<CompetenciasPanel clientId={sel} modulo="impostos" label="Competências — Impostos"/>}
      {mesOpts.length>0&&<MesFilt value={mes} onChange={setMes} options={mesOpts}/>}

      {allTaxes.length===0?<Empty icon="🧾" text="Nenhum imposto configurado."/>
        :grps.map(g=>g.items.length===0?null:(
          <div key={g.key} style={{marginBottom:20}}>
            <SecH text={`${g.label} (${g.items.length})`} color={g.color}/>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {g.items.map(tax=>{
                const si=getSI(tax); const gk=tax.id;
                return (<Card key={gk} style={{padding:16,background:si.bg,border:`1px solid ${si.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:2}}>{tax.name}</div>
                      <div style={{fontSize:12,color:C.muted,marginBottom:6}}>{tax.ref}{tax.venc&&<span style={{color:g.key==="vencido"?C.red:C.muted}}> · Venc. {tax.venc}</span>}</div>
                      <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>{tax.valor}</div>
                      <input ref={el=>gRefs.current[gk]=el} type="file" accept=".pdf" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setG(tax,e.target.files[0]);}}/>
                      {tax.guia_path
                        ?<FileChip name="Guia.pdf" path={tax.guia_path} modulo="guias" color={C.gold} bg="rgba(255,255,255,0.6)" border={C.gold+"55"}/>
                        :user.role==="contador"&&<button onClick={()=>gRefs.current[gk]?.click()} style={{color:C.muted,fontSize:12,background:"rgba(255,255,255,0.6)",border:`1px dashed ${C.borderDark}`,borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>📎 Anexar guia PDF</button>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                      <Pill label={si.label} color={si.color} bg={si.bg} border={si.border}/>
                      {user.role==="cliente"&&tax.status!=="pago"&&!tax.pago_cliente&&<BtnGr onClick={()=>setCt(tax)} sm>✓ Paguei</BtnGr>}
                      {user.role==="cliente"&&tax.pago_cliente&&<BtnGh onClick={()=>setSt(tax,tax.status,false)} sm>Cancelar</BtnGh>}
                      {user.role==="contador"&&tax.pago_cliente&&<div style={{display:"flex",gap:6}}><BtnGr onClick={()=>setCt(tax)} sm>✓ Confirmar</BtnGr><BtnRed onClick={()=>setSt(tax,"pendente",false)} sm>↩</BtnRed></div>}
                      {user.role==="contador"&&tax.status!=="pago"&&!tax.pago_cliente&&<BtnOut onClick={()=>setSt(tax,"pago",false)} sm>Marcar pago</BtnOut>}
                      {user.role==="contador"&&tax.status==="pago"&&<BtnGh onClick={()=>setSt(tax,"pendente",false)} sm>↩ Reativar</BtnGh>}
                    </div>
                  </div>
                </Card>);
              })}
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ─── RESUMO ───────────────────────────────────────────────────────────────────
function ResumoTab({user,clients}){
  const[sel,setSel]=useState(user.role==="cliente"?user.id:(clients[0]?.id||""));
  const[comps,setComps]=useState([]);
  const[mes,setMes]=useState(MES_DEF);
  const[s,setS]=useState(null);
  const[editando,setEditando]=useState(false);
  const[ef,setEf]=useState(null);
  const reciboRef=useRef();

  useEffect(()=>{ if(sel) fetchCompetencias(sel,"resumo").then(c=>{setComps(c);if(c[0])setMes(c[0]);}); },[sel]);
  useEffect(()=>{
    if(!sel||!mes) return;
    const load=()=>fetchResumo(sel,mes).then(setS);
    load();
    const ch=subscribeResumo(sel,load);
    return ()=>supabase.removeChannel(ch);
  },[sel,mes]);

  async function save(){ await upsertResumo(sel,mes,ef); setS(ef); setEditando(false); }
  async function setRecibo(file){ const path=await uploadArquivo(sel,"resumos",file); await upsertResumo(sel,mes,{...s,recibo_path:path}); setS(p=>({...p,recibo_path:path})); }

  const mesOpts=comps.map(id=>({id,label:mesIdLabel(id)}));
  const cards=[
    {key:"fat_mes",label:"Faturamento do mês",icon:"📈",color:C.gold,bg:"#FDF5E0",border:"#F0D080"},
    {key:"fat_ano",label:"Fat. acumulado do ano",icon:"📊",color:C.blue,bg:"#EAF2FB",border:"#A8C8E8"},
    {key:"pro_labore",label:"Pró-labore do mês",icon:"👤",color:C.purple,bg:"#F3EEF8",border:"#C8A8E8"},
    {key:"impostos",label:"Impostos totais do mês",icon:"🧾",color:C.amber,bg:"#FFF3DC",border:"#F0C060"},
  ];

  return (
    <div>
      <PgH title="Resumo" action={<div style={{display:"flex",gap:8,alignItems:"center"}}>
        {user.role==="contador"&&<div style={{width:160}}><CliSel clients={clients} value={sel} onChange={setSel}/></div>}
        {user.role==="contador"&&!editando&&s&&<BtnOut onClick={()=>{setEf({...s});setEditando(true);}} sm>✏️ Editar</BtnOut>}
      </div>}/>
      {user.role==="contador"&&<CompetenciasPanel clientId={sel} modulo="resumo" label="Competências — Resumo"/>}
      {mesOpts.length>0&&<MesFilt value={mes} onChange={setMes} options={mesOpts}/>}
      {!s?<Empty icon="📊" text={`Sem dados para ${mesIdLabel(mes)}.`}/>
        :editando&&user.role==="contador"?(
          <Card style={{padding:20}}>
            <h3 style={{color:C.gold,margin:"0 0 16px",fontSize:14,fontWeight:700}}>Editar — {mesIdLabel(mes)}</h3>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {cards.map(c=><div key={c.key}><FieldLabel text={c.label}/><TxtIn value={ef[c.key]||""} onChange={e=>setEf({...ef,[c.key]:e.target.value})} placeholder="R$ 0,00"/></div>)}
            </div>
            <div style={{display:"flex",gap:10,marginTop:20}}><BtnPri onClick={save}>Salvar</BtnPri><BtnGh onClick={()=>setEditando(false)}>Cancelar</BtnGh></div>
          </Card>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {cards.map(c=>(
              <Card key={c.key} style={{padding:20,background:c.bg,border:`1px solid ${c.border}`}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{flex:1}}>
                    <div style={{color:C.muted,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{c.label}</div>
                    <div style={{color:c.color,fontWeight:800,fontSize:22,marginBottom:c.key==="pro_labore"?10:0}}>{s[c.key]||"—"}</div>
                    {c.key==="pro_labore"&&(
                      <div>
                        {s.recibo_path
                          ?<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                            <FileChip name="Recibo Pró-labore.pdf" path={s.recibo_path} modulo="resumos"/>
                            {user.role==="contador"&&(<><input ref={reciboRef} type="file" accept=".pdf" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setRecibo(e.target.files[0]);}}/><button onClick={()=>reciboRef.current.click()} style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted,fontSize:11,textDecoration:"underline"}}>trocar</button></>)}
                          </div>
                          :user.role==="contador"&&(<><input ref={reciboRef} type="file" accept=".pdf" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setRecibo(e.target.files[0]);}}/><button onClick={()=>reciboRef.current.click()} style={{display:"inline-flex",alignItems:"center",gap:5,color:C.muted,fontSize:12,background:"rgba(255,255,255,0.7)",border:`1px dashed ${C.borderDark}`,borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>📎 Anexar recibo PDF</button></>)
                        }
                      </div>
                    )}
                  </div>
                  <div style={{fontSize:32,flexShrink:0,marginLeft:12}}>{c.icon}</div>
                </div>
              </Card>
            ))}
          </div>
        )
      }
    </div>
  );
}

// ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
function RelatoriosTab({user,clients}){
  const[sel,setSel]=useState(user.role==="cliente"?user.id:(clients[0]?.id||""));
  const[anos,setAnos]=useState([]);
  const[ano,setAno]=useState("");
  const[rels,setRels]=useState([]);
  const fRefs=useRef({});

  useEffect(()=>{ if(sel) fetchAnosRel(sel).then(a=>{setAnos(a);if(a[0])setAno(a[0]);}); },[sel]);
  useEffect(()=>{
    if(!sel||!ano) return;
    const load=()=>fetchRelatorios(sel,ano).then(setRels);
    load();
    const ch=subscribeRelatorios(sel,load);
    return ()=>supabase.removeChannel(ch);
  },[sel,ano]);

  async function addAno(v){ if(!v||anos.includes(v)) return; await addAnoRel(sel,v); setAnos(p=>[v,...p].sort((a,b)=>b.localeCompare(a))); setAno(v); }
  async function removeAno(v){ await removeAnoRel(sel,v); setAnos(p=>p.filter(x=>x!==v)); if(ano===v&&anos[0]!==v) setAno(anos[1]||""); }

  async function toggle(tipo){ const r=rels.find(x=>x.tipo===tipo)||{}; const st=r.status==="disponivel"?"nao_liberado":"disponivel"; await upsertRelatorio(sel,ano,tipo,{status:st,arquivo_path:r.arquivo_path||null}); fetchRelatorios(sel,ano).then(setRels); }
  async function setArq(tipo,file){ const path=await uploadArquivo(sel,"relatorios",file); await upsertRelatorio(sel,ano,tipo,{arquivo_path:path,status:"disponivel"}); fetchRelatorios(sel,ano).then(setRels); }
  async function remArq(tipo){ await upsertRelatorio(sel,ano,tipo,{arquivo_path:null,status:"nao_liberado"}); fetchRelatorios(sel,ano).then(setRels); }

  const tipos=[{id:"balanco",label:"Balanço Patrimonial",icon:"📊"},{id:"dre",label:"DRE: Demonstração do Resultado",icon:"📈"},{id:"informe",label:"Informe de Rendimentos",icon:"📋"}];

  return (
    <div>
      <PgH title="Relatórios Contábeis" action={user.role==="contador"&&<div style={{width:160}}><CliSel clients={clients} value={sel} onChange={setSel}/></div>}/>
      {user.role==="contador"&&(
        <Card style={{padding:16,marginBottom:20,background:"#FDF5E0",border:"1px solid #F0D080"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:12,fontWeight:600,color:C.textSub}}>📅 Anos disponíveis</span>
            <BtnOut onClick={()=>{const v=prompt("Ano (YYYY):"); if(v) addAno(v);}} sm>+ Adicionar</BtnOut>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {anos.map(a=>(<div key={a} style={{display:"flex",alignItems:"center",gap:4,background:"#fff",borderRadius:20,padding:"4px 10px 4px 12px",border:"1px solid #F0D080"}}>
              <span style={{fontSize:12,color:C.textSub,fontWeight:500}}>{a}</span>
              <button onClick={()=>removeAno(a)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.red,fontSize:14,lineHeight:1,padding:"0 2px"}}>×</button>
            </div>))}
          </div>
        </Card>
      )}
      {anos.length>0&&(<div style={{display:"flex",gap:6,marginBottom:20}}>{anos.map(a=>(<button key={a} onClick={()=>setAno(a)} style={{padding:"6px 18px",borderRadius:20,border:`1.5px solid ${ano===a?C.gold:C.border}`,background:ano===a?C.gold:"transparent",color:ano===a?"#fff":C.muted,fontSize:13,fontWeight:600,cursor:"pointer"}}>{a}</button>))}</div>)}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {tipos.map(tp=>{
          const rel=rels.find(x=>x.tipo===tp.id)||{status:"nao_liberado",arquivo_path:null};
          const ok=rel.status==="disponivel";
          return (<Card key={tp.id} style={{padding:18}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
              <div style={{fontSize:28,flexShrink:0,marginTop:2}}>{tp.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:6}}>{tp.label} ({ano})</div>
                <div style={{marginBottom:8}}>{ok?<Pill label="✓ Disponível" color={C.green} bg="#E8F5ED" border="#A8D5BB"/>:<Pill label="Não liberado" color={C.muted} bg={C.surfaceAlt} border={C.border}/>}</div>
                {rel.arquivo_path&&<div style={{marginBottom:8}}><FileChip name={tp.label+".pdf"} path={rel.arquivo_path} modulo="relatorios"/></div>}
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {user.role==="cliente"&&ok&&rel.arquivo_path&&<BtnView name={tp.label+".pdf"} path={rel.arquivo_path} modulo="relatorios" sm/>}
                  {user.role==="contador"&&(<>
                    <input ref={el=>fRefs.current[tp.id]=el} type="file" accept=".pdf,.xlsx" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setArq(tp.id,e.target.files[0]);}}/>
                    <BtnOut onClick={()=>fRefs.current[tp.id]?.click()} sm>📎 {rel.arquivo_path?"Substituir":"Anexar"}</BtnOut>
                    <button onClick={()=>toggle(tp.id)} style={{padding:"6px 12px",borderRadius:8,border:`1.5px solid ${ok?C.red:C.green}`,background:ok?"#FDE8E8":"#E8F5ED",color:ok?C.red:C.green,fontSize:11,fontWeight:600,cursor:"pointer"}}>{ok?"🔒 Bloquear":"✓ Liberar"}</button>
                    {rel.arquivo_path&&<BtnGh onClick={()=>remArq(tp.id)} sm>Remover</BtnGh>}
                  </>)}
                </div>
              </div>
            </div>
          </Card>);
        })}
      </div>
    </div>
  );
}

// ─── CHAT (REALTIME) ──────────────────────────────────────────────────────────
function ChatTab({user,clients,onNewMessage}){
  const[sel,setSel]=useState(user.role==="cliente"?user.id:(clients[0]?.id||""));
  const[msgs,setMsgs]=useState([]);
  const[msg,setMsg]=useState("");
  const[pf,setPf]=useState([]);
  const botRef=useRef(); const fileRef=useRef();

  useEffect(()=>{
    if(!sel) return;
    fetchMessages(sel).then(setMsgs);
    const ch=subscribeChat(sel,m=>{
      setMsgs(p=>[...p,m]);
      if(onNewMessage) onNewMessage();
    });
    return ()=>supabase.removeChannel(ch);
  },[sel]);

  useEffect(()=>{ botRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  async function send(){
    if(!msg.trim()&&pf.length===0) return;
    await sendMessage(sel,user.role==="contador"?"contador":"cliente",msg.trim(),pf);
    setMsg(""); setPf([]);
  }

  return (
    <div style={{display:"flex",flexDirection:"column",height:"70vh"}}>
      <PgH title="Chat" action={user.role==="contador"&&<div style={{width:160}}><CliSel clients={clients} value={sel} onChange={v=>{setSel(v);setMsgs([]);}}/></div>}/>
      <div style={{flex:1,overflowY:"auto",background:C.surfaceAlt,borderRadius:12,padding:16,marginBottom:12,display:"flex",flexDirection:"column",gap:10}}>
        {msgs.length===0&&<p style={{color:C.muted,textAlign:"center",margin:"auto",fontSize:13}}>Nenhuma mensagem.</p>}
        {msgs.map(m=>{
          const me=(user.role==="contador"&&m.from_role==="contador")||(user.role==="cliente"&&m.from_role==="cliente");
          return (<div key={m.id} style={{display:"flex",justifyContent:me?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"78%",background:me?`linear-gradient(135deg,${C.goldLight},${C.goldDark})`:"#fff",borderRadius:me?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px",boxShadow:C.shadow,border:me?"none":`1px solid ${C.border}`}}>
              {!me&&<div style={{color:C.gold,fontSize:10,fontWeight:700,marginBottom:4,textTransform:"uppercase"}}>{m.from_role==="contador"?"YF Contabilidade":(clients.find(c=>c.id===sel)?.name||"Cliente")}</div>}
              {m.text&&<p style={{color:me?"#fff":C.text,fontSize:14,margin:0,lineHeight:1.5}}>{m.text}</p>}
              {m.files&&m.files.length>0&&<div style={{marginTop:m.text?8:0,display:"flex",flexDirection:"column",gap:4}}>
                {m.files.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.25)",borderRadius:6,padding:"4px 8px"}}><span>📎</span><span style={{color:me?"#fff":C.gold,fontSize:12,fontWeight:600}}>{f}</span></div>)}
              </div>}
              <div style={{color:me?"rgba(255,255,255,0.7)":C.muted,fontSize:10,textAlign:"right",marginTop:4}}>
                {new Date(m.created_at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}
              </div>
            </div>
          </div>);
        })}
        <div ref={botRef}/>
      </div>
      {pf.length>0&&<div style={{background:"#FDF5E0",borderRadius:8,padding:"8px 12px",marginBottom:8,border:"1px solid #F0D080"}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {pf.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4,background:"#fff",borderRadius:6,padding:"3px 8px",border:`1px solid ${C.border}`}}>
            <span style={{fontSize:12}}>📎</span><span style={{color:C.textSub,fontSize:12}}>{f}</span>
            <button onClick={()=>setPf(p=>p.filter((_,j)=>j!==i))} style={{color:C.red,background:"transparent",border:"none",cursor:"pointer",fontSize:14,lineHeight:1,marginLeft:2}}>×</button>
          </div>)}
        </div>
      </div>}
      <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
        <input ref={fileRef} type="file" multiple style={{display:"none"}} onChange={e=>setPf(p=>[...p,...Array.from(e.target.files).map(f=>f.name)])}/>
        <button onClick={()=>fileRef.current.click()} style={{width:42,height:42,borderRadius:10,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>📎</button>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Digite uma mensagem..."
          style={{flex:1,padding:"11px 14px",borderRadius:10,border:`1px solid ${C.border}`,background:"#fff",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
        <button onClick={send} style={{width:42,height:42,borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.goldLight},${C.goldDark})`,color:"#fff",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>➤</button>
      </div>
    </div>
  );
}

// ─── PUSH ─────────────────────────────────────────────────────────────────────
function PushTab({clients,user,sendLocalNotification}){
  const[notifs,setNotifs]=useState([]);
  const[show,setShow]=useState(false);
  const[form,setForm]=useState({dest:"todos",clientId:clients[0]?.id||"",type:"geral",msg:""});

  useEffect(()=>{
    fetchNotificacoes().then(setNotifs);
    // realtime para novas notificações
    const ch=supabase.channel("notif_push")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"notificacoes"},p=>setNotifs(prev=>[p.new,...prev]))
      .subscribe();
    return ()=>supabase.removeChannel(ch);
  },[]);

  async function sendN(){
    if(!form.msg.trim()) return;
    const ids=form.dest==="todos"?clients.map(c=>c.id):[form.clientId];
    const nm=form.dest==="todos"?"Todos os clientes":clients.find(c=>c.id===form.clientId)?.name||"Cliente";
    const nova=await insertNotificacao({client_ids:ids,client_name:nm,type:form.type,msg:form.msg.trim(),date:TODAY,read:false});
    setNotifs(p=>[nova,...p]);
    // Enviar push nativo para os clientes
    ids.forEach(id => sendPushNotification(id, "YF Contabilidade — "+nm, form.msg.trim()));
    setForm({dest:"todos",clientId:clients[0]?.id||"",type:"geral",msg:""});setShow(false);
  }
  async function markRead(id){ await markNotifRead(id); setNotifs(p=>p.map(x=>x.id===id?{...x,read:true}:x)); }
  async function deleteNotif(id,e){
    e.stopPropagation();
    await supabase.from("notificacoes").delete().eq("id",id);
    setNotifs(p=>p.filter(x=>x.id!==id));
  }
  async function deleteAllRead(){
    if(!window.confirm("Excluir todas as notificações lidas?")) return;
    await supabase.from("notificacoes").delete().eq("read",true);
    setNotifs(p=>p.filter(x=>!x.read));
  }

  const unread=notifs.filter(n=>!n.read).length;
  const ico=t=>({documento:"📄",imposto:"🧾",chat:"💬",banco:"🏦"}[t]||"🔔");

  return (
    <div>
      <PgH title={<span>Push {unread>0&&<span style={{background:C.gold,color:"#fff",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700,marginLeft:6}}>{unread}</span>}</span>}
        action={<div style={{display:"flex",gap:8}}>
          {notifs.some(n=>n.read)&&<BtnRed onClick={deleteAllRead} sm>🗑 Limpar lidas</BtnRed>}
          <BtnOut onClick={()=>setShow(!show)}>+ Enviar</BtnOut>
        </div>}/>
      {show&&<FCard title="Nova Notificação" onSave={sendN} onCancel={()=>setShow(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><FieldLabel text="Destinatário"/>
            <div style={{display:"flex",gap:8}}>
              {[["todos","📢 Todos"],["especifico","👤 Específico"]].map(([v,l])=>(
                <button key={v} onClick={()=>setForm({...form,dest:v})}
                  style={{flex:1,padding:"10px",borderRadius:8,border:`1.5px solid ${form.dest===v?C.gold:C.border}`,background:form.dest===v?"#FDF5E0":"transparent",color:form.dest===v?C.gold:C.muted,fontSize:13,cursor:"pointer",fontWeight:form.dest===v?600:400}}>{l}</button>
              ))}
            </div>
          </div>
          {form.dest==="especifico"&&<div><FieldLabel text="Cliente"/><CliSel clients={clients} value={form.clientId} onChange={id=>setForm({...form,clientId:id})}/></div>}
          <div><FieldLabel text="Tipo"/><SelIn value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="geral">🔔 Geral</option><option value="documento">📄 Documento</option><option value="imposto">🧾 Imposto</option><option value="banco">🏦 Banco</option></SelIn></div>
          <div><FieldLabel text="Mensagem"/><TxtIn value={form.msg} onChange={e=>setForm({...form,msg:e.target.value})} placeholder="Digite a mensagem..."/></div>
        </div>
      </FCard>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {notifs.map(n=>(
          <Card key={n.id} onClick={()=>markRead(n.id)}
            style={{padding:16,cursor:"pointer",background:n.read?C.surface:"#FDF5E0",border:`1px solid ${n.read?C.border:"#F0D080"}`}}>
            <div style={{display:"flex",gap:12}}>
              <span style={{fontSize:22,flexShrink:0}}>{ico(n.type)}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{color:C.gold,fontSize:13,fontWeight:700}}>{n.client_name}</span>
                </div>
                <div style={{color:C.text,fontSize:13}}>{n.msg}</div>
                <div style={{color:C.muted,fontSize:11,marginTop:4}}>{n.date}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"center",flexShrink:0}}>
                {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:C.gold}}/>}
                <button onClick={e=>deleteNotif(n.id,e)}
                  style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted,fontSize:16,lineHeight:1,padding:"2px 4px",opacity:0.6}}
                  title="Excluir">🗑</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
function ChangePwModal({current,onSave,onClose}){
  const[cur,setCur]=useState(""); const[nw,setNw]=useState(""); const[nw2,setNw2]=useState(""); const[err,setErr]=useState("");
  function save(){ if(cur!==current){setErr("Senha atual incorreta.");return;} if(nw.length<6){setErr("Mínimo 6 caracteres.");return;} if(nw!==nw2){setErr("Senhas não coincidem.");return;} onSave(nw); }
  return (<div>
    <h3 style={{color:"#1A1A1A",fontSize:16,fontWeight:700,margin:"0 0 16px"}}>🔑 Alterar Senha</h3>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {[["Senha atual",cur,setCur],["Nova senha",nw,setNw],["Confirmar",nw2,setNw2]].map(([l,v,s])=>(
        <div key={l}><FieldLabel text={l}/><input type="password" value={v} onChange={e=>s(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:"#fff",color:"#1A1A1A",fontSize:14,outline:"none",boxSizing:"border-box"}}/></div>
      ))}
      {err&&<p style={{color:C.red,fontSize:12,margin:0,background:"#FDE8E8",padding:"8px 12px",borderRadius:8}}>{err}</p>}
      <div style={{display:"flex",gap:10}}><BtnPri onClick={save}>Salvar</BtnPri><BtnGh onClick={onClose}>Cancelar</BtnGh></div>
    </div>
  </div>);
}

// Fix iOS scroll/zoom
const globalStyle = `
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
  html { height: 100%; }
  body { height: 100%; margin: 0; overscroll-behavior: none; }
  #root { height: 100%; display: flex; flex-direction: column; }
  input, textarea, select { font-size: 16px !important; }
`;

export default function App(){
  const[user,setUser]=useState(null);
  const[activeTab,setActiveTab]=useState("clientes");
  const activeTabRef=useRef("clientes");
  const[unreadChat,setUnreadChat]=useState(0);
  const[clients,setClients]=useState([]);
  const[loading,setLoading]=useState(false);
  const[showChangePw,setShowChangePw]=useState(false);
  const[contadorPw,setContadorPw]=useState(()=>localStorage.getItem("yfcont_contadorPw")||"Yf@953701");
  const{ needsUpdate, applyUpdate, enablePush, sendLocalNotification } = usePWA();

  // Auto-login ao recarregar pagina se tiver credenciais salvas
  useEffect(()=>{
    const saved = (() => { try{ return JSON.parse(localStorage.getItem("yfcont_savedCreds")||"null"); }catch(e){return null;} })();
    if(!saved) return;
    (async()=>{
      try{
        if(saved.role==="contador"){
          const pw = localStorage.getItem("yfcont_contadorPw")||"Yf@953701";
          if(saved.pw===pw) { setUser({role:"contador",name:"YF Contabilidade"}); setActiveTab("clientes"); }
        } else {
          const c = await loginCliente(saved.email, saved.pw);
          if(c) { setUser({role:"cliente",...c}); setActiveTab("cadastro"); }
        }
      }catch(e){ localStorage.removeItem("yfcont_savedCreds"); }
    })();
  },[]);

  useEffect(()=>{ if(user) fetchClients().then(setClients); },[user]);

  useEffect(()=>{ activeTabRef.current=activeTab; },[activeTab]);

  // Badge de chat: detectar novas mensagens quando cliente NAO esta na aba chat
  useEffect(()=>{
    if(!user) return;
    const ch=supabase.channel("badge-chat-"+user.id+"-"+user.role)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"chat_messages"},(payload)=>{
        if(activeTabRef.current==="chat") return;
        if(user.role==="cliente" && payload.new?.from_role==="contador" && payload.new?.client_id===user.id){
          setUnreadChat(p=>p+1);
        }
        if(user.role==="contador" && payload.new?.from_role==="cliente"){
          setUnreadChat(p=>p+1);
        }
      }).subscribe();
    return ()=>supabase.removeChannel(ch);
  },[user]);

  async function handleLogin(u){
    setUser(u);
    setActiveTab(u.role==="contador"?"clientes":"cadastro");
    // Registrar push subscription após login
    if(u.role === "cliente" && u.id){
      setTimeout(()=>subscribePush(u.id), 2000);
    } else if(u.role === "contador"){
      if("Notification" in window && Notification.permission === "default"){
        setTimeout(()=>enablePush(), 2000);
      }
    }
  }

  if(!user) return <LoginScreen onLogin={handleLogin} contadorPw={contadorPw}/>;

  const ac=clients.filter(c=>c.status!=="inativo");
  const tabs=user.role==="contador"
    ?[{id:"clientes",l:"Empresas",i:"👥"},{id:"cadastro",l:"Cadastro",i:"🏢"},{id:"bancos",l:"Bancos",i:"🏦"},{id:"extratos",l:"Extratos",i:"📁"},{id:"notas",l:"Notas",i:"🧾"},{id:"impostos",l:"Impostos",i:"💰"},{id:"resumo",l:"Resumo",i:"📊"},{id:"relatorios",l:"Relatórios",i:"📋"},{id:"chat",l:"Chat",i:"💬",badge:unreadChat},{id:"push",l:"Push",i:"🔔"}]
    :[{id:"cadastro",l:"Cadastro",i:"🏢"},{id:"extratos",l:"Extratos",i:"📁"},{id:"notas",l:"Notas",i:"🧾"},{id:"impostos",l:"Impostos",i:"💰"},{id:"resumo",l:"Resumo",i:"📊"},{id:"relatorios",l:"Relatórios",i:"📋"},{id:"chat",l:"Chat",i:"💬",badge:unreadChat}];

  return (
    <FileViewerProvider>
      <style>{globalStyle}</style>
      <div style={{height:"100%",minHeight:"100vh",display:"flex",flexDirection:"column",background:C.bg,fontFamily:"system-ui,-apple-system,sans-serif"}}>
        {needsUpdate&&<UpdateBanner onUpdate={applyUpdate}/>}
        {showChangePw&&<ModalBox onClose={()=>setShowChangePw(false)}><ChangePwModal current={contadorPw} onSave={pw=>{setContadorPw(pw);localStorage.setItem("yfcont_contadorPw",pw);setShowChangePw(false);}} onClose={()=>setShowChangePw(false)}/></ModalBox>}

        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:54,position:"sticky",top:0,zIndex:100,boxShadow:C.shadow}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:"#000",borderRadius:8,padding:"3px 5px",display:"inline-flex"}}>
              <img src={LOGO} alt="YF" style={{height:30,width:"auto",display:"block",mixBlendMode:"lighten"}}/>
            </div>
          </div>
          {user.role==="cliente"&&(<div style={{flex:1,padding:"0 10px",minWidth:0}}>
            <div style={{fontWeight:700,fontSize:13,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
            <div style={{fontSize:11,color:C.muted}}>{user.cnpj} · {user.regime}</div>
          </div>)}
          {user.role==="contador"&&<span style={{color:C.muted,fontSize:12,flex:1,paddingLeft:8}}>Contador</span>}
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {user.role==="contador"&&(<>
              <button onClick={()=>setShowChangePw(true)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:10,cursor:"pointer"}}>🔑 Senha</button>
            </>)}
            <BtnGh onClick={()=>setUser(null)} sm>Sair</BtnGh>
          </div>
        </div>

        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",width:"100%"}}>
          {tabs.map(tab=>(
            <button key={tab.id} onClick={()=>{setActiveTab(tab.id);if(tab.id==="chat")setUnreadChat(0);}}
              style={{flex:"1 0 0",display:"flex",flexDirection:"column",alignItems:"center",padding:"8px 2px",border:"none",background:"transparent",cursor:"pointer",borderBottom:`2.5px solid ${activeTab===tab.id?C.gold:"transparent"}`,minWidth:0}}>
              <span style={{fontSize:16,marginBottom:1,lineHeight:1}}>{tab.i}</span>
              <span style={{fontSize:9,fontWeight:activeTab===tab.id?700:400,color:activeTab===tab.id?C.gold:C.muted,textTransform:"uppercase",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"100%",padding:"0 1px"}}>{tab.l}{tab.badge>0&&<span style={{background:C.gold,color:"#fff",borderRadius:"50%",width:14,height:14,fontSize:9,fontWeight:700,marginLeft:3,display:"inline-flex",alignItems:"center",justifyContent:"center",verticalAlign:"middle"}}>{tab.badge}</span>}</span>
            </button>
          ))}
        </div>

        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain"}}><div style={{maxWidth:700,margin:"0 auto",padding:"20px 16px"}}>
          {activeTab==="clientes"   &&user.role==="contador"&&<ClientesTab clients={clients} setClients={setClients}/>}
          {activeTab==="cadastro"   &&<CadastroTab user={user} clients={ac} setClients={setClients}/>}
          {activeTab==="bancos"     &&user.role==="contador"&&<BancosTab clients={ac}/>}
          {activeTab==="extratos"   &&<ExtratosTab user={user} clients={ac}/>}
          {activeTab==="notas"      &&<NotasFiscaisTab user={user} clients={ac}/>}
          {activeTab==="impostos"   &&<ImpostosTab user={user} clients={ac}/>}
          {activeTab==="resumo"     &&<ResumoTab user={user} clients={ac}/>}
          {activeTab==="relatorios" &&<RelatoriosTab user={user} clients={ac}/>}
          {activeTab==="chat"       &&<ChatTab user={user} clients={ac}/>}
          {activeTab==="push"       &&user.role==="contador"&&<PushTab clients={ac} user={user} sendLocalNotification={sendLocalNotification}/>}
        </div>
      </div></div>
    </FileViewerProvider>
  );
}

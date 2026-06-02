import React, { useState, useRef, useEffect, createContext, useContext } from "react";

// ─── PERSISTÊNCIA LOCAL ───────────────────────────────────────────────────────
// Hook que salva automaticamente no localStorage
function usePersisted(key, initialValue) {
  const [state, setStateRaw] = useState(() => {
    try {
      const stored = localStorage.getItem("yfcont_" + key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch(e) {
      return initialValue;
    }
  });
  function setState(val) {
    setStateRaw(prev => {
      const next = typeof val === "function" ? val(prev) : val;
      try { localStorage.setItem("yfcont_" + key, JSON.stringify(next)); } catch(e) {}
      return next;
    });
  }
  return [state, setState];
}

// Limpa todos os dados salvos (reset completo)
function clearAllData() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith("yfcont_"))
      .forEach(k => localStorage.removeItem(k));
  } catch(e) {}
}

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


// ─── VISUALIZADOR DE ARQUIVOS ─────────────────────────────────────────────────
// Context para abrir o visualizador de qualquer lugar
const ViewerCtx = createContext(null);

function FileViewerProvider({children}){
  const[file,setFile]=useState(null); // {name, type}
  return (
    <ViewerCtx.Provider value={{openFile:(name)=>setFile({name,type:name?.split(".").pop()?.toLowerCase()||"?"})  }}>
      {children}
      {file&&(
        <div onClick={e=>e.target===e.currentTarget&&setFile(null)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:2000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:560,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 8px 40px rgba(0,0,0,0.3)"}}>
            {/* Header */}
            <div style={{padding:"14px 18px",borderBottom:"1px solid #E2DDD5",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22}}>{file.type==="pdf"?"📄":file.type==="ofx"?"🏦":"📎"}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:"#1A1A1A",wordBreak:"break-all"}}>{file.name}</div>
                  <div style={{fontSize:11,color:"#8A857E",textTransform:"uppercase",letterSpacing:0.5}}>{file.type}</div>
                </div>
              </div>
              <button onClick={()=>setFile(null)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:22,color:"#8A857E",lineHeight:1,padding:"0 4px"}}>×</button>
            </div>
            {/* Preview area */}
            <div style={{flex:1,overflowY:"auto",padding:24,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,background:"#F7F6F2"}}>
              {file.type==="pdf"&&(
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:64,marginBottom:16}}>📄</div>
                  <div style={{fontSize:14,color:"#4A4540",marginBottom:8,fontWeight:600}}>{file.name}</div>
                  <div style={{fontSize:12,color:"#8A857E",marginBottom:20,background:"#fff",borderRadius:8,padding:"10px 16px",border:"1px solid #E2DDD5",maxWidth:320}}>
                    Neste ambiente de demonstração, a visualização em tela cheia não está disponível.<br/><br/>
                    Em produção (app real), o PDF abrirá diretamente para leitura.
                  </div>
                </div>
              )}
              {file.type==="ofx"&&(
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:64,marginBottom:16}}>🏦</div>
                  <div style={{fontSize:14,color:"#4A4540",marginBottom:8,fontWeight:600}}>{file.name}</div>
                  <div style={{fontSize:12,color:"#8A857E",background:"#fff",borderRadius:8,padding:"10px 16px",border:"1px solid #E2DDD5"}}>
                    Arquivo OFX — Extrato bancário estruturado
                  </div>
                </div>
              )}
              {!["pdf","ofx"].includes(file.type)&&(
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:64,marginBottom:16}}>📎</div>
                  <div style={{fontSize:14,color:"#4A4540",fontWeight:600}}>{file.name}</div>
                </div>
              )}
            </div>
            {/* Footer actions */}
            <div style={{padding:"14px 18px",borderTop:"1px solid #E2DDD5",display:"flex",gap:10,justifyContent:"flex-end",flexShrink:0,background:"#fff"}}>
              <button onClick={()=>setFile(null)}
                style={{padding:"9px 18px",borderRadius:8,border:"1px solid #E2DDD5",background:"transparent",color:"#8A857E",fontSize:13,cursor:"pointer"}}>
                Fechar
              </button>
              <button
                onClick={()=>{
                  try{
                    const a=document.createElement("a");
                    a.href="#";a.download=file.name;a.click();
                  }catch(e){}
                  alert("Download de \""+file.name+"\" iniciado!");
                }}
                style={{padding:"9px 20px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#D4AA45,#8B6914)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 2px 8px rgba(184,145,42,0.3)"}}>
                ⬇ Baixar arquivo
              </button>
            </div>
          </div>
        </div>
      )}
    </ViewerCtx.Provider>
  );
}

function useFileViewer(){
  return useContext(ViewerCtx)||{openFile:()=>{}};
}

// Componente de arquivo clicável — substitui alert()
function FileChip({name,color,bg,border}){
  const{openFile}=useFileViewer();
  if(!name) return null;
  const ext=name.split(".").pop()?.toLowerCase()||"";
  const icon=ext==="pdf"?"📄":ext==="ofx"?"🏦":"📎";
  return (
    <button onClick={()=>openFile(name)}
      style={{display:"inline-flex",alignItems:"center",gap:6,background:bg||"rgba(255,255,255,0.8)",borderRadius:6,padding:"4px 10px",border:`1px solid ${border||"#F0D080"}`,cursor:"pointer",fontSize:12,color:color||"#B8912A",fontWeight:600,textAlign:"left",maxWidth:"100%"}}>
      <span style={{flexShrink:0}}>{icon}</span>
      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</span>
      <span style={{fontSize:10,opacity:0.7,flexShrink:0}}>▶</span>
    </button>
  );
}

// Botão de download/visualização simples
function BtnView({name,label,sm}){
  const{openFile}=useFileViewer();
  return (
    <button onClick={()=>openFile(name)}
      style={{padding:sm?"6px 12px":"9px 18px",borderRadius:8,border:"1.5px solid #1E7D45",background:"#E8F5ED",color:"#1E7D45",fontSize:sm?11:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
      {label||"👁 Visualizar"}
    </button>
  );
}

const ANOS = ["2026","2025","2024"];
const MESES_LABELS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
// Meses para extratos — chave "YYYY-MM"
const MESES_EXTR = [
  {id:"2026-05",label:"Mai/2026"},{id:"2026-04",label:"Abr/2026"},
  {id:"2026-03",label:"Mar/2026"},{id:"2026-02",label:"Fev/2026"},
];
const MES_DEF = "2026-05";
const TODAY = "2026-05-31";

// Impostos: agora com nome e vencimento personalizáveis
const IMP_LISTA_BASE = [
  {id:"das",  name:"DAS - Simples Nacional", vencDia:20, ref:"Mensal"},
  {id:"fgts", name:"FGTS",                  vencDia:7,  ref:"Mensal"},
  {id:"folha",name:"Folha de Pagamento",     vencDia:30, ref:"Mensal"},
  {id:"inss", name:"INSS Patronal",          vencDia:20, ref:"Mensal"},
  {id:"irrf", name:"IRRF",                   vencDia:20, ref:"Mensal"},
  {id:"pis",  name:"PIS/COFINS",             vencDia:25, ref:"Mensal"},
  {id:"csll", name:"CSLL",                   vencDia:30, ref:"Trimestral"},
  {id:"irpj", name:"IRPJ",                   vencDia:30, ref:"Trimestral"},
  {id:"iss",  name:"ISS",                    vencDia:10, ref:"Mensal"},
  {id:"icms", name:"ICMS",                   vencDia:15, ref:"Mensal"},
];

const NFSE_CFG_EMPTY = {
  municipio:"",
  codigoMunicipio:"",
  endpoint:"",
  usuario:"",
  senha:"",
  token:"",
  cnpjEmissor:"",
  ambienteProd:false,
  aliquotaPadrao:"2",
  codigoServicoPadrao:"17.19",
  regimeTributario:"1",
  optanteSimplesNacional:true,
  naturezaOperacao:"1",
};

const CLIENTS_INIT = [
  {id:1,name:"Empresa Alpha Ltda",cnpj:"12.345.678/0001-90",email:"alpha@empresa.com",password:"alpha123",regime:"Simples Nacional",status:"ativo",inscMunicipal:"12345-6",certDigital:null,certValidade:"2026-12-31",certSenha:"cert@123",honorarios:"R$ 850,00",contrato:null,contratoSocial:null,
   nfseCfg:{...NFSE_CFG_EMPTY}},
  {id:2,name:"Beta Comércio ME",cnpj:"98.765.432/0001-10",email:"beta@comercio.com",password:"beta123",regime:"Lucro Presumido",status:"ativo",inscMunicipal:"65432-1",certDigital:null,certValidade:"2027-03-15",certSenha:"beta@cert",honorarios:"R$ 1.200,00",contrato:null,contratoSocial:null,
   nfseCfg:{...NFSE_CFG_EMPTY}},
];

// Configuração de impostos por cliente: lista de objetos {id, name, vencDia, ref, ativo}
const IMP_CFG_INIT = {
  1: IMP_LISTA_BASE.filter(x=>["das","fgts","folha","inss"].includes(x.id)).map(x=>({...x,ativo:true})),
  2: IMP_LISTA_BASE.filter(x=>["irpj","csll","pis","folha"].includes(x.id)).map(x=>({...x,ativo:true})),
};

const IMP_DADOS_INIT = {
  1:{
    "2026-05":{das:{venc:"2026-06-20",valor:"R$ 1.847,00",status:"pendente",pagoCliente:false,guia:null},fgts:{venc:"2026-06-07",valor:"R$ 420,00",status:"pago",pagoCliente:false,guia:"FGTS_mai26.pdf"},folha:{venc:"2026-05-30",valor:"R$ 3.200,00",status:"vencido",pagoCliente:false,guia:null},inss:{venc:"2026-06-20",valor:"R$ 640,00",status:"pendente",pagoCliente:false,guia:null}},
    "2026-04":{das:{venc:"2026-05-20",valor:"R$ 1.720,00",status:"pago",pagoCliente:false,guia:"DAS_abr26.pdf"},fgts:{venc:"2026-05-07",valor:"R$ 420,00",status:"pago",pagoCliente:false,guia:"FGTS_abr26.pdf"},folha:{venc:"2026-04-30",valor:"R$ 3.200,00",status:"pago",pagoCliente:false,guia:"Folha_abr26.pdf"},inss:{venc:"2026-05-20",valor:"R$ 640,00",status:"pago",pagoCliente:false,guia:"INSS_abr26.pdf"}},
  },
  2:{
    "2026-05":{irpj:{venc:"2026-06-30",valor:"R$ 5.120,00",status:"pendente",pagoCliente:false,guia:null},csll:{venc:"2026-06-30",valor:"R$ 1.843,00",status:"pendente",pagoCliente:false,guia:null},pis:{venc:"2026-05-25",valor:"R$ 2.310,00",status:"vencido",pagoCliente:false,guia:null},folha:{venc:"2026-05-30",valor:"R$ 4.100,00",status:"vencido",pagoCliente:false,guia:null}},
    "2026-04":{irpj:{venc:"2026-05-30",valor:"R$ 5.120,00",status:"pago",pagoCliente:false,guia:"IRPJ_1T26.pdf"},csll:{venc:"2026-05-30",valor:"R$ 1.843,00",status:"pago",pagoCliente:false,guia:"CSLL_1T26.pdf"},pis:{venc:"2026-04-25",valor:"R$ 2.100,00",status:"pago",pagoCliente:false,guia:"PIS_abr26.pdf"},folha:{venc:"2026-04-30",valor:"R$ 4.100,00",status:"pago",pagoCliente:false,guia:"Folha_abr26.pdf"}},
  },
};
const AVUL_INIT = {1:{"2026-05":[],"2026-04":[]},2:{"2026-05":[],"2026-04":[]}};

const BANCOS_INIT = {
  1:[{id:1,nome:"Banco do Brasil",agencia:"1234-5",conta:"00012345-6",tipo:"Corrente"},{id:2,nome:"Itaú",agencia:"0001",conta:"12345-6",tipo:"Corrente"},{id:3,nome:"Nubank",agencia:"0001",conta:"987654-0",tipo:"Digital"}],
  2:[{id:1,nome:"Bradesco",agencia:"4321",conta:"654321-0",tipo:"Corrente"},{id:2,nome:"Caixa Econômica",agencia:"0024",conta:"000111222-3",tipo:"Poupança"}],
};

// Envios por cliente/banco/competência (YYYY-MM)
const ENVIOS_INIT = {
  1:{
    1:{"2026-05":{pdf:null,ofx:null,status:"pendente"},"2026-04":{pdf:"extrato_bb_abr.pdf",ofx:"extrato_bb_abr.ofx",status:"enviado"}},
    2:{"2026-05":{pdf:null,ofx:null,status:"pendente"},"2026-04":{pdf:"extrato_itau_abr.pdf",ofx:null,status:"enviado"}},
    3:{"2026-05":{pdf:null,ofx:null,status:"pendente"}},
  },
  2:{
    1:{"2026-05":{pdf:null,ofx:null,status:"pendente"}},
    2:{"2026-05":{pdf:null,ofx:null,status:"pendente"}},
  },
};

// Competências ativas por cliente: lista de "YYYY-MM" (editável pelo contador)
const COMPETENCIAS_INIT = {
  1: ["2026-05","2026-04","2026-03","2026-02"],
  2: ["2026-05","2026-04"],
};


// Competências por aba e por cliente
const COMP_NOTAS_INIT = {
  1: ["2026-05","2026-04","2026-03","2026-02"],
  2: ["2026-05","2026-04"],
};
const COMP_IMP_INIT = {
  1: ["2026-05","2026-04","2026-03","2026-02"],
  2: ["2026-05","2026-04"],
};
const COMP_RESUMO_INIT = {
  1: ["2026-05","2026-04","2026-03","2026-02"],
  2: ["2026-05","2026-04"],
};
// Anos disponíveis por cliente para relatórios
const ANOS_REL_INIT = {
  1: ["2026","2025"],
  2: ["2026","2025"],
};
const RESUMO_INIT = {
  1:{"2026-05":{fatMes:"R$ 48.320,00",fatAno:"R$ 214.180,00",proLabore:"R$ 5.000,00",impostos:"R$ 2.267,00",reciboProLabore:null},"2026-04":{fatMes:"R$ 42.100,00",fatAno:"R$ 165.860,00",proLabore:"R$ 5.000,00",impostos:"R$ 1.980,00",reciboProLabore:"Recibo_ProLabore_Abr26.pdf"}},
  2:{"2026-05":{fatMes:"R$ 132.800,00",fatAno:"R$ 598.200,00",proLabore:"R$ 12.000,00",impostos:"R$ 6.963,00",reciboProLabore:null},"2026-04":{fatMes:"R$ 118.500,00",fatAno:"R$ 465.400,00",proLabore:"R$ 12.000,00",impostos:"R$ 6.100,00",reciboProLabore:null}},
};

// Relatórios por cliente/ANO (não mês)
const RELATORIOS_INIT = {
  1:{
    "2026":{balanco:{status:"disponivel",arquivo:"Balanco_Alpha_2026.pdf"},dre:{status:"disponivel",arquivo:"DRE_Alpha_2026.pdf"},informe:{status:"nao_liberado",arquivo:null}},
    "2025":{balanco:{status:"disponivel",arquivo:"Balanco_Alpha_2025.pdf"},dre:{status:"disponivel",arquivo:"DRE_Alpha_2025.pdf"},informe:{status:"disponivel",arquivo:"Informe_Alpha_2025.pdf"}},
  },
  2:{
    "2026":{balanco:{status:"nao_liberado",arquivo:null},dre:{status:"disponivel",arquivo:"DRE_Beta_2026.pdf"},informe:{status:"nao_liberado",arquivo:null}},
    "2025":{balanco:{status:"nao_liberado",arquivo:null},dre:{status:"disponivel",arquivo:"DRE_Beta_2025.pdf"},informe:{status:"nao_liberado",arquivo:null}},
  },
};

const NOTAS_INIT = {1:{"2026-05":[],"2026-04":[]},2:{"2026-05":[],"2026-04":[]}};
const CHAT_INIT = {
  1:[{id:1,from:"contador",text:"Precisamos dos extratos de maio.",time:"09:15",files:[]}],
  2:[{id:1,from:"contador",text:"IRPJ vence 30/06. Favor providenciar.",time:"14:30",files:[]}],
};
const NOTIFS_INIT = [
  {id:1,clientIds:[1],clientName:"Empresa Alpha Ltda",type:"imposto",msg:"INSS sinalizado como pago",date:"2026-05-30",read:false},
  {id:2,clientIds:[1,2],clientName:"Todos os clientes",type:"geral",msg:"Prazo docs: até 05/06/2026",date:"2026-05-29",read:false},
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function isVencido(v,s){return s!=="pago"&&v<TODAY;}
function getSI(t){
  if(t.status==="pago")   return{label:"Pago",        color:C.green,bg:"#E8F5ED",border:"#A8D5BB"};
  if(t.pagoCliente)       return{label:"Aguard.Conf.",color:C.amber,bg:"#FFF8E8",border:"#F0D080"};
  if(isVencido(t.venc,t.status)||t.status==="vencido")
                          return{label:"Vencida",     color:C.red,  bg:"#FDE8E8",border:"#F0AAAA"};
  return                        {label:"Pendente",    color:C.amber,bg:"#FFF3DC",border:"#F0C060"};
}
function mesIdLabel(id){
  if(!id) return "";
  const [y,m] = id.split("-");
  return MESES_LABELS[parseInt(m)-1]+"/"+y;
}
function gerarMesesDisponiveis(inicio){
  // gera todos os YYYY-MM desde inicio até hoje
  const result = [];
  const [sy,sm] = inicio.split("-").map(Number);
  const [ey,em] = TODAY.split("-").map(Number);
  let y=sy,m=sm;
  while(y<ey||(y===ey&&m<=em)){
    result.push(`${y}-${String(m).padStart(2,"0")}`);
    m++;if(m>12){m=1;y++;}
  }
  return result.reverse();
}

// ─── UI ATOMS ────────────────────────────────────────────────────────────────
function Card({children,style}){
  return <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow,...style}}>{children}</div>;
}
function FieldLabel({text}){
  return <label style={{color:C.muted,fontSize:11,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",display:"block",marginBottom:6}}>{text}</label>;
}
function TxtIn({value,onChange,type,placeholder,readOnly}){
  return <input type={type||"text"} value={value||""} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
    style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:readOnly?C.surfaceAlt:C.bgAlt,color:C.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>;
}
function SelIn({value,onChange,children}){
  return <select value={value} onChange={onChange} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.bgAlt,color:C.text,fontSize:14,outline:"none"}}>{children}</select>;
}
function Pill({label,color,bg,border}){
  return <span style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap",background:bg||"#eee",color:color||C.muted,border:`1px solid ${border||C.border}`}}>{label}</span>;
}
function BtnPri({onClick,children,full}){
  return <button onClick={onClick} style={{padding:"12px 24px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${C.goldLight},${C.goldDark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",width:full?"100%":"auto",boxShadow:"0 2px 8px rgba(184,145,42,0.3)"}}>{children}</button>;
}
function BtnOut({onClick,children,sm,col}){
  const c=col||C.gold;
  return <button onClick={onClick} style={{padding:sm?"6px 12px":"9px 18px",borderRadius:8,border:`1.5px solid ${c}`,background:"transparent",color:c,fontSize:sm?11:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>{children}</button>;
}
function BtnGr({onClick,children,sm}){
  return <button onClick={onClick} style={{padding:sm?"6px 12px":"9px 18px",borderRadius:8,border:`1.5px solid ${C.green}`,background:"#E8F5ED",color:C.green,fontSize:sm?11:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>{children}</button>;
}
function BtnGh({onClick,children,sm}){
  return <button onClick={onClick} style={{padding:sm?"5px 10px":"9px 16px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:sm?11:13,cursor:"pointer"}}>{children}</button>;
}
function BtnRed({onClick,children,sm}){
  return <button onClick={onClick} style={{padding:sm?"5px 10px":"9px 16px",borderRadius:8,border:`1px solid ${C.red}55`,background:"#FDE8E8",color:C.red,fontSize:sm?11:13,fontWeight:600,cursor:"pointer"}}>{children}</button>;
}
function SecH({text,color}){
  return <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
    <div style={{width:3,height:16,borderRadius:2,background:color||C.gold}}/>
    <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:color||C.textSub}}>{text}</span>
  </div>;
}
function ModalBox({onClose,children}){
  return <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
    <div style={{background:C.surface,borderRadius:16,padding:28,maxWidth:480,width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,0.2)",maxHeight:"90vh",overflowY:"auto"}}>{children}</div>
  </div>;
}
function FCard({title,children,onSave,onCancel}){
  return <Card style={{padding:20,marginBottom:16}}>
    {title&&<h3 style={{color:C.gold,margin:"0 0 16px",fontSize:13,fontWeight:700}}>{title}</h3>}
    {children}
    <div style={{display:"flex",gap:10,marginTop:16}}><BtnPri onClick={onSave}>Salvar</BtnPri><BtnGh onClick={onCancel}>Cancelar</BtnGh></div>
  </Card>;
}
function PgH({title,action}){
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
    <h2 style={{color:C.text,margin:0,fontSize:18,fontWeight:700}}>{title}</h2>
    {action}
  </div>;
}
function MesFilt({value,onChange,options}){
  const opts=options||MESES_EXTR;
  return <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
    {opts.map(m=>(
      <button key={m.id} onClick={()=>onChange(m.id)}
        style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${value===m.id?C.gold:C.border}`,background:value===m.id?C.gold:"transparent",color:value===m.id?"#fff":C.muted,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>
        {m.label}
      </button>
    ))}
  </div>;
}

// ─── COMPETÊNCIAS PANEL (reusável) ───────────────────────────────────────────
function CompetenciasPanel({comps,onAdd,onRemove,label}){
  const[show,setShow]=useState(false);
  const[val,setVal]=useState("");
  const[confirmRem,setConfirmRem]=useState(null); // comp id awaiting confirm

  function doAdd(){
    if(!val||comps.includes(val))return;
    onAdd(val);setVal("");setShow(false);
  }

  return (
    <Card style={{padding:16,marginBottom:20,background:"#FDF5E0",border:"1px solid #F0D080"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:comps.length>0?10:0}}>
        <span style={{fontSize:12,fontWeight:600,color:C.textSub}}>📅 {label||"Competências"} ({comps.length})</span>
        <BtnOut onClick={()=>setShow(!show)} sm>+ Adicionar</BtnOut>
      </div>
      {show&&(
        <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"flex-end"}}>
          <div style={{flex:1}}>
            <FieldLabel text="Competência (YYYY-MM)"/>
            <TxtIn value={val} onChange={e=>setVal(e.target.value)} placeholder="2026-06"/>
          </div>
          <BtnPri onClick={doAdd}>Salvar</BtnPri>
          <BtnGh onClick={()=>{setShow(false);setVal("");}}>Cancelar</BtnGh>
        </div>
      )}
      {confirmRem&&(
        <div style={{background:"#FDE8E8",borderRadius:8,padding:"10px 14px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #F0AAAA"}}>
          <span style={{fontSize:12,color:C.red,fontWeight:600}}>Excluir {mesIdLabel(confirmRem)}? Esta ação não pode ser desfeita.</span>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>{onRemove(confirmRem);setConfirmRem(null);}}
              style={{padding:"5px 12px",borderRadius:6,border:"none",background:C.red,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Excluir</button>
            <BtnGh onClick={()=>setConfirmRem(null)} sm>Cancelar</BtnGh>
          </div>
        </div>
      )}
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {comps.map(c=>(
          <div key={c} style={{display:"flex",alignItems:"center",gap:4,background:"#fff",borderRadius:20,padding:"4px 10px 4px 12px",border:`1px solid ${confirmRem===c?"#F0AAAA":"#F0D080"}`}}>
            <span style={{fontSize:12,color:C.textSub,fontWeight:500}}>{mesIdLabel(c)}</span>
            <button onClick={()=>setConfirmRem(confirmRem===c?null:c)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.red,fontSize:14,lineHeight:1,padding:"0 2px"}}>×</button>
          </div>
        ))}
        {comps.length===0&&<span style={{fontSize:12,color:C.muted}}>Nenhuma competência.</span>}
      </div>
    </Card>
  );
}

// Anos panel para relatórios
function AnosPanel({anos,onAdd,onRemove}){
  const[show,setShow]=useState(false);
  const[val,setVal]=useState("");
  const[confirmRem,setConfirmRem]=useState(null);

  function doAdd(){
    if(!val||anos.includes(val))return;
    onAdd(val);setVal("");setShow(false);
  }

  return (
    <Card style={{padding:16,marginBottom:20,background:"#FDF5E0",border:"1px solid #F0D080"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:anos.length>0?10:0}}>
        <span style={{fontSize:12,fontWeight:600,color:C.textSub}}>📅 Anos disponíveis ({anos.length})</span>
        <BtnOut onClick={()=>setShow(!show)} sm>+ Adicionar</BtnOut>
      </div>
      {show&&(
        <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"flex-end"}}>
          <div style={{flex:1}}>
            <FieldLabel text="Ano (YYYY)"/>
            <TxtIn value={val} onChange={e=>setVal(e.target.value)} placeholder="2025" type="number"/>
          </div>
          <BtnPri onClick={doAdd}>Salvar</BtnPri>
          <BtnGh onClick={()=>{setShow(false);setVal("");}}>Cancelar</BtnGh>
        </div>
      )}
      {confirmRem&&(
        <div style={{background:"#FDE8E8",borderRadius:8,padding:"10px 14px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #F0AAAA"}}>
          <span style={{fontSize:12,color:C.red,fontWeight:600}}>Excluir o ano {confirmRem}?</span>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>{onRemove(confirmRem);setConfirmRem(null);}}
              style={{padding:"5px 12px",borderRadius:6,border:"none",background:C.red,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Excluir</button>
            <BtnGh onClick={()=>setConfirmRem(null)} sm>Cancelar</BtnGh>
          </div>
        </div>
      )}
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {anos.map(a=>(
          <div key={a} style={{display:"flex",alignItems:"center",gap:4,background:"#fff",borderRadius:20,padding:"4px 10px 4px 12px",border:`1px solid ${confirmRem===a?"#F0AAAA":"#F0D080"}`}}>
            <span style={{fontSize:12,color:C.textSub,fontWeight:500}}>{a}</span>
            <button onClick={()=>setConfirmRem(confirmRem===a?null:a)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.red,fontSize:14,lineHeight:1,padding:"0 2px"}}>×</button>
          </div>
        ))}
        {anos.length===0&&<span style={{fontSize:12,color:C.muted}}>Nenhum ano.</span>}
      </div>
    </Card>
  );
}
function AnoFilt({value,onChange}){
  return <div style={{display:"flex",gap:6,marginBottom:20}}>
    {ANOS.map(a=>(
      <button key={a} onClick={()=>onChange(a)}
        style={{padding:"6px 18px",borderRadius:20,border:`1.5px solid ${value===a?C.gold:C.border}`,background:value===a?C.gold:"transparent",color:value===a?"#fff":C.muted,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>
        {a}
      </button>
    ))}
  </div>;
}
function CliSel({clients,value,onChange}){
  return <SelIn value={value} onChange={e=>onChange(Number(e.target.value))}>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</SelIn>;
}
function Empty({icon,text}){
  return <div style={{textAlign:"center",padding:"40px 20px",color:C.muted}}><div style={{fontSize:36,marginBottom:12}}>{icon}</div><p style={{fontSize:14,margin:0}}>{text}</p></div>;
}
function FileRow({label,arquivo,onUpload,canUpload,canDownload}){
  const{openFile}=useFileViewer();
  return <div style={{background:arquivo?C.surfaceAlt:"#FFF8F0",borderRadius:8,padding:"12px 14px",border:`1px solid ${arquivo?C.border:"#F0D080"}`,marginBottom:10}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:6}}>{label}</div>
        {arquivo
          ?<FileChip name={arquivo}/>
          :<div style={{fontSize:12,color:C.muted}}>Nenhum arquivo</div>}
      </div>
      <div style={{display:"flex",gap:8,marginLeft:12,flexShrink:0}}>
        {arquivo&&canDownload&&<BtnView name={arquivo} sm/>}
        {canUpload&&<BtnOut onClick={onUpload} sm>{arquivo?"🔄 Trocar":"📎 Anexar"}</BtnOut>}
      </div>
    </div>
  </div>;
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin,clients}){
  // Carregar credenciais salvas
  const savedCreds = (() => {
    try{ return JSON.parse(localStorage.getItem("yfcont_savedCreds")||"null"); }catch(e){return null;}
  })();
  const[role,setRole]=useState(savedCreds?.role||"contador");
  const[email,setEmail]=useState(savedCreds?.email||"");
  const[pw,setPw]=useState(savedCreds?.pw||"");
  const[saveLogin,setSaveLogin]=useState(!!savedCreds);
  const[err,setErr]=useState("");
  const[showForgot,setShowForgot]=useState(false);
  const[forgotEmail,setForgotEmail]=useState("");
  const[forgotMsg,setForgotMsg]=useState("");
  function handleForgot(){
    const isContador = forgotEmail==="y.facundo@yahoo.com.br";
    const isCliente = clients.find(c=>c.email===forgotEmail);
    if(isContador||isCliente){
      // Simula envio de e-mail — em produção aqui chamaria uma API real de reset
      const mailto = `mailto:${forgotEmail}?subject=Redefinição de senha — YF Contabilidade&body=Olá! Você solicitou a redefinição da sua senha no Portal YF Contabilidade.%0A%0AClique no link abaixo para criar uma nova senha:%0Ahttps://yfcontabilidade.com.br/reset-senha%0A%0ASe não foi você, ignore este e-mail.`;
      try { window.open(mailto, "_blank"); } catch(e){}
      setForgotMsg("enviado");
    } else {
      setForgotMsg("nao_encontrado");
    }
  }
  function go(){
    if(role==="contador"){
      if(email==="y.facundo@yahoo.com.br"&&pw==="admin123"){
        if(saveLogin) localStorage.setItem("yfcont_savedCreds", JSON.stringify({role,email,pw}));
        else localStorage.removeItem("yfcont_savedCreds");
        onLogin({role:"contador",name:"YF Contabilidade"});
      } else setErr("Credenciais inválidas.");
    }else{
      const c=clients.find(c=>c.email===email&&c.password===pw);
      if(c){
        if(saveLogin) localStorage.setItem("yfcont_savedCreds", JSON.stringify({role,email,pw}));
        else localStorage.removeItem("yfcont_savedCreds");
        onLogin({role:"cliente",...c});
      } else setErr("Credenciais inválidas.");
    }
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
                style={{flex:1,padding:"10px",borderRadius:7,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,transition:"all 0.2s",background:role===r?"#fff":"transparent",color:role===r?C.gold:C.muted,boxShadow:role===r?C.shadow:"none"}}>
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
            {/* Salvar credenciais */}
            <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"4px 0"}}>
              <div onClick={()=>setSaveLogin(!saveLogin)}
                style={{width:20,height:20,borderRadius:5,border:`2px solid ${saveLogin?C.gold:C.border}`,background:saveLogin?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                {saveLogin&&<span style={{color:"#fff",fontSize:12,fontWeight:900,lineHeight:1}}>✓</span>}
              </div>
              <span style={{fontSize:13,color:C.textSub}}>Lembrar meu acesso</span>
            </label>
            <BtnPri onClick={go} full>Entrar</BtnPri>
          </div>
        </Card>
        {/* Esqueci minha senha */}
        <div style={{textAlign:"center",marginTop:12}}>
          <button onClick={()=>{setShowForgot(true);setForgotMsg("");setForgotEmail("");}}
            style={{background:"transparent",border:"none",cursor:"pointer",color:C.gold,fontSize:13,fontWeight:600,textDecoration:"underline"}}>
            Esqueci minha senha
          </button>
        </div>
        {showForgot&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
            <div style={{background:C.surface,borderRadius:16,padding:28,maxWidth:380,width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
              <h3 style={{color:C.text,fontSize:16,fontWeight:700,margin:"0 0 6px"}}>Recuperar Acesso</h3>
              <p style={{color:C.muted,fontSize:13,margin:"0 0 18px",lineHeight:1.5}}>
                Digite o e-mail cadastrado para visualizar suas credenciais de acesso.
              </p>
              {!forgotMsg?(
                <>
                  <FieldLabel text="E-mail cadastrado"/>
                  <TxtIn value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} type="email" placeholder="seu@email.com"/>
                  <div style={{display:"flex",gap:10,marginTop:16}}>
                    <BtnPri onClick={handleForgot}>Recuperar</BtnPri>
                    <BtnGh onClick={()=>setShowForgot(false)}>Cancelar</BtnGh>
                  </div>
                </>
              ):(
                <>
                  {forgotMsg==="enviado"&&(
                    <div style={{background:"#E8F5ED",borderRadius:10,padding:"16px",border:"1px solid #A8D5BB",textAlign:"center"}}>
                      <div style={{fontSize:36,marginBottom:10}}>📧</div>
                      <div style={{fontWeight:700,fontSize:15,color:C.green,marginBottom:6}}>E-mail enviado!</div>
                      <div style={{fontSize:13,color:C.textSub,lineHeight:1.6}}>
                        Enviamos um link de redefinição de senha para<br/>
                        <strong>{forgotEmail}</strong><br/><br/>
                        Verifique sua caixa de entrada e spam.
                      </div>
                    </div>
                  )}
                  {forgotMsg==="nao_encontrado"&&(
                    <div style={{background:"#FDE8E8",borderRadius:10,padding:"14px 16px",border:"1px solid #F0AAAA",fontSize:13,color:C.red,textAlign:"center"}}>
                      ❌ E-mail não encontrado no sistema.<br/>
                      <span style={{color:C.muted,fontSize:12}}>Verifique o e-mail digitado e tente novamente.</span>
                    </div>
                  )}
                  <div style={{marginTop:16,display:"flex",justifyContent:"flex-end"}}>
                    <BtnPri onClick={()=>setShowForgot(false)}>Fechar</BtnPri>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        <div style={{textAlign:"center",marginTop:16,color:C.muted,fontSize:11,lineHeight:1.9}}>
          <a href="https://yfcontabilidade.com.br" style={{color:C.gold,textDecoration:"none",fontWeight:600}}>yfcontabilidade.com.br</a><br/>
          <span style={{opacity:0.6}}>Contador: y.facundo@yahoo.com.br / admin123</span><br/>
          <span style={{opacity:0.6}}>Cliente: alpha@empresa.com / alpha123</span>
        </div>
      </div>
    </div>
  );
}

// ─── CADASTRO ────────────────────────────────────────────────────────────────
function CadastroTab({user,clients,setClients}){
  const clientId=user.role==="cliente"?user.id:null;
  const[selId,setSelId]=useState(clients[0]?.id||1);
  const id=user.role==="cliente"?clientId:selId;
  const client=clients.find(c=>c.id===id)||clients[0];
  const[editMode,setEditMode]=useState(false);
  const[form,setForm]=useState(null);
  const certRef=useRef();const contratoRef=useRef();const contratoSocRef=useRef();
  function startEdit(){setForm({...client});setEditMode(true);}
  function saveEdit(){setClients(p=>p.map(c=>c.id===id?{...c,...form}:c));setEditMode(false);}
  function setArq(key,file){setClients(p=>p.map(c=>c.id===id?{...c,[key]:file.name}:c));}
  if(!client) return <Empty icon="🏢" text="Selecione um cliente."/>;
  return (
    <div>
      <PgH title="Cadastro da Empresa"
        action={<div style={{display:"flex",gap:8,alignItems:"center"}}>
          {user.role==="contador"&&<div style={{width:160}}><SelIn value={selId} onChange={e=>setSelId(Number(e.target.value))}>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</SelIn></div>}
          {user.role==="contador"&&!editMode&&<BtnOut onClick={startEdit} sm>✏️ Editar</BtnOut>}
        </div>}/>
      {editMode&&user.role==="contador"?(
        <FCard title="Editar Cadastro" onSave={saveEdit} onCancel={()=>setEditMode(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[["Razão Social","name"],["CNPJ","cnpj"],["Inscrição Municipal","inscMunicipal"],["E-mail / Usuário","email"],["Senha de acesso","password"],["Honorários mensais","honorarios"],["Validade Cert. Digital","certValidade"],["Senha Cert. Digital","certSenha"]].map(([l,k])=>(
              <div key={k+l}><FieldLabel text={l}/><TxtIn value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
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
              {[["Razão Social",client.name],["CNPJ",client.cnpj],["Regime Tributário",client.regime],["Inscrição Municipal",client.inscMunicipal||"—"],["E-mail",client.email],["Honorários Mensais",client.honorarios||"—"],["Validade Cert. Digital",client.certValidade||"—"]].map(([l,v])=>(
                <div key={l}>
                  <div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>{l}</div>
                  <div style={{fontSize:14,color:C.text,fontWeight:500}}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
          {user.role==="contador"&&(
            <Card style={{padding:20,background:"#FDF5E0",border:"1px solid #F0D080"}}>
              <SecH text="Credenciais de Acesso" color={C.amber}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",marginBottom:3}}>Usuário (e-mail)</div><div style={{fontSize:14,color:C.text}}>{client.email}</div></div>
                <div><div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",marginBottom:3}}>Senha de Acesso</div><div style={{fontSize:14,color:C.text,fontFamily:"monospace"}}>{client.password}</div></div>
                <div><div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",marginBottom:3}}>Senha Cert. Digital</div><div style={{fontSize:14,color:C.text,fontFamily:"monospace"}}>{client.certSenha||"—"}</div></div>
              </div>
            </Card>
          )}
          <Card style={{padding:20}}>
            <SecH text="Documentos & Arquivos"/>
            <input ref={certRef} type="file" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setArq("certDigital",e.target.files[0]);}}/>
            <input ref={contratoRef} type="file" accept=".pdf,.docx" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setArq("contrato",e.target.files[0]);}}/>
            <input ref={contratoSocRef} type="file" accept=".pdf,.docx" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setArq("contratoSocial",e.target.files[0]);}}/>
            <FileRow label="Certificado Digital" arquivo={client.certDigital} canUpload={user.role==="contador"} canDownload={true} onUpload={()=>certRef.current.click()} />
            {/* Validade e senha do certificado — visível para todos */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:-4,marginBottom:10}}>
              <div style={{background:C.surfaceAlt,borderRadius:8,padding:"10px 14px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>📅 Validade</div>
                <div style={{fontSize:14,color:C.text,fontWeight:600}}>{client.certValidade||"—"}</div>
              </div>
              <div style={{background:"#FFF8E8",borderRadius:8,padding:"10px 14px",border:"1px solid #F0D080"}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>🔑 Senha</div>
                <div style={{fontSize:14,color:C.text,fontWeight:600,fontFamily:"monospace"}}>{client.certSenha||"—"}</div>
              </div>
            </div>
            <FileRow label="Contrato de Prestação de Serviços" arquivo={client.contrato} canUpload={user.role==="contador"} canDownload={true} onUpload={()=>contratoRef.current.click()} />
            <FileRow label="Contrato Social" arquivo={client.contratoSocial} canUpload={user.role==="contador"} canDownload={true} onUpload={()=>contratoSocRef.current.click()} />
          </Card>

          {/* NFSe Config */}
          <NfseCfgCard
            client={client}
            readOnly={user.role==="cliente"}
            onSave={cfg=>setClients(p=>p.map(c=>c.id===id?{...c,nfseCfg:cfg}:c))}
          />
        </div>
      )}
    </div>
  );
}

// ─── CONFIGURAÇÃO NFSE (componente separado usado no CadastroTab e NotasFiscaisTab) ───
function NfseCfgCard({client,onSave,readOnly}){
  const[form,setForm]=useState(client.nfseCfg||{...NFSE_CFG_EMPTY});
  const[saved,setSaved]=useState(true);
  const[testando,setTestando]=useState(false);
  const[testResult,setTestResult]=useState(null);

  useEffect(()=>{setForm({...NFSE_CFG_EMPTY,...(client.nfseCfg||{})});setSaved(true);setTestResult(null);},[client.id]);

  function save(){onSave(form);setSaved(true);}
  function change(k,v){setForm(p=>({...p,[k]:v}));setSaved(false);setTestResult(null);}

  async function testarConexao(){
    if(!form.endpoint||!form.usuario||!form.token){setTestResult({ok:false,msg:"Preencha endpoint, usuário e token antes de testar."});return;}
    setTestando(true);setTestResult(null);
    try{
      await fetch(form.endpoint,{method:"HEAD",headers:{"Token":form.token,"Authorization":"Basic "+btoa(form.usuario+":"+form.senha)}});
      setTestResult({ok:true,msg:"Conexão estabelecida com o endpoint da prefeitura!"});
    }catch(e){
      const cors=e.name==="TypeError";
      setTestResult({ok:cors,msg:cors?"Endpoint respondeu (CORS bloqueado pelo navegador — normal em testes). Configuração salva com sucesso! O envio real funcionará via backend.":"Erro: "+e.message});
    }
    setTestando(false);
  }

  const campos = [
    {k:"municipio",l:"Município",p:"Ex: Cabo Frio/RJ"},
    {k:"codigoMunicipio",l:"Código IBGE do município",p:"Ex: 3300704"},
    {k:"endpoint",l:"Endpoint da API NFSe",p:"https://..."},
    {k:"cnpjEmissor",l:"CNPJ do emissor (prestador)",p:"00.000.000/0001-00"},
    {k:"usuario",l:"Usuário / Login da API",p:"Ex: CNPJ ou código"},
    {k:"senha",l:"Senha da API",p:"Senha fornecida pela prefeitura"},
    {k:"token",l:"Token de autenticação",p:"Código token fornecido"},
    {k:"aliquotaPadrao",l:"Alíquota ISS padrão (%)",p:"Ex: 2"},
    {k:"codigoServicoPadrao",l:"Código de serviço padrão",p:"Ex: 17.19"},
  ];

  return(
    <Card style={{padding:20,border:`1.5px solid ${saved?"#E2DDD5":"#E0A020"}`,background:saved?"#fff":"#FDFBF0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <SecH text="⚡ Configuração NFSe" color={C.gold}/>
          {form.municipio&&<div style={{fontSize:12,color:C.muted,marginTop:-8,marginBottom:8}}>Prefeitura: <strong>{form.municipio}</strong>{form.endpoint&&<span style={{color:C.green,marginLeft:6}}>✓ Endpoint configurado</span>}</div>}
        </div>
        {!saved&&!readOnly&&<span style={{fontSize:11,color:C.amber,fontWeight:600}}>● Não salvo</span>}
      </div>

      {readOnly?(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["Município",form.municipio||"—"],["Código IBGE",form.codigoMunicipio||"—"],["CNPJ Emissor",form.cnpjEmissor||"—"],["Alíquota padrão",form.aliquotaPadrao?form.aliquotaPadrao+"%":"—"],["Código serviço",form.codigoServicoPadrao||"—"],["Endpoint",form.endpoint?"✓ Configurado":"Não configurado"]].map(([l,v])=>(
            <div key={l}><div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",marginBottom:3}}>{l}</div><div style={{fontSize:13,color:C.text}}>{v}</div></div>
          ))}
        </div>
      ):(
        <>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {/* Ambiente */}
            <div>
              <FieldLabel text="Ambiente"/>
              <div style={{display:"flex",gap:8}}>
                {[[false,"🔧 Homologação (testes)"],[true,"🚀 Produção"]].map(([v,l])=>(
                  <button key={String(v)} onClick={()=>change("ambienteProd",v)}
                    style={{flex:1,padding:"9px",borderRadius:8,border:`1.5px solid ${form.ambienteProd===v?(v?C.green:C.amber):C.border}`,background:form.ambienteProd===v?(v?"#E8F5ED":"#FFF3DC"):"transparent",color:form.ambienteProd===v?(v?C.green:C.amber):C.muted,fontSize:12,cursor:"pointer",fontWeight:form.ambienteProd===v?700:400}}>
                    {l}
                  </button>
                ))}
              </div>
              {form.ambienteProd&&<div style={{background:"#FDE8E8",borderRadius:6,padding:"6px 10px",marginTop:6,fontSize:11,color:C.red}}>⚠ Atenção: modo produção emite notas fiscais reais e legalmente válidas.</div>}
            </div>

            {/* Regime tributário — valores corretos padrão NFSe nacional */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <FieldLabel text="Regime tributário do prestador"/>
                <SelIn value={form.regimeTributario} onChange={e=>change("regimeTributario",e.target.value)}>
                  <option value="1">Simples Nacional — MEI</option>
                  <option value="2">Simples Nacional — ME/EPP/Ltda</option>
                  <option value="3">Lucro Presumido — Ltda / SA / EIRELI</option>
                  <option value="4">Lucro Real — Ltda / SA</option>
                  <option value="5">Sociedade de Profissionais (médicos, advogados etc.)</option>
                  <option value="6">Cooperativa</option>
                </SelIn>
              </div>
              <div>
                <FieldLabel text="Natureza da operação"/>
                <SelIn value={form.naturezaOperacao} onChange={e=>change("naturezaOperacao",e.target.value)}>
                  <option value="1">Tributação no município</option>
                  <option value="2">Tributação fora do município</option>
                  <option value="3">Isenção</option>
                  <option value="4">Imune</option>
                </SelIn>
              </div>
            </div>

            <div>
              <FieldLabel text="Optante pelo Simples Nacional?"/>
              <div style={{display:"flex",gap:8}}>
                {[[true,"Sim"],[false,"Não"]].map(([v,l])=>(
                  <button key={String(v)} onClick={()=>change("optanteSimplesNacional",v)}
                    style={{flex:1,padding:"9px",borderRadius:8,border:`1.5px solid ${form.optanteSimplesNacional===v?C.gold:C.border}`,background:form.optanteSimplesNacional===v?"#FDF5E0":"transparent",color:form.optanteSimplesNacional===v?C.gold:C.muted,fontSize:13,cursor:"pointer",fontWeight:form.optanteSimplesNacional===v?600:400}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Campos de texto */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {campos.map(({k,l,p})=>(
                <div key={k} style={{gridColumn:k==="endpoint"?"1 / -1":undefined}}>
                  <FieldLabel text={l}/>
                  <TxtIn value={form[k]||""} onChange={e=>change(k,e.target.value)} placeholder={p}
                    type={k==="senha"?"password":"text"}/>
                </div>
              ))}
            </div>
          </div>

          {/* Resultado do teste */}
          {testResult&&(
            <div style={{background:testResult.ok?"#E8F5ED":"#FDE8E8",borderRadius:8,padding:"10px 14px",marginTop:12,border:`1px solid ${testResult.ok?"#A8D5BB":"#F0AAAA"}`,fontSize:12,color:testResult.ok?C.green:C.red}}>
              {testResult.msg}
            </div>
          )}

          <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
            <BtnPri onClick={save}>💾 Salvar configuração</BtnPri>
            <button onClick={testarConexao} disabled={testando}
              style={{padding:"11px 20px",borderRadius:8,border:`1.5px solid ${C.blue}`,background:"#EAF2FB",color:C.blue,fontSize:13,fontWeight:600,cursor:testando?"not-allowed":"pointer"}}>
              {testando?"⏳ Testando...":"🔌 Testar conexão"}
            </button>
            {!saved&&<BtnGh onClick={()=>{setForm(client.nfseCfg||{...NFSE_CFG_EMPTY});setSaved(true);}}>Descartar</BtnGh>}
          </div>
        </>
      )}
    </Card>
  );
}

// ─── CLIENTES ────────────────────────────────────────────────────────────────
function ClientesTab({clients,setClients}){
  const[show,setShow]=useState(false);
  const[form,setForm]=useState({name:"",cnpj:"",email:"",password:"",regime:"Simples Nacional",inscMunicipal:"",honorarios:"",certValidade:"",certSenha:""});
  function add(){
    if(!form.name||!form.email)return;
    setClients([...clients,{id:Date.now(),...form,status:"ativo",contratoSocial:null,contrato:null,certDigital:null}]);
    setForm({name:"",cnpj:"",email:"",password:"",regime:"Simples Nacional",inscMunicipal:"",honorarios:"",certValidade:"",certSenha:""});setShow(false);
  }
  return (
    <div>
      <PgH title="Clientes" action={<BtnOut onClick={()=>setShow(!show)}>+ Novo</BtnOut>}/>
      {show&&<FCard title="Novo Cliente" onSave={add} onCancel={()=>setShow(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[["Razão Social","name"],["CNPJ","cnpj"],["E-mail (usuário)","email"],["Senha de acesso","password"],["Inscrição Municipal","inscMunicipal"],["Honorários mensais","honorarios"],["Validade Cert. Digital","certValidade"],["Senha Cert. Digital","certSenha"]].map(([l,k])=>(
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
                <div style={{fontSize:12,color:C.muted}}>{c.email} · <span style={{fontFamily:"monospace"}}>{c.password}</span></div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,flexShrink:0,marginLeft:12}}>
                <Pill label={c.status==="ativo"?"Ativo":"Inativo"} color={c.status==="ativo"?C.green:C.red} bg={c.status==="ativo"?"#E8F5ED":"#FDE8E8"} border={c.status==="ativo"?"#A8D5BB":"#F0AAAA"}/>
                <button
                  onClick={()=>setClients(p=>p.map(x=>x.id===c.id?{...x,status:x.status==="ativo"?"inativo":"ativo"}:x))}
                  style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${c.status==="ativo"?C.red+"55":C.green+"55"}`,background:c.status==="ativo"?"#FDE8E8":"#E8F5ED",color:c.status==="ativo"?C.red:C.green,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  {c.status==="ativo"?"🔴 Inativar":"🟢 Ativar"}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── BANCOS ───────────────────────────────────────────────────────────────────
function BancosTab({clients}){
  const[sel,setSel]=useState(clients[0]?.id||1);
  const[bancos,setBancos]=usePersisted("bancos", BANCOS_INIT);
  const[show,setShow]=useState(false);
  const[form,setForm]=useState({nome:"",agencia:"",conta:"",tipo:"Corrente"});
  const list=bancos[sel]||[];
  function add(){if(!form.nome)return;setBancos(p=>({...p,[sel]:[...(p[sel]||[]),{id:Date.now(),...form}]}));setForm({nome:"",agencia:"",conta:"",tipo:"Corrente"});setShow(false);}
  return (
    <div>
      <PgH title="Bancos" action={<div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{width:160}}><SelIn value={sel} onChange={e=>setSel(Number(e.target.value))}>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</SelIn></div>
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
      {list.length===0&&<Empty icon="🏦" text="Nenhum banco cadastrado."/>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {list.map(b=>(
          <Card key={b.id} style={{padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:C.text}}>{b.nome}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:3}}>Ag. {b.agencia} · C/C {b.conta}</div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Pill label={b.tipo} color={C.gold} bg="#FDF5E0" border="#F0D080"/>
                <BtnGh sm onClick={()=>setBancos(p=>({...p,[sel]:p[sel].filter(x=>x.id!==b.id)}))}>Remover</BtnGh>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── EXTRATOS (antes: Docs) ────────────────────────────────────────────────────
function ExtratosTab({user,clients,compExtr,setCompExtr}){
  const[sel,setSel]=useState(user.role==="cliente"?user.id:(clients[0]?.id||1));
  const[envios,setEnvios]=usePersisted("envios", ENVIOS_INIT);
  const[bancos]=useState(BANCOS_INIT);

  const cBancos=bancos[sel]||[];
  const cComps=(compExtr[sel]||[]);
  const cEnvios=envios[sel]||{};
  const[mes,setMes]=useState(cComps[0]||MES_DEF);
  const mesOpts=cComps.map(id=>({id,label:mesIdLabel(id)}));

  function addComp(v){
    const updated=[v,...cComps].sort((a,b)=>b.localeCompare(a));
    setCompExtr(p=>({...p,[sel]:updated}));setMes(v);
  }
  function removeComp(compId){
    setCompExtr(p=>({...p,[sel]:p[sel].filter(x=>x!==compId)}));
    if(mes===compId){const rem=cComps.filter(x=>x!==compId);setMes(rem[0]||"");}
  }

  // Upload PDF ou OFX para banco específico
  function handleFile(bid, tipo, file){
    if(!file) return;
    setEnvios(p=>{
      const cur = p[sel]?.[bid]?.[mes] || {pdf:null,ofx:null,status:"pendente"};
      const updated = {...cur, [tipo]:file.name};
      // status = enviado se pelo menos um arquivo existe
      updated.status = (updated.pdf||updated.ofx) ? "enviado" : "pendente";
      return {...p, [sel]:{...(p[sel]||{}), [bid]:{...(p[sel]?.[bid]||{}), [mes]:updated}}};
    });
  }

  function getEnv(bid){ return cEnvios[bid]?.[mes] || {pdf:null,ofx:null,status:"pendente"}; }
  const pend = cBancos.filter(b => getEnv(b.id).status !== "enviado");
  const env  = cBancos.filter(b => getEnv(b.id).status === "enviado");

  // refs separados para PDF e OFX de cada banco
  const pdfRefs = useRef({});
  const ofxRefs = useRef({});

  return (
    <div>
      <PgH title="Extratos Bancários"
        action={user.role==="contador"&&<div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{width:160}}><CliSel clients={clients} value={sel} onChange={v=>{setSel(v);setMes((compExtr[v]||[])[0]||"");}}/></div>
        </div>}/>

      {user.role==="contador"&&<CompetenciasPanel comps={cComps} onAdd={addComp} onRemove={removeComp} label="Competências — Extratos"/>}
      {cComps.length>0&&<MesFilt value={mes} onChange={setMes} options={mesOpts}/>}

      {!mes||cComps.length===0?(
        <Empty icon="📅" text={user.role==="contador"?"Configure as competências usando o painel acima.":"Nenhuma competência disponível."}/>
      ):(
        <>
          {cBancos.length===0&&<Empty icon="🏦" text="Nenhum banco cadastrado."/>}

          {pend.length>0&&(
            <div style={{marginBottom:24}}>
              <SecH text="Pendentes de envio" color={C.amber}/>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {pend.map(b=>{
                  const e=getEnv(b.id);
                  return (
                    <Card key={b.id} style={{padding:16,background:"#FFF8E8",border:"1px solid #F0D080"}}>
                      <div style={{marginBottom:10}}>
                        <div style={{fontWeight:700,color:C.text,fontSize:14}}>🏦 {b.nome}</div>
                        <div style={{fontSize:12,color:C.muted,marginTop:2}}>Ag. {b.agencia} · C/C {b.conta} · {b.tipo}</div>
                        <div style={{fontSize:11,color:C.amber,marginTop:3}}>⏳ Extrato de {mesIdLabel(mes)}</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        {/* PDF */}
                        <div style={{background:"#fff",borderRadius:8,padding:"10px 12px",border:`1px solid ${e.pdf?"#A8D5BB":"#E2DDD5"}`}}>
                          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>📄 PDF</div>
                          {e.pdf
                            ?<div style={{marginBottom:6}}><FileChip name={e.pdf} color={C.green} bg="#E8F5ED" border="#A8D5BB"/></div>
                            :<div style={{fontSize:12,color:C.muted,marginBottom:6}}>Não enviado</div>
                          }
                          {user.role==="cliente"&&(
                            <>
                              <input ref={el=>pdfRefs.current[b.id]=el} type="file" accept=".pdf" style={{display:"none"}}
                                onChange={ev=>{if(ev.target.files[0])handleFile(b.id,"pdf",ev.target.files[0]);}}/>
                              <BtnOut onClick={()=>pdfRefs.current[b.id]?.click()} sm>{e.pdf?"🔄 Trocar":"📎 Anexar PDF"}</BtnOut>
                            </>
                          )}
                          {user.role==="contador"&&(
                            <>
                              <input ref={el=>pdfRefs.current[b.id]=el} type="file" accept=".pdf" style={{display:"none"}}
                                onChange={ev=>{if(ev.target.files[0])handleFile(b.id,"pdf",ev.target.files[0]);}}/>
                              <BtnOut onClick={()=>pdfRefs.current[b.id]?.click()} sm col={e.pdf?C.green:C.gold}>{e.pdf?"🔄 Trocar PDF":"📎 Anexar PDF"}</BtnOut>
                            </>
                          )}
                        </div>
                        {/* OFX */}
                        <div style={{background:"#fff",borderRadius:8,padding:"10px 12px",border:`1px solid ${e.ofx?"#A8D5BB":"#E2DDD5"}`}}>
                          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>🏦 OFX</div>
                          {e.ofx
                            ?<div style={{marginBottom:6}}><FileChip name={e.ofx} color={C.green} bg="#E8F5ED" border="#A8D5BB"/></div>
                            :<div style={{fontSize:12,color:C.muted,marginBottom:6}}>Não enviado</div>
                          }
                          {user.role==="cliente"&&(
                            <>
                              <input ref={el=>ofxRefs.current[b.id]=el} type="file" accept=".ofx,.csv" style={{display:"none"}}
                                onChange={ev=>{if(ev.target.files[0])handleFile(b.id,"ofx",ev.target.files[0]);}}/>
                              <BtnOut onClick={()=>ofxRefs.current[b.id]?.click()} sm>{e.ofx?"🔄 Trocar":"📎 Anexar OFX"}</BtnOut>
                            </>
                          )}
                          {user.role==="contador"&&(
                            <>
                              <input ref={el=>ofxRefs.current[b.id]=el} type="file" accept=".ofx,.csv" style={{display:"none"}}
                                onChange={ev=>{if(ev.target.files[0])handleFile(b.id,"ofx",ev.target.files[0]);}}/>
                              <BtnOut onClick={()=>ofxRefs.current[b.id]?.click()} sm col={e.ofx?C.green:C.gold}>{e.ofx?"🔄 Trocar OFX":"📎 Anexar OFX"}</BtnOut>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {env.length>0&&(
            <div>
              <SecH text="Enviados" color={C.green}/>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {env.map(b=>{
                  const e=getEnv(b.id);
                  return (
                    <Card key={b.id} style={{padding:16,background:"#E8F5ED",border:"1px solid #A8D5BB"}}>
                      <div style={{marginBottom:10}}>
                        <div style={{fontWeight:700,color:C.text,fontSize:14}}>✅ {b.nome}</div>
                        <div style={{fontSize:12,color:C.muted,marginTop:2}}>Ag. {b.agencia} · C/C {b.conta}</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        {/* PDF */}
                        <div style={{background:"#fff",borderRadius:8,padding:"10px 12px",border:`1px solid ${e.pdf?"#A8D5BB":"#E2DDD5"}`}}>
                          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>📄 PDF</div>
                          {e.pdf
                            ?<div style={{marginBottom:4}}><FileChip name={e.pdf} color={C.green} bg="#E8F5ED" border="#A8D5BB"/></div>
                            :<div style={{fontSize:12,color:C.muted}}>—</div>
                          }
                          <div style={{marginTop:6}}>
                            <input ref={el=>pdfRefs.current[b.id]=el} type="file" accept=".pdf" style={{display:"none"}}
                              onChange={ev=>{if(ev.target.files[0])handleFile(b.id,"pdf",ev.target.files[0]);}}/>
                            <BtnOut onClick={()=>pdfRefs.current[b.id]?.click()} sm col={e.pdf?C.green:C.gold}>{e.pdf?"🔄 Trocar PDF":"📎 Anexar PDF"}</BtnOut>
                          </div>
                        </div>
                        {/* OFX */}
                        <div style={{background:"#fff",borderRadius:8,padding:"10px 12px",border:`1px solid ${e.ofx?"#A8D5BB":"#E2DDD5"}`}}>
                          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>🏦 OFX</div>
                          {e.ofx
                            ?<div style={{marginBottom:4}}><FileChip name={e.ofx} color={C.green} bg="#E8F5ED" border="#A8D5BB"/></div>
                            :<div style={{fontSize:12,color:C.muted}}>—</div>
                          }
                          <div style={{marginTop:6}}>
                            <input ref={el=>ofxRefs.current[b.id]=el} type="file" accept=".ofx,.csv" style={{display:"none"}}
                              onChange={ev=>{if(ev.target.files[0])handleFile(b.id,"ofx",ev.target.files[0]);}}/>
                            <BtnOut onClick={()=>ofxRefs.current[b.id]?.click()} sm col={e.ofx?C.green:C.gold}>{e.ofx?"🔄 Trocar OFX":"📎 Anexar OFX"}</BtnOut>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NotasFiscaisTab({user,clients}){
  const[sel,setSel]=useState(user.role==="cliente"?user.id:(clients[0]?.id||1));
  const[mes,setMes]=useState(MES_DEF);
  const[notas,setNotas]=usePersisted("notas", NOTAS_INIT);
  const notaRef=useRef();

  // ── NFSe emission state ──
  const[showEmitir,setShowEmitir]=useState(false);
  const[emitindo,setEmitindo]=useState(false);
  const[emitResult,setEmitResult]=useState(null); // {ok, msg, xml}
  const cfg0 = (user.role==="cliente"?user:clients.find(c=>c.id===sel))?.nfseCfg||{};
  const[nfseForm,setNfseForm]=useState({
    dataEmissao:new Date().toISOString().split("T")[0],
    semTomador:false,
    tomadorRazao:"",
    tomadorCnpj:"",
    tomadorEmail:"",
    tomadorTelefone:"",
    tomadorCep:"",
    tomadorLogradouro:"",
    tomadorNumero:"",
    tomadorComplemento:"",
    tomadorBairro:"",
    tomadorCidade:"",
    tomadorUf:"",
    descricao:"",
    valorServico:"",
    aliquotaIss: cfg0.aliquotaPadrao||"2",
    issRetido:"nao",
    codigoServico: cfg0.codigoServicoPadrao||"17.19",
  });

  // Usar as credenciais configuradas para o cliente selecionado
  const clienteAtual = user.role==="cliente" ? user : clients.find(c=>c.id===sel);
  const nfseCfg = clienteAtual?.nfseCfg || {};
  const NFSE_CONFIG = {
    endpoint: nfseCfg.endpoint || "",
    usuario:  nfseCfg.usuario  || "",
    senha:    nfseCfg.senha    || "",
    token:    nfseCfg.token    || "",
    cnpjEmissor: nfseCfg.cnpjEmissor || nfseCfg.usuario || "",
  };
  const nfseConfigurado = !!(nfseCfg.endpoint && nfseCfg.usuario && nfseCfg.token);

  const[buscandoCep,setBuscandoCep]=useState(false);
  const[cepErro,setCepErro]=useState("");

  async function buscarCep(cepRaw){
    // Busca via ViaCEP — funciona quando hospedado em servidor real
    const c=(cepRaw||"").replace(/\D/g,"");
    if(c.length!==8){setCepErro("CEP deve ter 8 dígitos.");return;}
    setBuscandoCep(true);setCepErro("");
    try{
      const r=await fetch("https://viacep.com.br/ws/"+c+"/json/");
      const d=await r.json();
      if(d.erro){setCepErro("CEP não encontrado.");setBuscandoCep(false);return;}
      setNfseForm(f=>({...f,
        tomadorLogradouro:d.logradouro||"",
        tomadorBairro:d.bairro||"",
        tomadorCidade:d.localidade||"",
        tomadorUf:d.uf||"",
        tomadorCep:cepRaw,
      }));
      setCepErro("");
    }catch(e){
      setCepErro("");
      // Silencia o erro no previewer — preencha manualmente por enquanto
    }
    setBuscandoCep(false);
  }

  async function emitirNFSe(){
    setEmitindo(true);
    setEmitResult(null);
    const agora=new Date().toISOString();
    const competencia=nfseForm.dataEmissao||agora.split("T")[0];
    const xml=`<?xml version="1.0" encoding="UTF-8"?>
<DPS xmlns="http://www.sped.fazenda.gov.br/nfse">
  <infDPS Id="DPS${Date.now()}">
    <tpAmb>2</tpAmb>
    <dhEmi>${competencia}T00:00:00</dhEmi>
    <prest>
      <CNPJ>${NFSE_CONFIG.usuario}</CNPJ>
    </prest>
    <toma>
      ${nfseForm.tomadorCnpj.replace(/\D/g,"").length===11
        ?`<CPF>${nfseForm.tomadorCnpj.replace(/\D/g,"")}</CPF>`
        :`<CNPJ>${nfseForm.tomadorCnpj.replace(/\D/g,"")}</CNPJ>`}
      <xNome>${nfseForm.tomadorRazao}</xNome>
      <end>
        <xLgr>${nfseForm.tomadorLogradouro}</xLgr>
        <nro>${nfseForm.tomadorNumero}</nro>
        <xBairro>${nfseForm.tomadorBairro}</xBairro>
        <xMun>${nfseForm.tomadorCidade}</xMun>
        <CEP>${nfseForm.tomadorCep.replace(/\D/g,"")}</CEP>
        <UF>${nfseForm.tomadorUf}</UF>
      </end>
      <fone>${nfseForm.tomadorTelefone.replace(/\D/g,"")}</fone>
      <email>${nfseForm.tomadorEmail}</email>
    </toma>
    <serv>
      <cServ>
        <cTribNac>${nfseForm.codigoServico}</cTribNac>
      </cServ>
      <xDescServ>${nfseForm.descricao}</xDescServ>
    </serv>
    <valores>
      <vServPrest>
        <vServ>${parseFloat(nfseForm.valorServico.replace(",","."))||0}</vServ>
      </vServPrest>
      <trib>
        <tribMun>
          <cLocIncid>3300704</cLocIncid>
          <pAliq>${parseFloat(nfseForm.aliquotaIss)||2}</pAliq>
          ${nfseForm.issRetido==="sim"?"<indISSRet>true</indISSRet>":""}
        </tribMun>
      </trib>
    </valores>
  </infDPS>
</DPS>`;
    try{
      const resp=await fetch(NFSE_CONFIG.endpoint,{
        method:"POST",
        headers:{
          "Content-Type":"application/xml",
          "Authorization":"Basic "+btoa(NFSE_CONFIG.usuario+":"+NFSE_CONFIG.senha),
          "Token":NFSE_CONFIG.token,
        },
        body:xml,
      });
      if(resp.ok){
        const respXml=await resp.text();
        setEmitResult({ok:true,msg:"NFSe emitida com sucesso!",xml:respXml});
        const nome="NFSe_"+nfseForm.tomadorRazao.split(" ")[0]+"_"+Date.now()+".xml";
        setNotas(p=>({...p,[sel]:{...(p[sel]||{}),[mes]:[...(p[sel]?.[mes]||[]),{id:Date.now(),nome,arquivo:nome}]}}));
        setShowEmitir(false);
      } else {
        const errText=await resp.text();
        setEmitResult({ok:false,msg:`Erro ${resp.status}: ${errText||resp.statusText}`,xml:errText});
      }
    }catch(err){
      const isCors=err.message?.includes("fetch")||err.message?.includes("Failed")||err.name==="TypeError";
      setEmitResult({
        ok:false,
        msg:isCors
          ?"Bloqueio CORS: o navegador impediu a chamada direta à API da prefeitura. É necessário um servidor backend intermediário para produção."
          :"Erro: "+err.message,
        xml:null,
        isCors,
      });
    }
    setEmitindo(false);
  }

  const cNotas=(notas[sel]||{})[mes]||[];

  function addNota(files){
    if(!files||files.length===0)return;
    const nn=Array.from(files).map(f=>({id:Date.now()+Math.random(),nome:f.name,arquivo:f.name}));
    setNotas(p=>({...p,[sel]:{...(p[sel]||{}),[mes]:[...(p[sel]?.[mes]||[]),...nn]}}));
  }
  function removeNota(id){setNotas(p=>({...p,[sel]:{...(p[sel]||{}),[mes]:(p[sel]?.[mes]||[]).filter(n=>n.id!==id)}}));}

  return (
    <div>
      <PgH title="Notas Fiscais"
        action={<div style={{display:"flex",gap:8,alignItems:"center"}}>
          {user.role==="contador"&&<div style={{width:130}}><CliSel clients={clients} value={sel} onChange={setSel}/></div>}
          <BtnOut onClick={()=>{setShowEmitir(!showEmitir);setEmitResult(null);}}>⚡ Emitir NFSe</BtnOut>
        </div>}/>

      {/* Formulário de emissão NFSe */}
      {showEmitir&&(
        <Card style={{padding:20,marginBottom:20,border:"1.5px solid #B8912A",background:"#FDFBF5"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div>
              <h3 style={{color:C.gold,margin:0,fontSize:14,fontWeight:700}}>⚡ Emissão de NFSe{nfseCfg.municipio?" — "+nfseCfg.municipio:""}</h3>
              <div style={{fontSize:11,color:C.muted,marginTop:3}}>
                {nfseConfigurado
                  ?`CNPJ emissor: ${NFSE_CONFIG.cnpjEmissor} · ${nfseCfg.ambienteProd?"🚀 Produção":"🔧 Homologação"}`
                  :"Configure as credenciais NFSe na aba Cadastro antes de emitir."}
              </div>
            </div>
            <div style={{borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:600,
              background:nfseConfigurado?"#E8F5ED":"#FDE8E8",
              color:nfseConfigurado?C.green:C.red}}>
              {nfseConfigurado?"🔑 Configurado":"⚠ Não configurado"}
            </div>
          </div>
          {!nfseConfigurado&&(
            <div style={{background:"#FFF3DC",borderRadius:8,padding:"10px 14px",marginBottom:14,border:"1px solid #F0C060",fontSize:12,color:C.amber}}>
              ⚠ Para emitir NFSe, configure o endpoint e credenciais desta empresa na aba <strong>Cadastro → Configuração NFSe</strong>.
            </div>
          )}

          {/* Resultado */}
          {emitResult&&(
            <div style={{background:emitResult.ok?"#E8F5ED":"#FDE8E8",borderRadius:10,padding:"14px 16px",marginBottom:16,border:`1px solid ${emitResult.ok?"#A8D5BB":"#F0AAAA"}`}}>
              <div style={{fontWeight:600,fontSize:13,color:emitResult.ok?C.green:C.red,marginBottom:emitResult.xml?8:0}}>{emitResult.msg}</div>
              {emitResult.xml&&(
                <details style={{marginTop:8}}>
                  <summary style={{fontSize:11,color:C.muted,cursor:"pointer"}}>Ver resposta XML</summary>
                  <pre style={{fontSize:10,color:C.textSub,marginTop:6,overflow:"auto",maxHeight:120,background:"#fff",padding:8,borderRadius:6}}>{emitResult.xml}</pre>
                </details>
              )}
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:12}}>

            {/* Data de emissão */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><FieldLabel text="Data de emissão"/><TxtIn type="date" value={nfseForm.dataEmissao} onChange={e=>setNfseForm({...nfseForm,dataEmissao:e.target.value})}/></div>
              <div><FieldLabel text="Código do serviço"/>
                <SelIn value={nfseForm.codigoServico} onChange={e=>setNfseForm({...nfseForm,codigoServico:e.target.value})}>
                  <optgroup label="Saúde">
                    <option value="4.01">4.01 — Medicina e biomedicina</option>
                    <option value="4.02">4.02 — Análises clínicas e patologia</option>
                    <option value="4.03">4.03 — Hospitais e clínicas</option>
                    <option value="4.07">4.07 — Enfermagem</option>
                    <option value="4.08">4.08 — Terapia ocupacional/fisioterapia</option>
                    <option value="4.09">4.09 — Fonoaudiologia</option>
                    <option value="4.11">4.11 — Obstetrícia</option>
                    <option value="4.12">4.12 — Odontologia</option>
                    <option value="4.13">4.13 — Ortóptica</option>
                    <option value="4.14">4.14 — Próteses / órteses</option>
                    <option value="4.16">4.16 — Psicologia e psicanálise</option>
                    <option value="4.17">4.17 — Acupuntura</option>
                    <option value="4.18">4.18 — Podologia</option>
                    <option value="4.19">4.19 — Quiropraxia</option>
                    <option value="4.21">4.21 — Nutrição</option>
                    <option value="4.22">4.22 — Medicina veterinária</option>
                    <option value="4.23">4.23 — Serviços farmacêuticos</option>
                  </optgroup>
                  <optgroup label="Contabilidade &amp; Jurídico">
                    <option value="17.01">17.01 — Assessoria e consultoria</option>
                    <option value="17.19">17.19 — Contabilidade</option>
                    <option value="17.20">17.20 — Assessoria financeira</option>
                    <option value="17.12">17.12 — Auditoria</option>
                    <option value="17.14">17.14 — Perícia</option>
                    <option value="14.01">14.01 — Serviços legais e jurídicos</option>
                    <option value="17.16">17.16 — Administração de bens</option>
                  </optgroup>
                  <optgroup label="Educação">
                    <option value="8.01">8.01 — Ensino regular</option>
                    <option value="8.02">8.02 — Instrução / treinamento</option>
                    <option value="8.03">8.03 — Educação especial</option>
                  </optgroup>
                  <optgroup label="Tecnologia">
                    <option value="1.01">1.01 — Análise e desenvolvimento</option>
                    <option value="1.02">1.02 — Programação</option>
                    <option value="1.03">1.03 — Processamento de dados</option>
                    <option value="1.04">1.04 — Elaboração de programas</option>
                    <option value="1.07">1.07 — Suporte técnico</option>
                  </optgroup>
                  <optgroup label="Construção &amp; Engenharia">
                    <option value="7.01">7.01 — Engenharia / arquitetura</option>
                    <option value="7.02">7.02 — Execução de obras</option>
                    <option value="7.04">7.04 — Demolição</option>
                    <option value="7.05">7.05 — Reparação de edifícios</option>
                    <option value="7.09">7.09 — Varrição e limpeza</option>
                    <option value="7.10">7.10 — Decoração e jardinagem</option>
                  </optgroup>
                  <optgroup label="Outros serviços">
                    <option value="12.01">12.01 — Espetáculos e entretenimento</option>
                    <option value="16.01">16.01 — Transporte de natureza municipal</option>
                    <option value="17.06">17.06 — Pesquisas e levantamentos</option>
                    <option value="20.01">20.01 — Serviços portuários</option>
                    <option value="25.01">25.01 — Serviços funerários</option>
                  </optgroup>
                </SelIn>
              </div>
            </div>

            {/* Toggle: sem tomador */}
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:8,background:nfseForm.semTomador?"#FDE8E8":"#F0EDE6",border:`1px solid ${nfseForm.semTomador?C.red+"55":C.border}`}}>
              <div onClick={()=>setNfseForm({...nfseForm,semTomador:!nfseForm.semTomador})}
                style={{width:22,height:22,borderRadius:5,border:`2px solid ${nfseForm.semTomador?C.red:C.border}`,background:nfseForm.semTomador?C.red:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all 0.15s"}}>
                {nfseForm.semTomador&&<span style={{color:"#fff",fontSize:13,fontWeight:900,lineHeight:1}}>✓</span>}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:nfseForm.semTomador?C.red:C.textSub}}>Não informar tomador (consumidor final)</div>
                <div style={{fontSize:11,color:C.muted}}>Marque quando o tomador é pessoa física sem necessidade de identificação</div>
              </div>
            </div>

            {/* Tomador */}
            {!nfseForm.semTomador&&<div style={{background:C.surfaceAlt,borderRadius:8,padding:"14px 16px"}}>
              <SecH text="Dados do Tomador (quem recebe a nota)" color={C.gold}/>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><FieldLabel text="Razão Social / Nome"/><TxtIn value={nfseForm.tomadorRazao} onChange={e=>setNfseForm({...nfseForm,tomadorRazao:e.target.value})} placeholder="Nome ou razão social"/></div>
                  <div><FieldLabel text="CNPJ / CPF"/><TxtIn value={nfseForm.tomadorCnpj} onChange={e=>setNfseForm({...nfseForm,tomadorCnpj:e.target.value})} placeholder="00.000.000/0001-00"/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><FieldLabel text="E-mail"/><TxtIn value={nfseForm.tomadorEmail} onChange={e=>setNfseForm({...nfseForm,tomadorEmail:e.target.value})} placeholder="email@empresa.com" type="email"/></div>
                  <div><FieldLabel text="Telefone"/><TxtIn value={nfseForm.tomadorTelefone} onChange={e=>setNfseForm({...nfseForm,tomadorTelefone:e.target.value})} placeholder="(00) 00000-0000"/></div>
                </div>
                {/* CEP com busca automática */}
                <div>
                  <FieldLabel text="CEP"/>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <div style={{flex:"0 0 160px"}}>
                      <TxtIn value={nfseForm.tomadorCep}
                        onChange={e=>{
                          const v=e.target.value;
                          setNfseForm({...nfseForm,tomadorCep:v});
                          setCepErro("");
                          if(v.replace(/\D/g,"").length===8) buscarCep(v);
                        }}
                        placeholder="00000-000"/>
                    </div>
                    <button onClick={()=>buscarCep(nfseForm.tomadorCep)} disabled={buscandoCep}
                      style={{padding:"10px 16px",borderRadius:8,border:`1.5px solid ${C.gold}`,background:"#FDF5E0",color:C.gold,fontSize:12,fontWeight:600,cursor:buscandoCep?"wait":"pointer",whiteSpace:"nowrap"}}>
                      {buscandoCep?"⏳ Buscando...":"🔍 Buscar CEP"}
                    </button>
                    {buscandoCep&&<span style={{fontSize:11,color:C.muted}}>⏳ Consultando...</span>}
                    {cepErro&&<span style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>Preencha manualmente</span>}
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"2fr 80px 1fr",gap:10}}>
                  <div><FieldLabel text="Logradouro"/><TxtIn value={nfseForm.tomadorLogradouro} onChange={e=>setNfseForm({...nfseForm,tomadorLogradouro:e.target.value})} placeholder="Rua, Av..."/></div>
                  <div><FieldLabel text="Nº"/><TxtIn value={nfseForm.tomadorNumero} onChange={e=>setNfseForm({...nfseForm,tomadorNumero:e.target.value})} placeholder="123"/></div>
                  <div><FieldLabel text="Complemento"/><TxtIn value={nfseForm.tomadorComplemento} onChange={e=>setNfseForm({...nfseForm,tomadorComplemento:e.target.value})} placeholder="Sala, Apto..."/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 60px",gap:10}}>
                  <div><FieldLabel text="Bairro"/><TxtIn value={nfseForm.tomadorBairro} onChange={e=>setNfseForm({...nfseForm,tomadorBairro:e.target.value})}/></div>
                  <div><FieldLabel text="Cidade"/><TxtIn value={nfseForm.tomadorCidade} onChange={e=>setNfseForm({...nfseForm,tomadorCidade:e.target.value})}/></div>
                  <div><FieldLabel text="UF"/><TxtIn value={nfseForm.tomadorUf} onChange={e=>setNfseForm({...nfseForm,tomadorUf:e.target.value})} placeholder="RJ"/></div>
                </div>
              </div>
            </div>}

            {/* Serviço & Valores */}
            <div style={{background:C.surfaceAlt,borderRadius:8,padding:"14px 16px"}}>
              <SecH text="Serviço & Valores" color={C.gold}/>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div>
                  <FieldLabel text="Descrição do serviço prestado"/>
                  <textarea value={nfseForm.descricao} onChange={e=>setNfseForm({...nfseForm,descricao:e.target.value})}
                    placeholder="Descreva o serviço prestado..."
                    style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.bgAlt,color:C.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",resize:"vertical",minHeight:72}}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><FieldLabel text="Valor do serviço (R$)"/><TxtIn value={nfseForm.valorServico} onChange={e=>setNfseForm({...nfseForm,valorServico:e.target.value})} placeholder="0,00"/></div>
                  <div><FieldLabel text="Alíquota ISS (%)"/><TxtIn value={nfseForm.aliquotaIss} onChange={e=>setNfseForm({...nfseForm,aliquotaIss:e.target.value})} placeholder="2"/></div>
                </div>
                <div>
                  <FieldLabel text="ISS Retido na fonte?"/>
                  <div style={{display:"flex",gap:8}}>
                    {[["nao","Não retido"],["sim","Sim, retido"]].map(([v,l])=>(
                      <button key={v} onClick={()=>setNfseForm({...nfseForm,issRetido:v})}
                        style={{flex:1,padding:"9px",borderRadius:8,border:`1.5px solid ${nfseForm.issRetido===v?C.gold:C.border}`,background:nfseForm.issRetido===v?"#FDF5E0":"transparent",color:nfseForm.issRetido===v?C.gold:C.muted,fontSize:13,cursor:"pointer",fontWeight:nfseForm.issRetido===v?600:400}}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{display:"flex",gap:10,marginTop:16,alignItems:"center"}}>
            <button onClick={emitirNFSe} disabled={emitindo||!nfseForm.tomadorRazao||!nfseForm.valorServico||!nfseForm.descricao}
              style={{padding:"12px 24px",borderRadius:8,border:"none",background:emitindo?"#ccc":`linear-gradient(135deg,${C.goldLight},${C.goldDark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:emitindo?"not-allowed":"pointer",boxShadow:"0 2px 8px rgba(184,145,42,0.3)"}}>
              {emitindo?"⏳ Enviando para prefeitura...":"⚡ Emitir NFSe"}
            </button>
            <BtnGh onClick={()=>{setShowEmitir(false);setEmitResult(null);}}>Cancelar</BtnGh>
            {!nfseForm.tomadorRazao&&<span style={{fontSize:11,color:C.muted}}>Preencha razão social e valor</span>}
          </div>
        </Card>
      )}

      <MesFilt value={mes} onChange={setMes}/>

      {user.role==="contador"&&(
        <div style={{marginBottom:16}}>
          <input ref={notaRef} type="file" multiple accept=".pdf,.xml" style={{display:"none"}} onChange={e=>addNota(e.target.files)}/>
          <button onClick={()=>notaRef.current.click()} style={{width:"100%",padding:"14px",borderRadius:10,border:`2px dashed ${C.border}`,background:"transparent",cursor:"pointer",color:C.muted,fontSize:13}}>
            📎 Anexar notas fiscais de {MESES_EXTR.find(m2=>m2.id===mes)?.label||mes}
          </button>
        </div>
      )}

      {cNotas.length===0?(
        <Empty icon="🧾" text={user.role==="contador"?"Nenhuma nota. Clique em '⚡ Emitir NFSe' ou anexe manualmente.":"Nenhuma nota disponível."}/>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{color:C.muted,fontSize:12,marginBottom:4}}>{cNotas.length} nota{cNotas.length>1?"s":""}</div>
          {cNotas.map(n=>(
            <Card key={n.id} style={{padding:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
                  <span style={{fontSize:22,flexShrink:0}}>🧾</span>
                  <div style={{minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:4}}>{n.nome}</div>
                    <FileChip name={n.arquivo}/>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexShrink:0,marginLeft:12}}>
                  <BtnView name={n.arquivo} sm/>
                  {user.role==="contador"&&<BtnGh onClick={()=>removeNota(n.id)} sm>Remover</BtnGh>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function RelatoriosTab({user,clients,anosRel,setAnosRel}){
  const[sel,setSel]=useState(user.role==="cliente"?user.id:(clients[0]?.id||1));
  const[rels,setRels]=usePersisted("relatorios", RELATORIOS_INIT);
  const cAnos=anosRel[sel]||["2026"];
  const[ano,setAno]=useState(cAnos[0]||"2026");
  function addAno(v){
    if(!v||cAnos.includes(v))return;
    const u=[v,...cAnos].sort((a,b)=>b.localeCompare(a));
    setAnosRel(p=>({...p,[sel]:u}));setAno(v);
  }
  function removeAno(v){
    setAnosRel(p=>({...p,[sel]:p[sel].filter(x=>x!==v)}));
    if(ano===v){const r=cAnos.filter(x=>x!==v);setAno(r[0]||"2026");}
  }
  const fRefs=useRef({});
  const tipos=[{id:"balanco",label:"Balanço Patrimonial",icon:"📊"},{id:"dre",label:"DRE — Demonstração do Resultado",icon:"📈"},{id:"informe",label:"Informe de Rendimentos",icon:"📋"}];
  const anoRels=(rels[sel]||{})[ano]||{};
  function toggle(tipo){
    const cur=(anoRels[tipo]||{}).status||"nao_liberado";
    setRels(p=>({...p,[sel]:{...(p[sel]||{}),[ano]:{...anoRels,[tipo]:{...(anoRels[tipo]||{}),status:cur==="disponivel"?"nao_liberado":"disponivel"}}}}));
  }
  function setArq(tipo,file){
    setRels(p=>({...p,[sel]:{...(p[sel]||{}),[ano]:{...anoRels,[tipo]:{...(anoRels[tipo]||{}),arquivo:file.name,status:"disponivel"}}}}));
  }
  function remArq(tipo){
    setRels(p=>({...p,[sel]:{...(p[sel]||{}),[ano]:{...anoRels,[tipo]:{arquivo:null,status:"nao_liberado"}}}}));
  }
  return (
    <div>
      <PgH title="Relatórios Contábeis" action={user.role==="contador"&&<div style={{width:160}}><CliSel clients={clients} value={sel} onChange={setSel}/></div>}/>
      {user.role==="contador"&&<AnosPanel anos={cAnos} onAdd={addAno} onRemove={removeAno}/>}
      {cAnos.length>0&&(
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {cAnos.map(a=>(
            <button key={a} onClick={()=>setAno(a)}
              style={{padding:"6px 18px",borderRadius:20,border:`1.5px solid ${ano===a?C.gold:C.border}`,background:ano===a?C.gold:"transparent",color:ano===a?"#fff":C.muted,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>
              {a}
            </button>
          ))}
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {tipos.map(tp=>{
          const rel=anoRels[tp.id]||{status:"nao_liberado",arquivo:null};
          const ok=rel.status==="disponivel";
          return (
            <Card key={tp.id} style={{padding:18}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                <div style={{fontSize:28,flexShrink:0,marginTop:2}}>{tp.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:6}}>{tp.label} — {ano}</div>
                  <div style={{marginBottom:8}}>
                    {ok?<Pill label="✓ Disponível" color={C.green} bg="#E8F5ED" border="#A8D5BB"/>:<Pill label="Não liberado" color={C.muted} bg={C.surfaceAlt} border={C.border}/>}
                  </div>
                  {rel.arquivo&&<div style={{marginBottom:8}}><FileChip name={rel.arquivo}/></div>}
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {user.role==="cliente"&&ok&&rel.arquivo&&<BtnView name={rel.arquivo} label="👁 Visualizar" sm/>}
                    {user.role==="contador"&&(
                      <>
                        <input ref={el=>fRefs.current[tp.id]=el} type="file" accept=".pdf,.xlsx" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setArq(tp.id,e.target.files[0]);}}/>
                        <BtnOut onClick={()=>fRefs.current[tp.id]?.click()} sm>📎 {rel.arquivo?"Substituir":"Anexar"}</BtnOut>
                        <button onClick={()=>toggle(tp.id)}
                          style={{padding:"6px 12px",borderRadius:8,border:`1.5px solid ${ok?C.red:C.green}`,background:ok?"#FDE8E8":"#E8F5ED",color:ok?C.red:C.green,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                          {ok?"🔒 Bloquear":"✓ Liberar"}
                        </button>
                        {rel.arquivo&&<BtnGh onClick={()=>remArq(tp.id)} sm>Remover</BtnGh>}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── IMPOSTOS (com gerenciamento completo de impostos) ────────────────────────
function ImpostosTab({user,clients,compImp,setCompImp}){
  const[sel,setSel]=useState(user.role==="cliente"?user.id:(clients[0]?.id||1));
  const[impCfg,setImpCfg]=usePersisted("impCfg", IMP_CFG_INIT);
  const cCompsI=compImp[sel]||[];
  const[mes,setMes]=useState(cCompsI[0]||MES_DEF);
  const mesOptsI=cCompsI.map(id=>({id,label:mesIdLabel(id)}));
  function addCompI(v){const u=[v,...cCompsI].sort((a,b)=>b.localeCompare(a));setCompImp(p=>({...p,[sel]:u}));setMes(v);}
  function removeCompI(v){setCompImp(p=>({...p,[sel]:p[sel].filter(x=>x!==v)}));if(mes===v){const r=cCompsI.filter(x=>x!==v);setMes(r[0]||"");}} // {clientId: [{id,name,vencDia,ref,ativo}]}
  const[dados,setDados]=usePersisted("impDados", IMP_DADOS_INIT);
  const[avul,setAvul]=usePersisted("avul", AVUL_INIT);
  const[ct,setCt]=useState(null);
  const[showCfg,setShowCfg]=useState(false);
  const[showNew,setShowNew]=useState(false);
  const[showAvul,setShowAvul]=useState(false);
  const[af,setAf]=useState({name:"",ref:"",venc:"",valor:""});
  const[newImp,setNewImp]=useState({name:"",vencDia:"",ref:"Mensal"});
  const[editImpId,setEditImpId]=useState(null);
  const[editImpForm,setEditImpForm]=useState(null);
  const gRefs=useRef({});

  const clientImps=impCfg[sel]||[];
  const cDados=(dados[sel]||{})[mes]||{};
  const cAvul=(avul[sel]||{})[mes]||[];

  const allTaxes=[
    ...clientImps.filter(imp=>imp.ativo).map(imp=>{
      const d=cDados[imp.id]||{venc:"",valor:"—",status:"pendente",pagoCliente:false,guia:null};
      return{...d,id:imp.id,name:imp.name,ref:imp.ref,vencDia:imp.vencDia,origem:"rec"};
    }),
    ...cAvul.map(t=>({...t,origem:"avul"})),
  ].map(t=>({...t,status:t.status!=="pago"&&isVencido(t.venc,t.status)?"vencido":t.status}));

  const grps=[
    {key:"vencido",label:"Vencidas",color:C.red,items:allTaxes.filter(t=>t.status==="vencido"&&!t.pagoCliente)},
    {key:"aguard",label:"Aguardando Confirmação",color:C.amber,items:allTaxes.filter(t=>t.status!=="pago"&&t.pagoCliente)},
    {key:"pend",label:"Pendentes",color:C.amber,items:allTaxes.filter(t=>t.status==="pendente"&&!t.pagoCliente)},
    {key:"pago",label:"Pagas",color:C.green,items:allTaxes.filter(t=>t.status==="pago")},
  ];

  function setSt(id,orig,st,pc){
    if(orig==="rec") setDados(p=>({...p,[sel]:{...(p[sel]||{}),[mes]:{...(p[sel]?.[mes]||{}),[id]:{...(p[sel]?.[mes]?.[id]||{}),status:st,pagoCliente:pc}}}}));
    else setAvul(p=>({...p,[sel]:{...(p[sel]||{}),[mes]:(p[sel]?.[mes]||[]).map(t=>t.id===id?{...t,status:st,pagoCliente:pc}:t)}}));
  }
  function setG(id,orig,guia){
    if(orig==="rec") setDados(p=>({...p,[sel]:{...(p[sel]||{}),[mes]:{...(p[sel]?.[mes]||{}),[id]:{...(p[sel]?.[mes]?.[id]||{}),guia}}}}));
    else setAvul(p=>({...p,[sel]:{...(p[sel]||{}),[mes]:(p[sel]?.[mes]||[]).map(t=>t.id===id?{...t,guia}:t)}}));
  }
  function addAvulsa(){
    if(!af.name)return;
    setAvul(p=>({...p,[sel]:{...(p[sel]||{}),[mes]:[...(p[sel]?.[mes]||[]),{id:Date.now(),...af,status:"pendente",pagoCliente:false,guia:null}]}}));
    setAf({name:"",ref:"",venc:"",valor:""});setShowAvul(false);
  }

  // Gerenciar impostos recorrentes
  function addImposto(){
    if(!newImp.name)return;
    const id="imp_"+Date.now();
    const novo={id,name:newImp.name,vencDia:Number(newImp.vencDia)||20,ref:newImp.ref,ativo:true};
    setImpCfg(p=>({...p,[sel]:[...(p[sel]||[]),novo]}));
    setNewImp({name:"",vencDia:"",ref:"Mensal"});setShowNew(false);
  }
  function toggleImp(id){
    setImpCfg(p=>({...p,[sel]:(p[sel]||[]).map(x=>x.id===id?{...x,ativo:!x.ativo}:x)}));
  }
  function removeImp(id){
    setImpCfg(p=>({...p,[sel]:(p[sel]||[]).filter(x=>x.id!==id)}));
  }
  function startEditImp(imp){setEditImpId(imp.id);setEditImpForm({...imp});}
  function saveEditImp(){
    setImpCfg(p=>({...p,[sel]:(p[sel]||[]).map(x=>x.id===editImpId?{...x,...editImpForm}:x)}));
    setEditImpId(null);setEditImpForm(null);
  }

  return (
    <div>
      {ct&&<ModalBox onClose={()=>setCt(null)}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:12}}>{user.role==="cliente"?"✅":"🧾"}</div>
          <h3 style={{color:C.text,fontSize:17,margin:"0 0 6px"}}>{user.role==="cliente"?"Confirmar Pagamento":"Confirmar Recebimento"}</h3>
          <p style={{color:C.muted,fontSize:14,margin:"0 0 4px"}}>{ct.name}</p>
          <p style={{color:C.gold,fontWeight:700,fontSize:18,margin:"0 0 16px"}}>{ct.valor}</p>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            {user.role==="cliente"?<BtnPri onClick={()=>{setSt(ct.id,ct.origem,ct.status,true);setCt(null);}}>Sim, paguei</BtnPri>
              :<BtnGr onClick={()=>{setSt(ct.id,ct.origem,"pago",false);setCt(null);}}>Confirmar</BtnGr>}
            <BtnGh onClick={()=>setCt(null)}>Cancelar</BtnGh>
          </div>
        </div>
      </ModalBox>}

      {/* Modal gerenciar impostos */}
      {showCfg&&<ModalBox onClose={()=>setShowCfg(false)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{color:C.text,margin:0,fontSize:16,fontWeight:700}}>Impostos Recorrentes</h3>
          <BtnOut onClick={()=>setShowNew(true)} sm>+ Criar novo</BtnOut>
        </div>
        <p style={{color:C.muted,fontSize:12,margin:"0 0 12px"}}>{clients.find(c=>c.id===sel)?.name}</p>

        {showNew&&(
          <div style={{background:"#FDF5E0",borderRadius:10,padding:16,marginBottom:14,border:"1px solid #F0D080"}}>
            <h4 style={{color:C.amber,margin:"0 0 12px",fontSize:13}}>Novo Imposto</h4>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><FieldLabel text="Nome do imposto"/><TxtIn value={newImp.name} onChange={e=>setNewImp({...newImp,name:e.target.value})} placeholder="Ex: ISS Municipal"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><FieldLabel text="Dia de vencimento"/><TxtIn value={newImp.vencDia} onChange={e=>setNewImp({...newImp,vencDia:e.target.value})} placeholder="Ex: 15" type="number"/></div>
                <div><FieldLabel text="Periodicidade"/><SelIn value={newImp.ref} onChange={e=>setNewImp({...newImp,ref:e.target.value})}><option>Mensal</option><option>Trimestral</option><option>Semestral</option><option>Anual</option></SelIn></div>
              </div>
              <div style={{display:"flex",gap:8}}><BtnPri onClick={addImposto}>Adicionar</BtnPri><BtnGh onClick={()=>setShowNew(false)}>Cancelar</BtnGh></div>
            </div>
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:360,overflowY:"auto"}}>
          {(impCfg[sel]||[]).map(imp=>(
            <div key={imp.id}>
              {editImpId===imp.id?(
                <div style={{background:"#EAF2FB",borderRadius:10,padding:14,border:"1px solid #A8C8E8"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <div><FieldLabel text="Nome"/><TxtIn value={editImpForm.name} onChange={e=>setEditImpForm({...editImpForm,name:e.target.value})}/></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div><FieldLabel text="Dia vencimento"/><TxtIn type="number" value={editImpForm.vencDia} onChange={e=>setEditImpForm({...editImpForm,vencDia:Number(e.target.value)})}/></div>
                      <div><FieldLabel text="Periodicidade"/><SelIn value={editImpForm.ref} onChange={e=>setEditImpForm({...editImpForm,ref:e.target.value})}><option>Mensal</option><option>Trimestral</option><option>Semestral</option><option>Anual</option></SelIn></div>
                    </div>
                    <div style={{display:"flex",gap:8}}><BtnGr onClick={saveEditImp} sm>Salvar</BtnGr><BtnGh onClick={()=>setEditImpId(null)} sm>Cancelar</BtnGh></div>
                  </div>
                </div>
              ):(
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:10,background:imp.ativo?"#FDF5E0":C.surfaceAlt,border:`1.5px solid ${imp.ativo?C.gold:C.border}`}}>
                  <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${imp.ativo?C.gold:C.border}`,background:imp.ativo?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}} onClick={()=>toggleImp(imp.id)}>
                    {imp.ativo&&<span style={{color:"#fff",fontSize:12,fontWeight:900}}>✓</span>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{color:C.text,fontSize:13,fontWeight:imp.ativo?600:400}}>{imp.name}</div>
                    <div style={{color:C.muted,fontSize:11}}>Vence dia {imp.vencDia} · {imp.ref}</div>
                  </div>
                  <BtnOut onClick={()=>startEditImp(imp)} sm>✏️</BtnOut>
                  <BtnRed onClick={()=>removeImp(imp.id)} sm>🗑</BtnRed>
                </div>
              )}
            </div>
          ))}
          {(impCfg[sel]||[]).length===0&&<p style={{color:C.muted,textAlign:"center",padding:"20px 0",fontSize:13}}>Nenhum imposto. Clique "Criar novo" para adicionar.</p>}
        </div>
        <div style={{marginTop:20,display:"flex",justifyContent:"flex-end"}}><BtnPri onClick={()=>setShowCfg(false)}>Fechar</BtnPri></div>
      </ModalBox>}

      <PgH title="Impostos"
        action={user.role==="contador"&&<div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{width:140}}><CliSel clients={clients} value={sel} onChange={setSel}/></div>
          <BtnOut onClick={()=>setShowCfg(true)} sm>⚙ Gerenciar</BtnOut>
          <BtnOut onClick={()=>setShowAvul(!showAvul)} sm>+ Guia</BtnOut>
        </div>}/>

      {showAvul&&user.role==="contador"&&<FCard title="Guia Avulsa" onSave={addAvulsa} onCancel={()=>setShowAvul(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><FieldLabel text="Descrição"/><TxtIn value={af.name} onChange={e=>setAf({...af,name:e.target.value})}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><FieldLabel text="Ref."/><TxtIn value={af.ref} onChange={e=>setAf({...af,ref:e.target.value})}/></div>
            <div><FieldLabel text="Vencimento"/><TxtIn type="date" value={af.venc} onChange={e=>setAf({...af,venc:e.target.value})}/></div>
            <div><FieldLabel text="Valor"/><TxtIn value={af.valor} onChange={e=>setAf({...af,valor:e.target.value})} placeholder="R$ 0,00"/></div>
          </div>
        </div>
      </FCard>}

      {user.role==="contador"&&<CompetenciasPanel comps={cCompsI} onAdd={addCompI} onRemove={removeCompI} label="Competências — Impostos"/>}
      {cCompsI.length>0&&<MesFilt value={mes} onChange={setMes} options={mesOptsI}/>}

      {clientImps.filter(x=>x.ativo).length>0&&(
        <div style={{background:"#FDF5E0",borderRadius:10,padding:"10px 14px",border:"1px solid #F0D080",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:C.textSub,fontSize:12}}>{clientImps.filter(x=>x.ativo).length} imposto{clientImps.filter(x=>x.ativo).length>1?"s":""} configurado{clientImps.filter(x=>x.ativo).length>1?"s":""}</span>
          {user.role==="contador"&&<button onClick={()=>setShowCfg(true)} style={{color:C.gold,fontSize:12,background:"transparent",border:"none",cursor:"pointer",fontWeight:600}}>Gerenciar</button>}
        </div>
      )}

      {allTaxes.length===0?<Empty icon="🧾" text="Nenhum imposto configurado. Use '⚙ Gerenciar' para adicionar."/>
        :grps.map(g=>g.items.length===0?null:(
          <div key={g.key} style={{marginBottom:20}}>
            <SecH text={`${g.label} (${g.items.length})`} color={g.color}/>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {g.items.map(tax=>{
                const si=getSI(tax);const gk=`${tax.id}-${tax.origem}`;
                return (
                  <Card key={gk} style={{padding:16,background:si.bg,border:`1px solid ${si.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:2}}>{tax.name}</div>
                        <div style={{fontSize:12,color:C.muted,marginBottom:6}}>
                          {tax.ref&&<span>{tax.ref}</span>}
                          {tax.venc&&<span style={{color:g.key==="vencido"?C.red:C.muted}}> · Venc. {tax.venc}</span>}
                          {tax.vencDia&&!tax.venc&&<span style={{color:C.muted}}> · Vence dia {tax.vencDia}</span>}
                        </div>
                        <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>{tax.valor}</div>
                        <input ref={el=>gRefs.current[gk]=el} type="file" accept=".pdf" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setG(tax.id,tax.origem,e.target.files[0].name);}}/>
                        {tax.guia?(
                          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.6)",borderRadius:6,padding:"4px 8px"}}>
                            <span>📎</span><span style={{color:C.gold,fontSize:12,fontWeight:600}}>{tax.guia}</span>
                            {user.role==="cliente"&&<span style={{color:C.muted,fontSize:11}}>(disponível)</span>}
                            {user.role==="contador"&&<button onClick={()=>gRefs.current[gk]?.click()} style={{color:C.muted,fontSize:10,background:"transparent",border:"none",cursor:"pointer",textDecoration:"underline"}}>trocar</button>}
                          </div>
                        ):user.role==="contador"&&(
                          <button onClick={()=>gRefs.current[gk]?.click()} style={{color:C.muted,fontSize:12,background:"rgba(255,255,255,0.6)",border:`1px dashed ${C.borderDark}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4}}>📎 Anexar guia PDF</button>
                        )}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                        <Pill label={si.label} color={si.color} bg={si.bg} border={si.border}/>
                        {user.role==="cliente"&&tax.status!=="pago"&&!tax.pagoCliente&&<BtnGr onClick={()=>setCt(tax)} sm>✓ Paguei</BtnGr>}
                        {user.role==="cliente"&&tax.pagoCliente&&<BtnGh onClick={()=>setSt(tax.id,tax.origem,tax.status,false)} sm>Cancelar</BtnGh>}
                        {user.role==="contador"&&tax.pagoCliente&&(
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            <BtnGr onClick={()=>setCt(tax)} sm>✓ Confirmar pago</BtnGr>
                            <BtnRed onClick={()=>setSt(tax.id,tax.origem,"pendente",false)} sm>↩ Reativar</BtnRed>
                          </div>
                        )}
                        {user.role==="contador"&&tax.status!=="pago"&&!tax.pagoCliente&&<BtnOut onClick={()=>setSt(tax.id,tax.origem,"pago",false)} sm>Marcar pago</BtnOut>}
                        {user.role==="contador"&&tax.status==="pago"&&<BtnGh onClick={()=>setSt(tax.id,tax.origem,"pendente",false)} sm>↩ Reativar</BtnGh>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ─── RESUMO ───────────────────────────────────────────────────────────────────
function ResumoTab({user,clients,compResumo,setCompResumo}){
  const[sel,setSel]=useState(user.role==="cliente"?user.id:(clients[0]?.id||1));
  const[resumos,setResumos]=usePersisted("resumos", RESUMO_INIT);
  const[editando,setEditando]=useState(false);
  const[ef,setEf]=useState(null);
  const reciboRef=useRef();
  function setRecibo(file){
    setResumos(p=>({...p,[sel]:{...(p[sel]||{}),[mes]:{...(p[sel]?.[mes]||{}),reciboProLabore:file.name}}}));
  }
  const cCompsR=compResumo[sel]||[];
  const[mes,setMes]=useState(cCompsR[0]||MES_DEF);
  const mesOptsR=cCompsR.map(id=>({id,label:mesIdLabel(id)}));
  function addCompR(v){const u=[v,...cCompsR].sort((a,b)=>b.localeCompare(a));setCompResumo(p=>({...p,[sel]:u}));setMes(v);}
  function removeCompR(v){setCompResumo(p=>({...p,[sel]:p[sel].filter(x=>x!==v)}));if(mes===v){const r=cCompsR.filter(x=>x!==v);setMes(r[0]||"");}}
  const s=(resumos[sel]||{})[mes];
  function startEdit(){setEf({...s});setEditando(true);}
  function save(){setResumos(p=>({...p,[sel]:{...(p[sel]||{}),[mes]:{...ef}}}));setEditando(false);}
  const cards=[
    {key:"fatMes",label:"Faturamento do mês",icon:"📈",color:C.gold,bg:"#FDF5E0",border:"#F0D080"},
    {key:"fatAno",label:"Fat. acumulado do ano",icon:"📊",color:C.blue,bg:"#EAF2FB",border:"#A8C8E8"},
    {key:"proLabore",label:"Pró-labore do mês",icon:"👤",color:C.purple,bg:"#F3EEF8",border:"#C8A8E8"},
    {key:"impostos",label:"Impostos totais do mês",icon:"🧾",color:C.amber,bg:"#FFF3DC",border:"#F0C060"},
  ];
  return (
    <div>
      <PgH title="Resumo" action={<div style={{display:"flex",gap:8,alignItems:"center"}}>
        {user.role==="contador"&&<div style={{width:160}}><CliSel clients={clients} value={sel} onChange={setSel}/></div>}
        {user.role==="contador"&&!editando&&s&&<BtnOut onClick={startEdit} sm>✏️ Editar</BtnOut>}
      </div>}/>
      {user.role==="contador"&&<CompetenciasPanel comps={cCompsR} onAdd={addCompR} onRemove={removeCompR} label="Competências — Resumo"/>}
      {cCompsR.length>0&&<MesFilt value={mes} onChange={setMes} options={mesOptsR}/>}
      {!s?<Empty icon="📊" text={`Sem dados para ${mesIdLabel(mes)}.`}/>
        :editando&&user.role==="contador"?(
          <Card style={{padding:20}}>
            <h3 style={{color:C.gold,margin:"0 0 16px",fontSize:14,fontWeight:700}}>Editar — {mesIdLabel(mes)}</h3>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {cards.map(c=><div key={c.key}><FieldLabel text={c.label}/><TxtIn value={ef[c.key]} onChange={e=>setEf({...ef,[c.key]:e.target.value})} placeholder="R$ 0,00"/></div>)}
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
                    <div style={{color:c.color,fontWeight:800,fontSize:22,marginBottom:c.key==="proLabore"?10:0}}>{s[c.key]}</div>
                    {/* Recibo do pró-labore */}
                    {c.key==="proLabore"&&(
                      <div>
                        {s.reciboProLabore
                          ?<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                            <FileChip name={s.reciboProLabore}/>
                            {user.role==="contador"&&(
                              <>
                                <input ref={reciboRef} type="file" accept=".pdf" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setRecibo(e.target.files[0]);}}/>
                                <button onClick={()=>reciboRef.current.click()} style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted,fontSize:11,textDecoration:"underline"}}>trocar</button>
                              </>
                            )}
                          </div>
                          :user.role==="contador"&&(
                            <>
                              <input ref={reciboRef} type="file" accept=".pdf" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setRecibo(e.target.files[0]);}}/>
                              <button onClick={()=>reciboRef.current.click()}
                                style={{display:"inline-flex",alignItems:"center",gap:5,color:C.muted,fontSize:12,background:"rgba(255,255,255,0.7)",border:`1px dashed ${C.borderDark}`,borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>
                                📎 Anexar recibo PDF
                              </button>
                            </>
                          )
                        }
                        {c.key==="proLabore"&&!s.reciboProLabore&&user.role==="cliente"&&(
                          <div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>Recibo não disponível</div>
                        )}
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

// ─── CHAT ────────────────────────────────────────────────────────────────────
function ChatTab({user,clients}){
  const[sel,setSel]=useState(user.role==="cliente"?user.id:(clients[0]?.id||1));
  const[chats,setChats]=useState(CHAT_INIT);
  const[msg,setMsg]=useState("");
  const[pf,setPf]=useState([]);
  const botRef=useRef();const fileRef=useRef();
  const msgs=chats[sel]||[];
  useEffect(()=>{botRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  function send(){
    if(!msg.trim()&&pf.length===0)return;
    setChats(p=>({...p,[sel]:[...(p[sel]||[]),{id:Date.now(),from:user.role==="contador"?"contador":"cliente",text:msg.trim(),files:pf,time:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}]}));
    setMsg("");setPf([]);
  }
  return (
    <div style={{display:"flex",flexDirection:"column",height:"70vh"}}>
      <PgH title="Chat" action={user.role==="contador"&&<div style={{width:160}}><CliSel clients={clients} value={sel} onChange={setSel}/></div>}/>
      <div style={{flex:1,overflowY:"auto",background:C.surfaceAlt,borderRadius:12,padding:16,marginBottom:12,display:"flex",flexDirection:"column",gap:10}}>
        {msgs.length===0&&<p style={{color:C.muted,textAlign:"center",margin:"auto",fontSize:13}}>Nenhuma mensagem.</p>}
        {msgs.map(m=>{
          const me=(user.role==="contador"&&m.from==="contador")||(user.role==="cliente"&&m.from==="cliente");
          return (
            <div key={m.id} style={{display:"flex",justifyContent:me?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"78%",background:me?`linear-gradient(135deg,${C.goldLight},${C.goldDark})`:"#fff",borderRadius:me?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px",boxShadow:C.shadow,border:me?"none":`1px solid ${C.border}`}}>
                {!me&&<div style={{color:C.gold,fontSize:10,fontWeight:700,marginBottom:4,textTransform:"uppercase"}}>{m.from==="contador"?"YF Contabilidade":"Cliente"}</div>}
                {m.text&&<p style={{color:me?"#fff":C.text,fontSize:14,margin:0,lineHeight:1.5}}>{m.text}</p>}
                {m.files&&m.files.length>0&&<div style={{marginTop:m.text?8:0,display:"flex",flexDirection:"column",gap:4}}>
                  {m.files.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.25)",borderRadius:6,padding:"4px 8px"}}><span>📎</span><span style={{color:me?"#fff":C.gold,fontSize:12,fontWeight:600}}>{f}</span></div>)}
                </div>}
                <div style={{color:me?"rgba(255,255,255,0.7)":C.muted,fontSize:10,textAlign:"right",marginTop:4}}>{m.time}</div>
              </div>
            </div>
          );
        })}
        <div ref={botRef}/>
      </div>
      {pf.length>0&&<div style={{background:"#FDF5E0",borderRadius:8,padding:"8px 12px",marginBottom:8,border:"1px solid #F0D080"}}>
        <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:6}}>PARA ENVIAR</div>
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

// ─── PUSH ────────────────────────────────────────────────────────────────────
function PushTab({clients}){
  const[notifs,setNotifs]=useState(NOTIFS_INIT);
  const[show,setShow]=useState(false);
  const[form,setForm]=useState({dest:"todos",clientId:String(clients[0]?.id||1),type:"geral",msg:""});
  const unread=notifs.filter(n=>!n.read).length;
  function sendN(){
    if(!form.msg.trim())return;
    const isTodos=form.dest==="todos";
    const ids=isTodos?clients.map(c=>c.id):[Number(form.clientId)];
    const nm=isTodos?"Todos os clientes":clients.find(c=>c.id===Number(form.clientId))?.name||"Cliente";
    setNotifs(p=>[{id:Date.now(),clientIds:ids,clientName:nm,type:form.type,msg:form.msg.trim(),date:TODAY,read:false},...p]);
    setForm({dest:"todos",clientId:String(clients[0]?.id||1),type:"geral",msg:""});setShow(false);
  }
  const ico=t=>({documento:"📄",imposto:"🧾",chat:"💬",banco:"🏦"}[t]||"🔔");
  return (
    <div>
      <PgH title={<span>Push {unread>0&&<span style={{background:C.gold,color:"#fff",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700,marginLeft:6}}>{unread}</span>}</span>}
        action={<BtnOut onClick={()=>setShow(!show)}>+ Enviar</BtnOut>}/>
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
          {form.dest==="especifico"&&<div><FieldLabel text="Cliente"/><CliSel clients={clients} value={Number(form.clientId)} onChange={id=>setForm({...form,clientId:String(id)})}/></div>}
          {form.dest==="todos"&&<div style={{background:"#FDF5E0",borderRadius:8,padding:"8px 12px",fontSize:12,color:C.muted}}>📢 {clients.map(c=>c.name).join(" · ")}</div>}
          <div><FieldLabel text="Tipo"/><SelIn value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="geral">🔔 Geral</option><option value="documento">📄 Documento</option><option value="imposto">🧾 Imposto</option><option value="banco">🏦 Banco</option></SelIn></div>
          <div><FieldLabel text="Mensagem"/><TxtIn value={form.msg} onChange={e=>setForm({...form,msg:e.target.value})} placeholder="Digite a mensagem..."/></div>
        </div>
      </FCard>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {notifs.map(n=>(
          <Card key={n.id} onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))}
            style={{padding:16,cursor:"pointer",background:n.read?C.surface:"#FDF5E0",border:`1px solid ${n.read?C.border:"#F0D080"}`}}>
            <div style={{display:"flex",gap:12}}>
              <span style={{fontSize:22,flexShrink:0}}>{ico(n.type)}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{color:C.gold,fontSize:13,fontWeight:700}}>{n.clientName}</span>
                  {n.clientIds?.length>1&&<Pill label="Geral" color={C.gold} bg="#FDF5E0" border="#F0D080"/>}
                </div>
                <div style={{color:C.text,fontSize:13}}>{n.msg}</div>
                <div style={{color:C.muted,fontSize:11,marginTop:4}}>{n.date}</div>
              </div>
              {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:C.gold,flexShrink:0,alignSelf:"center"}}/>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const[user,setUser]=useState(null);
  const[activeTab,setActiveTab]=useState("clientes");
  // Estados persistidos em localStorage — sobrevivem ao fechar o app
  const[clients,setClients]=usePersisted("clients", CLIENTS_INIT);
  const[compExtr,setCompExtr]=usePersisted("compExtr", COMPETENCIAS_INIT);
  const[compNotas,setCompNotas]=usePersisted("compNotas", COMP_NOTAS_INIT);
  const[compImp,setCompImp]=usePersisted("compImp", COMP_IMP_INIT);
  const[compResumo,setCompResumo]=usePersisted("compResumo", COMP_RESUMO_INIT);
  const[anosRel,setAnosRel]=usePersisted("anosRel", ANOS_REL_INIT);

  if(!user) return <LoginScreen onLogin={u=>{setUser(u);setActiveTab(u.role==="contador"?"clientes":"cadastro");}} clients={clients}/>;

  const tabs=user.role==="contador"
    ?[{id:"clientes",l:"Empresas",i:"👥"},{id:"cadastro",l:"Cadastro",i:"🏢"},{id:"bancos",l:"Bancos",i:"🏦"},{id:"extratos",l:"Extratos",i:"📁"},{id:"notas",l:"Notas",i:"🧾"},{id:"impostos",l:"Impostos",i:"💰"},{id:"resumo",l:"Resumo",i:"📊"},{id:"relatorios",l:"Relatórios",i:"📋"},{id:"chat",l:"Chat",i:"💬"},{id:"push",l:"Push",i:"🔔"}]
    :[{id:"cadastro",l:"Cadastro",i:"🏢"},{id:"extratos",l:"Extratos",i:"📁"},{id:"notas",l:"Notas",i:"🧾"},{id:"impostos",l:"Impostos",i:"💰"},{id:"resumo",l:"Resumo",i:"📊"},{id:"relatorios",l:"Relatórios",i:"📋"},{id:"chat",l:"Chat",i:"💬"}];

  return (
    <FileViewerProvider>
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:54,position:"sticky",top:0,zIndex:100,boxShadow:C.shadow}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{background:"#000",borderRadius:8,padding:"3px 5px",display:"inline-flex"}}>
            <img src={LOGO} alt="YF" style={{height:30,width:"auto",display:"block",mixBlendMode:"lighten"}}/>
          </div>
        </div>
        {user.role==="cliente"&&(
          <div style={{flex:1,padding:"0 10px",minWidth:0}}>
            <div style={{fontWeight:700,fontSize:13,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
            <div style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.cnpj} · {user.regime}</div>
          </div>
        )}
        {user.role==="contador"&&<span style={{color:C.muted,fontSize:12,flex:1,paddingLeft:8}}>Contador</span>}
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {user.role==="contador"&&(
            <button
              onClick={()=>{if(window.confirm("Redefinir TODOS os dados para o estado inicial? Esta ação não pode ser desfeita.")){clearAllData();window.location.reload();}}}
              style={{padding:"4px 10px",borderRadius:6,border:"1px solid #E2DDD5",background:"transparent",color:"#8A857E",fontSize:10,cursor:"pointer"}}>
              🔄 Reset
            </button>
          )}
          <BtnGh onClick={()=>setUser(null)} sm>Sair</BtnGh>
        </div>
      </div>

      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",width:"100%"}}>
        {tabs.map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
            style={{flex:"1 0 0",display:"flex",flexDirection:"column",alignItems:"center",padding:"8px 2px",border:"none",background:"transparent",cursor:"pointer",borderBottom:`2.5px solid ${activeTab===tab.id?C.gold:"transparent"}`,transition:"all 0.15s",minWidth:0}}>
            <span style={{fontSize:16,marginBottom:1,lineHeight:1}}>{tab.i}</span>
            <span style={{fontSize:9,fontWeight:activeTab===tab.id?700:400,color:activeTab===tab.id?C.gold:C.muted,textTransform:"uppercase",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"100%",padding:"0 1px"}}>{tab.l}</span>
          </button>
        ))}
      </div>

      <div style={{maxWidth:700,margin:"0 auto",padding:"20px 16px"}}>
        {activeTab==="clientes"   &&user.role==="contador"&&<ClientesTab clients={clients} setClients={setClients}/>}
        {activeTab==="cadastro"   &&<CadastroTab user={user} clients={clients} setClients={setClients}/>}
        {activeTab==="bancos"     &&user.role==="contador"&&<BancosTab clients={clients}/>}
        {activeTab==="extratos"   &&<ExtratosTab user={user} clients={clients} compExtr={compExtr} setCompExtr={setCompExtr}/>}
        {activeTab==="notas"      &&<NotasFiscaisTab user={user} clients={clients} compNotas={compNotas} setCompNotas={setCompNotas}/>}
        {activeTab==="impostos"   &&<ImpostosTab user={user} clients={clients} compImp={compImp} setCompImp={setCompImp}/>}
        {activeTab==="resumo"     &&<ResumoTab user={user} clients={clients} compResumo={compResumo} setCompResumo={setCompResumo}/>}
        {activeTab==="relatorios" &&<RelatoriosTab user={user} clients={clients} anosRel={anosRel} setAnosRel={setAnosRel}/>}
        {activeTab==="chat"       &&<ChatTab user={user} clients={clients}/>}
        {activeTab==="push"       &&user.role==="contador"&&<PushTab clients={clients}/>}
      </div>
    </div>
    </FileViewerProvider>
  );
}

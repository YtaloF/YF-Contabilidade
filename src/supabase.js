// src/supabase.js
// ─── Camada de dados Supabase ─────────────────────────────────────────────────
// Substitui o usePersisted (localStorage) do App.jsx.
// Todas as funções retornam os mesmos formatos que o código original espera,
// facilitando a migração incremental.

import { createClient } from "@supabase/supabase-js";

// ── Credenciais — preencha com os valores do seu projeto ──────────────────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  realtime: { params: { eventsPerSecond: 10 } },
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function check(res) {
  if (res.error) throw res.error;
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH (simples — sem Supabase Auth, apenas tabela clients)
// ─────────────────────────────────────────────────────────────────────────────
export async function loginContador(email, password, contadorPassword) {
  // senha do contador fica no localStorage até você querer mover pro Supabase
  if (email === "y.facundo@yahoo.com.br" && password === contadorPassword) {
    return { role: "contador", name: "YF Contabilidade" };
  }
  throw new Error("Credenciais inválidas.");
}

export async function loginCliente(email, password) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("email", email)
    .eq("password", password)   // em produção real, use bcrypt no backend
    .eq("status", "ativo")
    .single();
  if (error || !data) throw new Error("Credenciais inválidas.");
  return { role: "cliente", ...data };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchClients() {
  return check(await supabase.from("clients").select("*").order("name"));
}

export async function upsertClient(client) {
  const row = {
    id:              client.id,
    name:            client.name,
    cnpj:            client.cnpj,
    email:           client.email,
    password:        client.password,
    regime:          client.regime,
    status:          client.status,
    insc_municipal:  client.insc_municipal || client.inscMunicipal,
    honorarios:      client.honorarios,
    cert_digital:    client.cert_digital   || client.certDigital,
    cert_validade:   client.cert_validade  || client.certValidade,
    cert_senha:      client.cert_senha     || client.certSenha,
    contrato:        client.contrato,
    contrato_social: client.contrato_social|| client.contratoSocial,
    nfse_cfg:        client.nfse_cfg       || client.nfseCfg || {},
    nfse_endpoint:   client.nfse_endpoint  || null,
    nfse_usuario:    client.nfse_usuario   || null,
    nfse_senha:      client.nfse_senha     || null,
    nfse_token:      client.nfse_token     || null,
    nfse_aliquota:   client.nfse_aliquota  || null,
  };
  return check(await supabase.from("clients").upsert(row).select().single());
}

export async function insertClient(client) {
  // Remove id, created_at e qualquer campo undefined para deixar o Supabase gerar
  const { id, created_at, ...rest } = client;
  // Remove campos undefined
  Object.keys(rest).forEach(k => rest[k] === undefined && delete rest[k]);
  const row = {
    name:           rest.name,
    cnpj:           rest.cnpj           || null,
    email:          rest.email,
    password:       rest.password       || "",
    regime:         rest.regime         || "Simples Nacional",
    status:         rest.status         || "ativo",
    insc_municipal: rest.insc_municipal || rest.inscMunicipal || null,
    honorarios:     rest.honorarios     || null,
    cert_digital:   rest.cert_digital   || null,
    cert_validade:  rest.cert_validade  || null,
    cert_senha:     rest.cert_senha     || null,
    contrato:       rest.contrato       || null,
    contrato_social:rest.contrato_social|| null,
    nfse_cfg:       rest.nfse_cfg       || {},
  };
  const { data, error } = await supabase.from("clients").insert(row).select().single();
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// BANCOS
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchBancos(clientId) {
  return check(await supabase.from("bancos").select("*").eq("client_id", clientId));
}

export async function insertBanco(clientId, banco) {
  return check(await supabase.from("bancos").insert({ client_id: clientId, ...banco }).select().single());
}

export async function deleteBanco(bancoId) {
  return check(await supabase.from("bancos").delete().eq("id", bancoId));
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPETÊNCIAS
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchCompetencias(clientId, modulo) {
  const data = check(await supabase.from("competencias").select("periodo")
    .eq("client_id", clientId).eq("modulo", modulo).order("periodo", { ascending: false }));
  return data.map(d => d.periodo);
}

export async function addCompetencia(clientId, modulo, periodo) {
  return check(await supabase.from("competencias").upsert({ client_id: clientId, modulo, periodo }));
}

export async function removeCompetencia(clientId, modulo, periodo) {
  return check(await supabase.from("competencias").delete()
    .eq("client_id", clientId).eq("modulo", modulo).eq("periodo", periodo));
}

// ─────────────────────────────────────────────────────────────────────────────
// ANOS RELATÓRIOS
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAnosRel(clientId) {
  const data = check(await supabase.from("anos_rel").select("ano")
    .eq("client_id", clientId).order("ano", { ascending: false }));
  return data.map(d => d.ano);
}

export async function addAnoRel(clientId, ano) {
  return check(await supabase.from("anos_rel").upsert({ client_id: clientId, ano }));
}

export async function removeAnoRel(clientId, ano) {
  return check(await supabase.from("anos_rel").delete().eq("client_id", clientId).eq("ano", ano));
}

// ─────────────────────────────────────────────────────────────────────────────
// ENVIOS DE EXTRATO
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchEnvios(clientId, periodo) {
  return check(await supabase.from("envios").select("*")
    .eq("client_id", clientId).eq("periodo", periodo));
}

export async function upsertEnvio(clientId, bancoId, periodo, pdf, ofx) {
  const status = pdf || ofx ? "enviado" : "pendente";
  return check(await supabase.from("envios").upsert({
    client_id: clientId, banco_id: bancoId, periodo,
    pdf_path: pdf, ofx_path: ofx, status, updated_at: new Date().toISOString(),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPOSTOS — CONFIG
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchImpCfg(clientId) {
  return check(await supabase.from("imp_cfg").select("*").eq("client_id", clientId));
}

export async function upsertImpCfg(clientId, imp) {
  return check(await supabase.from("imp_cfg").upsert({ client_id: clientId, ...imp }));
}

export async function deleteImpCfg(id) {
  return check(await supabase.from("imp_cfg").delete().eq("id", id));
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPOSTOS — DADOS
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchImpDados(clientId, periodo) {
  return check(await supabase.from("imp_dados").select("*")
    .eq("client_id", clientId).eq("periodo", periodo));
}

export async function upsertImpDado(clientId, periodo, impId, fields) {
  return check(await supabase.from("imp_dados").upsert({
    client_id: clientId, periodo, imp_id: impId, ...fields,
    updated_at: new Date().toISOString(),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPOSTOS — AVULSAS
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAvulsas(clientId, periodo) {
  return check(await supabase.from("imp_avulsas").select("*")
    .eq("client_id", clientId).eq("periodo", periodo));
}

export async function insertAvulsa(clientId, periodo, data) {
  return check(await supabase.from("imp_avulsas").insert({ client_id: clientId, periodo, ...data }).select().single());
}

export async function updateAvulsa(id, fields) {
  return check(await supabase.from("imp_avulsas").update(fields).eq("id", id));
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTAS FISCAIS
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchNotas(clientId, periodo) {
  return check(await supabase.from("notas").select("*")
    .eq("client_id", clientId).eq("periodo", periodo).order("created_at"));
}

export async function insertNota(clientId, periodo, nota) {
  return check(await supabase.from("notas").insert({ client_id: clientId, periodo, ...nota }).select().single());
}

export async function deleteNota(id) {
  return check(await supabase.from("notas").delete().eq("id", id));
}

// ─────────────────────────────────────────────────────────────────────────────
// RESUMO
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchResumo(clientId, periodo) {
  const { data } = await supabase.from("resumos").select("*")
    .eq("client_id", clientId).eq("periodo", periodo).single();
  return data || null;
}

export async function upsertResumo(clientId, periodo, fields) {
  return check(await supabase.from("resumos").upsert({
    client_id: clientId, periodo, ...fields, updated_at: new Date().toISOString(),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// RELATÓRIOS
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchRelatorios(clientId, ano) {
  return check(await supabase.from("relatorios").select("*")
    .eq("client_id", clientId).eq("ano", ano));
}

export async function upsertRelatorio(clientId, ano, tipo, fields) {
  return check(await supabase.from("relatorios").upsert({
    client_id: clientId, ano, tipo, ...fields, updated_at: new Date().toISOString(),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT — com realtime
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchMessages(clientId) {
  return check(await supabase.from("chat_messages").select("*")
    .eq("client_id", clientId).order("created_at"));
}

export async function sendMessage(clientId, fromRole, text, files) {
  // files pode ser array de File objects (upload) ou array de strings (paths já salvos)
  let filePaths = [];
  if (files && files.length > 0) {
    for (const f of files) {
      if (typeof f === "string") {
        filePaths.push(f);
      } else {
        // É um File object — fazer upload
        const path = await uploadArquivo(clientId, "chat", f);
        filePaths.push(path);
      }
    }
  }
  return check(await supabase.from("chat_messages").insert({
    client_id: clientId, from_role: fromRole, text, files: filePaths,
  }).select().single());
}

export function subscribeChat(clientId, onMessage) {
  return supabase.channel(`chat:${clientId}`)
    .on("postgres_changes", {
      event: "INSERT", schema: "public", table: "chat_messages",
      filter: `client_id=eq.${clientId}`,
    }, payload => onMessage(payload.new))
    .subscribe();
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICAÇÕES — com realtime
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchNotificacoes() {
  return check(await supabase.from("notificacoes").select("*").order("created_at", { ascending: false }));
}

export async function insertNotificacao(data) {
  return check(await supabase.from("notificacoes").insert(data).select().single());
}

export async function markNotifRead(id) {
  return check(await supabase.from("notificacoes").update({ read: true }).eq("id", id));
}

export function subscribeNotificacoes(clientId, onNotif) {
  return supabase.channel(`notif:${clientId}`)
    .on("postgres_changes", {
      event: "INSERT", schema: "public", table: "notificacoes",
    }, payload => {
      const ids = payload.new.client_ids || [];
      if (ids.includes(clientId) || ids.length === 0) onNotif(payload.new);
    })
    .subscribe();
}

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE — upload e URL assinada
// ─────────────────────────────────────────────────────────────────────────────
const BUCKET_ARQUIVOS = "arquivos-clientes";
const BUCKET_NOTAS    = "notas-fiscais";

/**
 * Faz upload de um File para o bucket correto.
 * Retorna o path relativo salvo no banco.
 */
export async function uploadArquivo(clientId, modulo, file) {
  const ext  = file.name.split(".").pop();
  const path = `${clientId}/${modulo}/${Date.now()}_${file.name}`;
  const bucket = modulo === "notas" ? BUCKET_NOTAS : BUCKET_ARQUIVOS;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600", upsert: true,
  });
  if (error) throw error;
  return path;
}

/**
 * Gera URL assinada (1h) para download/visualização.
 */
export async function getSignedUrl(path, modulo = "arquivos") {
  const bucket = modulo === "notas" ? BUCKET_NOTAS : BUCKET_ARQUIVOS;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

// ─────────────────────────────────────────────────────────────────────────────
// REALTIME — subscriptions para todos os módulos
// ─────────────────────────────────────────────────────────────────────────────

export function subscribeImpDados(clientId, periodo, onChange) {
  return supabase.channel(`imp_dados:${clientId}:${periodo}`)
    .on("postgres_changes", {
      event: "*", schema: "public", table: "imp_dados",
      filter: `client_id=eq.${clientId}`,
    }, () => onChange())
    .subscribe();
}

export function subscribeAvulsas(clientId, periodo, onChange) {
  return supabase.channel(`avulsas:${clientId}:${periodo}`)
    .on("postgres_changes", {
      event: "*", schema: "public", table: "imp_avulsas",
      filter: `client_id=eq.${clientId}`,
    }, () => onChange())
    .subscribe();
}

export function subscribeEnvios(clientId, onChange) {
  return supabase.channel(`envios:${clientId}`)
    .on("postgres_changes", {
      event: "*", schema: "public", table: "envios",
      filter: `client_id=eq.${clientId}`,
    }, () => onChange())
    .subscribe();
}

export function subscribeNotas(clientId, onChange) {
  return supabase.channel(`notas:${clientId}`)
    .on("postgres_changes", {
      event: "*", schema: "public", table: "notas",
      filter: `client_id=eq.${clientId}`,
    }, () => onChange())
    .subscribe();
}

export function subscribeResumo(clientId, onChange) {
  return supabase.channel(`resumo:${clientId}`)
    .on("postgres_changes", {
      event: "*", schema: "public", table: "resumos",
      filter: `client_id=eq.${clientId}`,
    }, () => onChange())
    .subscribe();
}

export function subscribeRelatorios(clientId, onChange) {
  return supabase.channel(`relatorios:${clientId}`)
    .on("postgres_changes", {
      event: "*", schema: "public", table: "relatorios",
      filter: `client_id=eq.${clientId}`,
    }, () => onChange())
    .subscribe();
}

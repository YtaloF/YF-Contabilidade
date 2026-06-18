// netlify/functions/nfse-whatsapp.js
// Webhook da Z-API → identifica cliente → emite NFS-e via Focus NFe

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yhnpxyvxvqpflczlnrne.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlobnp4eXZ4dnFwZmxjemxucm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3ODM4NzIsImV4cCI6MjA1OTM1OTg3Mn0.CJnFgaEBboMEULdahSJdGBXfPHhHWLxeWalEXDaX69U';

const ZAPI_INSTANCE = '3F4D7FA32C5BF1C479CC8645B9B7D1FC';
const ZAPI_TOKEN    = '2531E47012E94CF7CD551C9F';
const ZAPI_SEND_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Envia mensagem de volta via Z-API ───────────────────────────────────────
async function sendMessage(phone, text) {
  await fetch(ZAPI_SEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, message: text }),
  });
}

// ─── Parseia a mensagem do cliente ───────────────────────────────────────────
// Formato esperado:
// nfse / tomador: João Silva / cpf: 123.456.789-00 / valor: 500 / descrição: Consulta odontológica
function parseMessage(text) {
  const lower = text.toLowerCase().trim();
  if (!lower.startsWith('nfse')) return null;

  const get = (key) => {
    const regex = new RegExp(`${key}\\s*:\\s*([^/]+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  return {
    tomadorNome:     get('tomador'),
    tomadorCpfCnpj:  get('cpf') || get('cnpj'),
    valor:           get('valor'),
    descricao:       get('descrição') || get('descricao') || get('serviço') || get('servico'),
  };
}

// ─── Emite NFS-e via Focus NFe ───────────────────────────────────────────────
async function emitirNFSe({ token, cnpjPrestador, tomadorNome, tomadorCpfCnpj, valor, descricao }) {
  // Remove formatação do CNPJ/CPF
  const cnpjLimpo = cnpjPrestador.replace(/\D/g, '');
  const tomadorDoc = tomadorCpfCnpj ? tomadorCpfCnpj.replace(/\D/g, '') : null;
  const valorNum = parseFloat(String(valor).replace(',', '.'));

  const body = {
    data_emissao: new Date().toISOString().split('T')[0],
    prestador: {
      cnpj: cnpjLimpo,
    },
    tomador: {
      ...(tomadorDoc && tomadorDoc.length === 11 ? { cpf: tomadorDoc } : {}),
      ...(tomadorDoc && tomadorDoc.length === 14 ? { cnpj: tomadorDoc } : {}),
      razao_social: tomadorNome,
    },
    servico: {
      aliquota: 2, // ISS 2% — ajuste conforme necessário
      base_calculo: valorNum,
      descricao: descricao || 'Serviços contábeis',
      discriminacao: descricao || 'Serviços contábeis',
      iss_retido: 'false',
      item_lista_servico: '1.01', // Análise e desenvolvimento de sistemas — ajuste conforme CNAE
      valor_servicos: valorNum,
    },
  };

  const response = await fetch('https://api.focusnfe.com.br/v2/nfses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(token + ':').toString('base64')}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return { status: response.status, data };
}

// ─── Handler principal ───────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Z-API envia o número sem o @c.us, ex: "5521971344792"
  const phone   = payload.phone?.replace('@c.us', '') || payload.from?.replace('@c.us', '');
  const message = payload.text?.message || payload.body || '';

  if (!phone || !message) {
    return { statusCode: 200, body: 'ignored' };
  }

  // Ignora mensagens do próprio bot (evita loop)
  if (payload.fromMe) {
    return { statusCode: 200, body: 'fromMe ignored' };
  }

  // ── 1. Busca cliente no Supabase pelo número ──────────────────────────────
  const { data: cliente, error } = await supabase
    .from('clientes_nfse')
    .select('*')
    .eq('whatsapp', phone)
    .single();

  if (error || !cliente) {
    await sendMessage(phone,
      '❌ Seu número não está cadastrado para emissão de NFS-e.\n' +
      'Entre em contato com a YF Contabilidade para configurar seu acesso.'
    );
    return { statusCode: 200, body: 'cliente não encontrado' };
  }

  const msgNorm = message.trim().toUpperCase();

  // ── 2. Verifica se há uma sessão em andamento ─────────────────────────────
  const { data: sessao } = await supabase
    .from('nfse_sessoes')
    .select('*')
    .eq('whatsapp', phone)
    .eq('status', 'em_andamento')
    .single();

  // ── 3. Se há sessão ativa, processa a etapa atual ─────────────────────────
  if (sessao) {
    // Cancelamento a qualquer momento
    if (['CANCELAR', 'SAIR', 'NÃO', 'NAO'].includes(msgNorm)) {
      await supabase.from('nfse_sessoes').update({ status: 'cancelada' }).eq('whatsapp', phone);
      await sendMessage(phone, '❌ Emissão cancelada. Quando quiser emitir, envie *QUERO EMITIR UMA NOTA*.');
      return { statusCode: 200, body: 'cancelado' };
    }

    const etapa = sessao.etapa;
    const dados = sessao.dados || {};

    if (etapa === 'aguardando_tomador') {
      dados.tomador_nome = message.trim();
      await supabase.from('nfse_sessoes').update({ etapa: 'aguardando_doc', dados }).eq('whatsapp', phone);
      await sendMessage(phone,
        `✅ Tomador: *${dados.tomador_nome}*\n\n` +
        `Agora envie o *CPF ou CNPJ* do tomador:\n_(ou envie *pular* se não tiver)_`
      );
      return { statusCode: 200, body: 'etapa tomador ok' };
    }

    if (etapa === 'aguardando_doc') {
      dados.tomador_doc = msgNorm === 'PULAR' ? null : message.trim();
      await supabase.from('nfse_sessoes').update({ etapa: 'aguardando_valor', dados }).eq('whatsapp', phone);
      await sendMessage(phone,
        `✅ Documento: *${dados.tomador_doc || 'não informado'}*\n\n` +
        `Agora envie o *valor* do serviço (apenas números, ex: 350 ou 1500,50):`
      );
      return { statusCode: 200, body: 'etapa doc ok' };
    }

    if (etapa === 'aguardando_valor') {
      const valor = parseFloat(message.trim().replace(',', '.'));
      if (isNaN(valor) || valor <= 0) {
        await sendMessage(phone, '⚠️ Valor inválido. Envie apenas números, ex: *350* ou *1500,50*');
        return { statusCode: 200, body: 'valor inválido' };
      }
      dados.valor = valor;
      await supabase.from('nfse_sessoes').update({ etapa: 'aguardando_data', dados }).eq('whatsapp', phone);
      await sendMessage(phone,
        `✅ Valor: *R$ ${valor.toFixed(2)}*\n\n` +
        `*4️⃣ Qual a data de emissão da nota?*\n` +
        `_(Formato: DD/MM/AAAA, ex: 18/06/2026 — ou envie *hoje* para usar a data atual)_`
      );
      return { statusCode: 200, body: 'etapa valor ok' };
    }

    if (etapa === 'aguardando_data') {
      let dataEmissao;
      const msgData = message.trim().toUpperCase();

      if (msgData === 'HOJE') {
        dataEmissao = new Date().toISOString().split('T')[0];
      } else {
        const match = message.trim().match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
        if (!match) {
          await sendMessage(phone,
            '⚠️ Data inválida. Use o formato *DD/MM/AAAA*, ex: *18/06/2026*\n' +
            'Ou envie *hoje* para usar a data atual.'
          );
          return { statusCode: 200, body: 'data inválida' };
        }
        const [, dia, mes, ano] = match;
        const dateObj = new Date(`${ano}-${mes}-${dia}`);
        if (isNaN(dateObj.getTime())) {
          await sendMessage(phone, '⚠️ Data inválida. Verifique o dia, mês e ano informados.');
          return { statusCode: 200, body: 'data inválida' };
        }
        dataEmissao = `${ano}-${mes}-${dia}`;
      }

      dados.data_emissao = dataEmissao;
      const [ano2, mes2, dia2] = dataEmissao.split('-');
      dados.data_emissao_display = `${dia2}/${mes2}/${ano2}`;

      await supabase.from('nfse_sessoes').update({ etapa: 'aguardando_descricao', dados }).eq('whatsapp', phone);
      await sendMessage(phone,
        `✅ Data: *${dados.data_emissao_display}*\n\n` +
        `*5️⃣ Qual a descrição do serviço prestado?*`
      );
      return { statusCode: 200, body: 'etapa data ok' };
    }

    if (etapa === 'aguardando_descricao') {
      dados.descricao = message.trim();
      await supabase.from('nfse_sessoes').update({ etapa: 'aguardando_confirmacao', dados }).eq('whatsapp', phone);
      await sendMessage(phone,
        `📝 *Confirme os dados da NFS-e:*\n\n` +
        `👤 *Prestador:* ${cliente.nome}\n` +
        `🏢 *Tomador:* ${dados.tomador_nome}\n` +
        `${dados.tomador_doc ? `📄 *CPF/CNPJ:* ${dados.tomador_doc}\n` : ''}` +
        `💰 *Valor:* R$ ${Number(dados.valor).toFixed(2)}\n` +
        `📅 *Data de emissão:* ${dados.data_emissao_display}\n` +
        `📋 *Descrição:* ${dados.descricao}\n\n` +
        `Responda *SIM* para emitir ou *CANCELAR* para cancelar.`
      );
      return { statusCode: 200, body: 'confirmação enviada' };
    }

    if (etapa === 'aguardando_confirmacao') {
      if (msgNorm !== 'SIM') {
        await sendMessage(phone, 'Responda *SIM* para confirmar a emissão ou *CANCELAR* para cancelar.');
        return { statusCode: 200, body: 'aguardando sim' };
      }

      // Emite a nota
      await supabase.from('nfse_sessoes').update({ status: 'processando' }).eq('whatsapp', phone);
      await sendMessage(phone, '⏳ Emitindo sua NFS-e, aguarde...');

      try {
        const cnpjLimpo  = cliente.cnpj.replace(/\D/g, '');
        const docLimpo   = dados.tomador_doc ? dados.tomador_doc.replace(/\D/g, '') : null;

        const body = {
          data_emissao: dados.data_emissao || new Date().toISOString().split('T')[0],
          prestador: { cnpj: cnpjLimpo },
          tomador: {
            ...(docLimpo && docLimpo.length === 11 ? { cpf: docLimpo } : {}),
            ...(docLimpo && docLimpo.length === 14 ? { cnpj: docLimpo } : {}),
            razao_social: dados.tomador_nome,
          },
          servico: {
            aliquota: 2,
            base_calculo: dados.valor,
            descricao: dados.descricao,
            discriminacao: dados.descricao,
            iss_retido: 'false',
            item_lista_servico: '1.01',
            valor_servicos: dados.valor,
          },
        };

        const resp = await fetch('https://api.focusnfe.com.br/v2/nfses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(cliente.focus_token + ':').toString('base64')}`,
          },
          body: JSON.stringify(body),
        });

        const data = await resp.json();

        if (resp.status === 200 || resp.status === 201 || data.ref) {
          await supabase.from('nfse_sessoes').update({ status: 'emitida' }).eq('whatsapp', phone);
          await supabase.from('nfse_historico').insert({
            whatsapp:       phone,
            cnpj_prestador: cliente.cnpj,
            tomador_nome:   dados.tomador_nome,
            valor:          dados.valor,
            descricao:      dados.descricao,
            focus_ref:      data.ref || null,
            status:         'emitida',
            emitida_em:     new Date().toISOString(),
          });

          const linkNota = data.caminho_danfse || data.url || null;

          // Mensagem de sucesso
          await sendMessage(phone,
            `✅ *NFS-e emitida com sucesso!*\n\n` +
            `📋 *Referência:* ${data.ref || 'N/A'}\n` +
            `👤 *Tomador:* ${dados.tomador_nome}\n` +
            `💰 *Valor:* R$ ${Number(dados.valor).toFixed(2)}\n` +
            `📅 *Data:* ${dados.data_emissao_display}\n\n` +
            `📄 Aguarde, estou buscando o PDF da nota...`
          );

          // Busca o PDF na Focus NFe (pode levar alguns segundos para ficar disponível)
          await new Promise(r => setTimeout(r, 4000)); // aguarda 4s para a Focus processar

          try {
            const pdfResp = await fetch(
              `https://api.focusnfe.com.br/v2/nfses/${data.ref}?completa=1`,
              {
                headers: {
                  Authorization: `Basic ${Buffer.from(cliente.focus_token + ':').toString('base64')}`,
                },
              }
            );
            const pdfData = await pdfResp.json();
            const pdfUrl = pdfData.caminho_danfse || pdfData.danfse_url || null;

            if (pdfUrl) {
              // Envia o PDF via Z-API como documento
              await fetch(
                `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-document/pdf`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    phone,
                    document: pdfUrl,
                    fileName: `NFS-e_${data.ref || 'nota'}.pdf`,
                    caption: `📄 NFS-e — ${dados.tomador_nome} | R$ ${Number(dados.valor).toFixed(2)}`,
                  }),
                }
              );
            } else {
              // Se PDF ainda não disponível, envia o link
              await sendMessage(phone,
                `🔗 *Link da nota:*\n${linkNota || 'Acesse o portal da prefeitura para visualizar.'}\n\n` +
                `_O PDF pode levar alguns minutos para ser gerado pela prefeitura._`
              );
            }
          } catch (pdfErr) {
            // Se falhar ao buscar PDF, envia só o link
            if (linkNota) {
              await sendMessage(phone, `🔗 *Link da nota:*\n${linkNota}`);
            }
          }

          await sendMessage(phone,
            `_YF Contabilidade Digital_ 🏆\n\n` +
            `Para emitir outra nota, envie *QUERO EMITIR UMA NOTA*.`
          );
        } else {
          await supabase.from('nfse_sessoes').update({ status: 'erro' }).eq('whatsapp', phone);
          const erro = data.mensagem || data.errors?.join(', ') || JSON.stringify(data);
          await sendMessage(phone,
            `❌ *Erro ao emitir a NFS-e:*\n${erro}\n\n` +
            `Verifique os dados e envie *QUERO EMITIR UMA NOTA* para tentar novamente.`
          );
        }
      } catch (err) {
        await supabase.from('nfse_sessoes').update({ status: 'erro' }).eq('whatsapp', phone);
        await sendMessage(phone, `❌ Erro inesperado: ${err.message}. Tente novamente em instantes.`);
      }

      return { statusCode: 200, body: 'processado' };
    }
  }

  // ── 4. Gatilho: frase exata para iniciar ─────────────────────────────────
  if (msgNorm !== 'QUERO EMITIR UMA NOTA') {
    // Mensagem não reconhecida e sem sessão ativa — ignora silenciosamente
    return { statusCode: 200, body: 'ignored' };
  }

  // ── 5. Inicia nova sessão de emissão ─────────────────────────────────────
  await supabase.from('nfse_sessoes').upsert({
    whatsapp:  phone,
    status:    'em_andamento',
    etapa:     'aguardando_tomador',
    dados:     {},
    criado_em: new Date().toISOString(),
  }, { onConflict: 'whatsapp' });

  await sendMessage(phone,
    `Olá, *${cliente.nome}*! 👋\n\n` +
    `Vamos emitir sua NFS-e. Vou te guiar passo a passo.\n\n` +
    `_(A qualquer momento envie *CANCELAR* para desistir)_\n\n` +
    `*1️⃣ Qual o nome do tomador?* (quem está recebendo o serviço)`
  );

  return { statusCode: 200, body: 'sessão iniciada' };
};

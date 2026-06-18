// netlify/functions/nfse-whatsapp.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yhnpxyvxvqpflczlnrne.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlobnp4eXZ4dnFwZmxjemxucm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3ODM4NzIsImV4cCI6MjA1OTM1OTg3Mn0.CJnFgaEBboMEULdahSJdGBXfPHhHWLxeWalEXDaX69U';
const ZAPI_INSTANCE = '3F4D7FA32C5BF1C479CC8645B9B7D1FC';
const ZAPI_TOKEN    = '2531E47012E94CF7CD551C9F';
const ZAPI_SEND_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sendMessage(phone, text) {
  await fetch(ZAPI_SEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, message: text }),
  });
}

function normalizePhone(raw) {
  if (!raw) return null;
  // Remove tudo que não é número
  let p = raw.replace(/\D/g, '');
  // Remove sufixos como @s.whatsapp.net @c.us
  p = raw.replace(/@.*$/, '').replace(/\D/g, '');
  // Se não começa com 55 e tem 10 ou 11 dígitos, adiciona 55
  if (!p.startsWith('55') && (p.length === 10 || p.length === 11)) {
    p = '55' + p;
  }
  return p;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let payload;
  try { payload = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  // Log para debug — remover após confirmar funcionamento
  console.log('RAW_PAYLOAD:', JSON.stringify({ phone: payload.phone, from: payload.from, fromMe: payload.fromMe, body: payload.body, text: payload.text }));

  if (payload.fromMe) return { statusCode: 200, body: 'fromMe ignored' };

  const rawPhone = payload.phone || payload.from || '';
  const phone    = normalizePhone(rawPhone);
  const message  = payload.text?.message || payload.body || '';

  console.log('NORMALIZED_PHONE:', phone, '| RAW:', rawPhone);

  if (!phone || !message) return { statusCode: 200, body: 'ignored' };

  // Busca cliente — tenta o número normalizado
  const { data: cliente, error } = await supabase
    .from('clientes_nfse')
    .select('*')
    .eq('whatsapp', phone)
    .single();

  if (error || !cliente) {
    // Tenta também sem o 55 na frente
    const phoneAlt = phone.startsWith('55') ? phone.slice(2) : '55' + phone;
    const { data: clienteAlt } = await supabase
      .from('clientes_nfse')
      .select('*')
      .eq('whatsapp', phoneAlt)
      .single();

    if (!clienteAlt) {
      console.log('CLIENTE_NAO_ENCONTRADO:', phone, '| ALT:', phoneAlt);
      return { statusCode: 200, body: 'cliente não cadastrado - ignorado' };
    }
    // Usa o cliente alternativo
    return processarMensagem(event, phone, message, clienteAlt);
  }

  return processarMensagem(event, phone, message, cliente);
};

async function processarMensagem(event, phone, message, cliente) {
  const msgNorm = message.trim().toUpperCase();

  // Verifica sessão ativa
  const { data: sessao } = await supabase
    .from('nfse_sessoes')
    .select('*')
    .eq('whatsapp', phone)
    .eq('status', 'em_andamento')
    .single();

  if (sessao) {
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
        `*2️⃣ CPF ou CNPJ* do tomador:\n_(envie *pular* se não tiver)_`
      );
      return { statusCode: 200, body: 'etapa tomador ok' };
    }

    if (etapa === 'aguardando_doc') {
      dados.tomador_doc = msgNorm === 'PULAR' ? null : message.trim();
      await supabase.from('nfse_sessoes').update({ etapa: 'aguardando_valor', dados }).eq('whatsapp', phone);
      await sendMessage(phone,
        `✅ Documento: *${dados.tomador_doc || 'não informado'}*\n\n` +
        `*3️⃣ Qual o valor* do serviço? (ex: 350 ou 1500,50)`
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
        `*4️⃣ Data de emissão?*\n_(DD/MM/AAAA ou envie *hoje*)_`
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
          await sendMessage(phone, '⚠️ Data inválida. Use *DD/MM/AAAA* ou envie *hoje*.');
          return { statusCode: 200, body: 'data inválida' };
        }
        const [, dia, mes, ano] = match;
        dataEmissao = `${ano}-${mes}-${dia}`;
      }
      dados.data_emissao = dataEmissao;
      const [ano2, mes2, dia2] = dataEmissao.split('-');
      dados.data_emissao_display = `${dia2}/${mes2}/${ano2}`;
      await supabase.from('nfse_sessoes').update({ etapa: 'aguardando_descricao', dados }).eq('whatsapp', phone);
      await sendMessage(phone,
        `✅ Data: *${dados.data_emissao_display}*\n\n` +
        `*5️⃣ Descrição do serviço prestado:*`
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
        `📅 *Data:* ${dados.data_emissao_display}\n` +
        `📋 *Descrição:* ${dados.descricao}\n\n` +
        `Responda *SIM* para emitir ou *CANCELAR* para cancelar.`
      );
      return { statusCode: 200, body: 'confirmação enviada' };
    }

    if (etapa === 'aguardando_confirmacao') {
      if (msgNorm !== 'SIM') {
        await sendMessage(phone, 'Responda *SIM* para emitir ou *CANCELAR* para cancelar.');
        return { statusCode: 200, body: 'aguardando sim' };
      }

      await supabase.from('nfse_sessoes').update({ status: 'processando' }).eq('whatsapp', phone);
      await sendMessage(phone, '⏳ Emitindo sua NFS-e, aguarde...');

      try {
        const cnpjLimpo = cliente.cnpj.replace(/\D/g, '');
        const docLimpo  = dados.tomador_doc ? dados.tomador_doc.replace(/\D/g, '') : null;

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
        console.log('FOCUS_RESPONSE:', resp.status, JSON.stringify(data));

        if (resp.status === 200 || resp.status === 201 || data.ref) {
          await supabase.from('nfse_sessoes').update({ status: 'emitida' }).eq('whatsapp', phone);
          await supabase.from('nfse_historico').insert({
            whatsapp: phone, cnpj_prestador: cliente.cnpj,
            tomador_nome: dados.tomador_nome, valor: dados.valor,
            descricao: dados.descricao, focus_ref: data.ref || null,
            status: 'emitida', emitida_em: new Date().toISOString(),
          });

          await sendMessage(phone,
            `✅ *NFS-e emitida com sucesso!*\n\n` +
            `📋 *Referência:* ${data.ref || 'N/A'}\n` +
            `👤 *Tomador:* ${dados.tomador_nome}\n` +
            `💰 *Valor:* R$ ${Number(dados.valor).toFixed(2)}\n` +
            `📅 *Data:* ${dados.data_emissao_display}\n\n` +
            `📄 Buscando PDF da nota...`
          );

          await new Promise(r => setTimeout(r, 4000));

          try {
            const pdfResp = await fetch(
              `https://api.focusnfe.com.br/v2/nfses/${data.ref}?completa=1`,
              { headers: { Authorization: `Basic ${Buffer.from(cliente.focus_token + ':').toString('base64')}` } }
            );
            const pdfData = await pdfResp.json();
            const pdfUrl = pdfData.caminho_danfse || pdfData.danfse_url || null;

            if (pdfUrl) {
              await fetch(
                `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-document/pdf`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    phone, document: pdfUrl,
                    fileName: `NFS-e_${data.ref || 'nota'}.pdf`,
                    caption: `📄 NFS-e — ${dados.tomador_nome} | R$ ${Number(dados.valor).toFixed(2)}`,
                  }),
                }
              );
            } else {
              const linkNota = data.caminho_danfse || data.url || null;
              await sendMessage(phone,
                `🔗 *Link da nota:*\n${linkNota || 'Acesse o portal da prefeitura.'}\n` +
                `_O PDF pode levar alguns minutos._`
              );
            }
          } catch (pdfErr) {
            console.log('PDF_ERROR:', pdfErr.message);
          }

          await sendMessage(phone,
            `_YF Contabilidade Digital_ 🏆\n\nPara emitir outra nota, envie *QUERO EMITIR UMA NOTA*.`
          );
        } else {
          await supabase.from('nfse_sessoes').update({ status: 'erro' }).eq('whatsapp', phone);
          const erro = data.mensagem || data.errors?.join(', ') || JSON.stringify(data);
          await sendMessage(phone, `❌ *Erro ao emitir:*\n${erro}\n\nEnvie *QUERO EMITIR UMA NOTA* para tentar novamente.`);
        }
      } catch (err) {
        await supabase.from('nfse_sessoes').update({ status: 'erro' }).eq('whatsapp', phone);
        await sendMessage(phone, `❌ Erro inesperado: ${err.message}`);
      }

      return { statusCode: 200, body: 'processado' };
    }
  }

  // Gatilho
  if (msgNorm !== 'QUERO EMITIR UMA NOTA') return { statusCode: 200, body: 'ignored' };

  await supabase.from('nfse_sessoes').upsert({
    whatsapp: phone, status: 'em_andamento', etapa: 'aguardando_tomador',
    dados: {}, criado_em: new Date().toISOString(),
  }, { onConflict: 'whatsapp' });

  await sendMessage(phone,
    `Olá, *${cliente.nome}*! 👋\n\n` +
    `Vamos emitir sua NFS-e. Vou te guiar passo a passo.\n` +
    `_(Envie *CANCELAR* a qualquer momento para desistir)_\n\n` +
    `*1️⃣ Qual o nome do tomador?*`
  );

  return { statusCode: 200, body: 'sessão iniciada' };
}

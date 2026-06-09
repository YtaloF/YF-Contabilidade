// Netlify Function: emitir-nfse.js
// NFS-e Cabo Frio/RJ com assinatura digital via node-forge

const forge = require('node-forge');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { endpoint, usuario, senha, token, prestador, tomador, servico, cert_path, cert_senha } = JSON.parse(event.body);

    if (!endpoint) return { statusCode: 400, body: JSON.stringify({ error: 'Endpoint nao configurado' }) };
    if (!cert_path) return { statusCode: 400, body: JSON.stringify({ error: 'Certificado digital nao configurado. Anexe o arquivo .pfx no cadastro do cliente.' }) };

    // 1. Buscar o .pfx do Supabase Storage
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_SERVICE_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY nao configurada nas variaveis de ambiente' }) };
    }

    console.log('Buscando certificado:', cert_path);
    const storageResp = await fetch(
      `${SUPABASE_URL}/storage/v1/object/arquivos-clientes/${cert_path}`,
      { headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY } }
    );

    if (!storageResp.ok) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Nao foi possivel acessar o certificado digital. Verifique se o arquivo foi anexado corretamente.' }) };
    }

    const pfxBuffer = await storageResp.arrayBuffer();
    const pfxDer = Buffer.from(pfxBuffer).toString('binary');

    // 2. Ler o .pfx com node-forge
    console.log('Lendo certificado PFX...');
    let p12;
    try {
      p12 = forge.pkcs12.pkcs12FromAsn1(
        forge.asn1.fromDer(pfxDer),
        false,
        cert_senha || ''
      );
    } catch (e) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Senha do certificado incorreta ou arquivo inválido: ' + e.message }) };
    }

    // Extrair chave privada e certificado
    const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const privateKey = bags[forge.pki.oids.pkcs8ShroudedKeyBag][0]?.key;
    const certificate = certBags[forge.pki.oids.certBag][0]?.cert;

    if (!privateKey || !certificate) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Certificado invalido: nao foi possivel extrair chave privada' }) };
    }

    // 3. Montar o JSON do DPS (sem assinatura primeiro)
    const cnpjTomador = (tomador.cnpj || '').replace(/\D/g, '');
    const dps = {
      data_emissao: new Date().toISOString().slice(0, 19) + '-0300',
      natureza_operacao: 1,
      optante_simples_nacional: true,
      prestador: {
        cnpj: (prestador.cnpj || '').replace(/\D/g, ''),
        inscricao_municipal: prestador.insc_municipal || '',
        codigo_municipio: 3300704
      },
      tomador: {
        razao_social: tomador.nome || 'Consumidor Final',
        endereco: {
          logradouro: tomador.logradouro || 'Nao informado',
          numero: tomador.numero || 'S/N',
          bairro: tomador.bairro || 'Centro',
          codigo_municipio: 3300704,
          uf: tomador.uf || 'RJ',
          cep: (tomador.cep || '').replace(/\D/g, '')
        }
      },
      servico: {
        discriminacao: servico.descricao || 'Servicos prestados',
        valor_servicos: parseFloat(String(servico.valor || 0).replace(',', '.')) || 0,
        item_lista_servico: String(servico.codigo || '17.18').replace(/[^0-9.]/g, ''),
        codigo_cnae: String(servico.cnae || '6920601').replace(/\D/g, ''),
        iss_retido: false
      }
    };

    if (cnpjTomador.length === 14) dps.tomador.cnpj = cnpjTomador;
    else if (cnpjTomador.length === 11) dps.tomador.cpf = cnpjTomador;
    if (tomador.email) dps.tomador.email = tomador.email;

    // 4. Assinar o DPS com o certificado
    // Criar hash SHA-256 do JSON
    const dpsString = JSON.stringify(dps);
    const md = forge.md.sha256.create();
    md.update(dpsString, 'utf8');
    const signature = forge.util.encode64(privateKey.sign(md));

    // Adicionar assinatura e certificado ao payload
    const certPem = forge.pki.certificateToPem(certificate);
    const certDer = forge.util.encode64(forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes());

    const payload = {
      ...dps,
      assinatura: {
        algoritmo: 'SHA256withRSA',
        valor: signature,
        certificado: certDer
      }
    };

    // 5. Enviar para Cabo Frio
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (usuario && senha) {
      headers['Authorization'] = 'Basic ' + Buffer.from(usuario + ':' + senha).toString('base64');
      console.log('AUTH: Basic', usuario);
    } else if (token) {
      headers['Authorization'] = 'Bearer ' + token;
      console.log('AUTH: Bearer');
    }

    console.log('Enviando DPS assinado para:', endpoint);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('Resposta:', response.status, responseText);

    let responseData;
    try { responseData = JSON.parse(responseText); } catch { responseData = { raw: responseText }; }

    if (!response.ok) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: responseData?.mensagem || responseData?.message || 'Erro ao emitir NFS-e',
          codigo: responseData?.erro,
          detalhe: responseData
        })
      };
    }

    const numero = responseData?.numero_nfse || responseData?.numero || responseData?.nNFSe || '—';
    return { statusCode: 200, body: JSON.stringify({ sucesso: true, numero, resposta: responseData }) };

  } catch (err) {
    console.error('Erro:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

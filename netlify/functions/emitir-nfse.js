// Netlify Function: emitir-nfse.js
// NFS-e Cabo Frio/RJ — ModernizacaoPublica — formato ABRASF próprio
// Schema confirmado via Focus NFe: https://focusnfe.com.br/guides/nfse/municipios-integrados/cabo-frio-rj/

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { endpoint, usuario, senha, token, prestador, tomador, servico, competencia } = JSON.parse(event.body);

    if (!endpoint) return { statusCode: 400, body: JSON.stringify({ error: "Endpoint não configurado" }) };

    const dataEmissao = new Date().toISOString().slice(0, 19) + "-0300";
    const cnpjTomador = (tomador.cnpj || "").replace(/\D/g, "");

    // Formato exato confirmado para Cabo Frio/RJ
    const dps = {
      data_emissao: dataEmissao,
      natureza_operacao: 1,
      optante_simples_nacional: prestador.simples_nacional !== false,
      prestador: {
        cnpj: (prestador.cnpj || "").replace(/\D/g, ""),
        inscricao_municipal: prestador.insc_municipal || "",
        codigo_municipio: 3300704, // Cabo Frio/RJ
      },
      tomador: {
        razao_social: tomador.nome || "Consumidor Final",
        endereco: {
          logradouro: tomador.logradouro || "Não informado",
          numero: tomador.numero || "S/N",
          bairro: tomador.bairro || "Centro",
          codigo_municipio: 3300704,
          uf: tomador.uf || "RJ",
          cep: (tomador.cep || "28900000").replace(/\D/g, ""),
        },
        ...(tomador.email ? { email: tomador.email } : {}),
        ...(cnpjTomador.length === 14 ? { cnpj: cnpjTomador } : {}),
        ...(cnpjTomador.length === 11 ? { cpf: cnpjTomador } : {}),
      },
      servico: {
        discriminacao: servico.descricao || "Serviços prestados",
        valor_servicos: parseFloat(String(servico.valor || 0).replace(",", ".")) || 0,
        item_lista_servico: (servico.codigo || "17.18").split(/[—–-]/)[0].trim(),
        codigo_cnae: (servico.cnae || "6920601").replace(/\D/g, ""),
        iss_retido: false,
      },
    };

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    // Tentar múltiplos formatos de autenticação
    if (usuario && senha) {
      headers["Authorization"] = "Basic " + Buffer.from(`${usuario}:${senha}`).toString("base64");
    }
    // TEST AUTH
    if (usuario && senha) { console.log("AUTH: Basic"); } if (token) {
      headers["token"] = token; // Header customizado comum em prefeituras
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("Enviando DPS:", JSON.stringify(dps, null, 2));

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(dps),
    });

    const responseText = await response.text();
    console.log("Resposta:", response.status, responseText);

    let responseData;
    try { responseData = JSON.parse(responseText); } catch { responseData = { raw: responseText }; }

    if (!response.ok) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: responseData?.mensagem || responseData?.message || responseData?.erro || "Erro ao emitir NFS-e",
          codigo: responseData?.erro,
          status: response.status,
          detalhe: responseData,
        })
      };
    }

    const numero = responseData?.numero_nfse || responseData?.nNFSe || responseData?.numero || "—";

    return {
      statusCode: 200,
      body: JSON.stringify({ sucesso: true, numero, resposta: responseData })
    };

  } catch (err) {
    console.error("Erro:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

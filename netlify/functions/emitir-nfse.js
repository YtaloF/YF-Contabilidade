// Netlify Function: emitir-nfse.js
// NFS-e Cabo Frio/RJ — Modernização Pública — formato ABRASF próprio

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { endpoint, usuario, senha, token, prestador, tomador, servico, competencia } = JSON.parse(event.body);

    if (!endpoint) return { statusCode: 400, body: JSON.stringify({ error: "Endpoint não configurado" }) };

    const dataEmissao = new Date().toISOString().slice(0, 19) + "-0300";
    const cnpjTomador = (tomador.cnpj || "").replace(/\D/g, "");

    // Formato ABRASF próprio de Cabo Frio (via Modernização Pública)
    const dps = {
      data_emissao: dataEmissao,
      natureza_operacao: 1,
      optante_simples_nacional: true,
      prestador: {
        cnpj: (prestador.cnpj || "").replace(/\D/g, ""),
        inscricao_municipal: prestador.insc_municipal || "",
        codigo_municipio: 3300704, // código IBGE de Cabo Frio
      },
      tomador: {
        razao_social: tomador.nome || "Consumidor Final",
        endereco: {
          logradouro: tomador.logradouro || "Não informado",
          numero: tomador.numero || "S/N",
          bairro: tomador.bairro || "Não informado",
          codigo_municipio: tomador.codigo_municipio || 3300704,
          uf: tomador.uf || "RJ",
          cep: (tomador.cep || "28900000").replace(/\D/g, ""),
        },
        ...(tomador.email ? { email: tomador.email } : {}),
        ...(cnpjTomador.length === 14 ? { cnpj: cnpjTomador } : {}),
        ...(cnpjTomador.length === 11 ? { cpf: cnpjTomador } : {}),
      },
      servico: {
        discriminacao: servico.descricao || "Serviços prestados",
        valor_servicos: Number(servico.valor || 0),
        item_lista_servico: servico.codigo || "17.18",
        codigo_cnae: servico.cnae || "6920601",
        iss_retido: false,
        aliquota: Number(servico.iss || 0) / 100,
      },
    };

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (token)              headers["Authorization"] = `Bearer ${token}`;
    else if (usuario && senha) headers["Authorization"] = "Basic " + Buffer.from(`${usuario}:${senha}`).toString("base64");

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(dps),
    });

    const responseText = await response.text();
    let responseData;
    try { responseData = JSON.parse(responseText); } catch { responseData = { raw: responseText }; }

    if (!response.ok) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: responseData?.mensagem || responseData?.message || responseData?.erro || "Erro ao emitir NFS-e",
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
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

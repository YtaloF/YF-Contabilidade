// Netlify Function: emitir-nfse.js
// NFS-e via Focus NFe API

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { prestador, tomador, servico, competencia } = JSON.parse(event.body);

    const FOCUS_TOKEN = process.env.FOCUS_NFE_TOKEN;
    if (!FOCUS_TOKEN) {
      return { statusCode: 500, body: JSON.stringify({ error: "FOCUS_NFE_TOKEN não configurado nas variáveis de ambiente" }) };
    }

    const cnpjPrestador = (prestador.cnpj || "").replace(/\D/g, "");
    const cnpjTomador = (tomador.cnpj || "").replace(/\D/g, "");
    const [ano, mes] = (competencia || new Date().toISOString().substring(0, 7)).split("-");
    const dataEmissao = `${ano}-${mes}-01`;
    const referencia = `NFS${Date.now()}`;

    const body = {
      data_emissao: new Date().toISOString().substring(0, 19) + "-03:00",
      prestador: {
        cnpj: cnpjPrestador,
        inscricao_municipal: prestador.insc_municipal || "",
        codigo_municipio: "3300704",
      },
      tomador: {
        razao_social: tomador.nome || "Consumidor Final",
        email: tomador.email || undefined,
        endereco: {
          logradouro: tomador.logradouro || "Não informado",
          numero: tomador.numero || "S/N",
          bairro: tomador.bairro || "Centro",
          codigo_municipio: "3300704",
          uf: tomador.uf || "RJ",
          cep: (tomador.cep || "").replace(/\D/g, ""),
        },
        ...(cnpjTomador.length === 14 ? { cnpj: cnpjTomador } : {}),
        ...(cnpjTomador.length === 11 ? { cpf: cnpjTomador } : {}),
      },
      servico: {
        discriminacao: servico.descricao || "Serviços prestados",
        valor_servicos: parseFloat(String(servico.valor || 0).replace(",", ".")) || 0,
        item_lista_servico: String(servico.codigo || "17.18").replace(/[^0-9.]/g, ""),
        codigo_cnae: String(servico.cnae || "6920601").replace(/\D/g, ""),
        iss_retido: false,
        aliquota: parseFloat(String(servico.iss || 0).replace(",", ".")) / 100 || 0,
        base_calculo: parseFloat(String(servico.valor || 0).replace(",", ".")) || 0,
        valor_iss: (parseFloat(String(servico.valor || 0).replace(",", ".")) * parseFloat(String(servico.iss || 0).replace(",", ".")) / 100) || 0,
        valor_liquido_nfse: parseFloat(String(servico.valor || 0).replace(",", ".")) || 0,
      },
      natureza_operacao: 1,
      optante_simples_nacional: prestador.simples_nacional !== false,
      incentivador_cultural: false,
      competencia: dataEmissao,
    };

    console.log("Enviando para Focus NFe:", JSON.stringify(body, null, 2));

    const response = await fetch(
      `https://api.focusnfe.com.br/v2/nfse?ref=${referencia}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from(FOCUS_TOKEN + ":").toString("base64"),
        },
        body: JSON.stringify(body),
      }
    );

    const responseText = await response.text();
    console.log("Resposta Focus NFe:", response.status, responseText);

    let responseData;
    try { responseData = JSON.parse(responseText); } catch { responseData = { raw: responseText }; }

    if (!response.ok && response.status !== 202) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: responseData?.mensagem || responseData?.erros?.[0]?.mensagem || "Erro ao emitir NFS-e",
          detalhe: responseData,
        })
      };
    }

    // Status 202 = processando (normal na Focus NFe)
    const numero = responseData?.numero_nfse || responseData?.numero || "Processando...";
    const status = responseData?.status || "autorizado";

    return {
      statusCode: 200,
      body: JSON.stringify({
        sucesso: true,
        numero,
        status,
        referencia,
        resposta: responseData,
      })
    };

  } catch (err) {
    console.error("Erro:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

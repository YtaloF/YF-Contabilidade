// Netlify Function: emitir-nfse.js
// NFS-e Cabo Frio — Modernização Pública — envio via DPS (REST/JSON)

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { endpoint, usuario, senha, token, prestador, tomador, servico, competencia } = JSON.parse(event.body);

    if (!endpoint) return { statusCode: 400, body: JSON.stringify({ error: "Endpoint não configurado" }) };

    const dataEmissao = new Date().toISOString().split("T")[0];
    const [ano, mes] = (competencia || dataEmissao.substring(0, 7)).split("-");
    const competenciaFormatada = `${ano}-${mes}-01`;

    // DPS — formato Modernização Pública (Cabo Frio)
    const dps = {
      infDPS: {
        tpAmb: "1", // 1=Produção, 2=Homologação
        dhEmi: new Date().toISOString(),
        verAplic: "1.00",
        serie: "A",
        nDPS: String(Date.now()).slice(-6),
        dCompet: competenciaFormatada,
        prest: {
          CNPJ: (prestador.cnpj || "").replace(/\D/g, ""),
          IM: prestador.insc_municipal || "",
          xNome: prestador.razao_social || "",
        },
        toma: tomador.cnpj
          ? {
              [(tomador.cnpj.replace(/\D/g, "").length === 11) ? "CPF" : "CNPJ"]:
                tomador.cnpj.replace(/\D/g, ""),
              xNome: tomador.nome || "",
              email: tomador.email || undefined,
            }
          : { xNome: tomador.nome || "Consumidor Final" },
        serv: {
          cServ: {
            cTribNac: servico.codigo || "010101",
            xDescServ: servico.descricao || "Serviços contábeis",
          },
          vServPrest: {
            vReceb: Number(servico.valor || 0).toFixed(2),
          },
          tribServ: {
            tribMun: {
              tribISSQN: "1",
              cNatOp: "1",
              BM: {
                vBC: Number(servico.valor || 0).toFixed(2),
                pAliq: Number(servico.iss || 0).toFixed(4),
              },
            },
            totTrib: {
              vTotTrib: (Number(servico.valor || 0) * Number(servico.iss || 0) / 100).toFixed(2),
            },
          },
        },
      },
    };

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    // Autenticação: token Bearer ou Basic
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else if (usuario && senha) {
      headers["Authorization"] = "Basic " + Buffer.from(`${usuario}:${senha}`).toString("base64");
    }

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
          error: responseData?.xMotivo || responseData?.message || responseData?.raw || "Erro ao emitir NFS-e",
          status: response.status,
          detalhe: responseData,
        })
      };
    }

    // Extrair número da NFS-e da resposta
    const numero = responseData?.nNFSe || responseData?.numero || responseData?.infNFSe?.nNFSe || "—";
    const chave  = responseData?.cLocEmi || responseData?.infNFSe?.cLocEmi || "";

    return {
      statusCode: 200,
      body: JSON.stringify({
        sucesso: true,
        numero,
        chave,
        resposta: responseData,
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

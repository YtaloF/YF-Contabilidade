// Netlify Function: emitir-nfse.js
// Emite NFS-e via webservice ABRASF (padrão nacional)

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { endpoint, usuario, senha, token, prestador, tomador, servico, competencia } = JSON.parse(event.body);

    if (!endpoint) {
      return { statusCode: 400, body: JSON.stringify({ error: "Endpoint não configurado" }) };
    }

    // Monta o XML ABRASF padrão para EnviarLoteRpsEnvio
    const dataEmissao = new Date().toISOString().split("T")[0];
    const [ano, mes] = (competencia || dataEmissao.substring(0, 7)).split("-");

    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
  <LoteRps Id="lote1" versao="2.02">
    <NumeroLote>1</NumeroLote>
    <CpfCnpj><Cnpj>${(prestador.cnpj || "").replace(/\D/g, "")}</Cnpj></CpfCnpj>
    <InscricaoMunicipal>${prestador.insc_municipal || ""}</InscricaoMunicipal>
    <QuantidadeRps>1</QuantidadeRps>
    <ListaRps>
      <Rps>
        <InfDeclaracaoPrestacaoServico Id="rps1">
          <Rps>
            <IdentificacaoRps>
              <Numero>1</Numero>
              <Serie>A</Serie>
              <Tipo>1</Tipo>
            </IdentificacaoRps>
            <DataEmissao>${dataEmissao}</DataEmissao>
            <Status>1</Status>
          </Rps>
          <Competencia>${ano}-${mes}-01</Competencia>
          <Servico>
            <Valores>
              <ValorServicos>${Number(servico.valor).toFixed(2)}</ValorServicos>
              <ValorIss>${Number(servico.iss || 0).toFixed(2)}</ValorIss>
              <Aliquota>${Number(servico.iss || 0).toFixed(4)}</Aliquota>
            </Valores>
            <IssRetido>2</IssRetido>
            <ItemListaServico>${servico.codigo || "17.19"}</ItemListaServico>
            <Discriminacao>${servico.descricao || "Serviços contábeis"}</Discriminacao>
            <CodigoMunicipio>3550308</CodigoMunicipio>
          </Servico>
          <Prestador>
            <CpfCnpj><Cnpj>${(prestador.cnpj || "").replace(/\D/g, "")}</Cnpj></CpfCnpj>
            <InscricaoMunicipal>${prestador.insc_municipal || ""}</InscricaoMunicipal>
          </Prestador>
          ${tomador.cnpj ? `<Tomador>
            <IdentificacaoTomador>
              <CpfCnpj>${tomador.cnpj.replace(/\D/g, "").length === 11
                ? `<Cpf>${tomador.cnpj.replace(/\D/g, "")}</Cpf>`
                : `<Cnpj>${tomador.cnpj.replace(/\D/g, "")}</Cnpj>`}
              </CpfCnpj>
            </IdentificacaoTomador>
            <RazaoSocial>${tomador.nome || ""}</RazaoSocial>
            ${tomador.email ? `<Contato><Email>${tomador.email}</Email></Contato>` : ""}
          </Tomador>` : `<Tomador>
            <RazaoSocial>${tomador.nome || "Consumidor Final"}</RazaoSocial>
          </Tomador>`}
          <OptanteSimplesNacional>1</OptanteSimplesNacional>
          <IncentivoFiscal>2</IncentivoFiscal>
        </InfDeclaracaoPrestacaoServico>
      </Rps>
    </ListaRps>
  </LoteRps>
</EnviarLoteRpsEnvio>`;

    // Headers de autenticação
    const headers = {
      "Content-Type": "text/xml; charset=utf-8",
      "SOAPAction": "EnviarLoteRps",
    };
    if (usuario) headers["Authorization"] = "Basic " + Buffer.from(`${usuario}:${senha}`).toString("base64");
    if (token)   headers["Authorization"] = `Bearer ${token}`;

    // Envelope SOAP
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfse="http://www.abrasf.org.br/nfse.xsd">
  <soapenv:Header/>
  <soapenv:Body>
    <nfse:EnviarLoteRpsEnvio>
      ${xmlBody}
    </nfse:EnviarLoteRpsEnvio>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: soapEnvelope,
    });

    const responseText = await response.text();

    // Extrai número da NFS-e da resposta XML
    const numeroMatch = responseText.match(/<Numero>(\d+)<\/Numero>/);
    const erroMatch = responseText.match(/<Mensagem>([^<]+)<\/Mensagem>/);
    const codigoErro = responseText.match(/<Codigo>([^<]+)<\/Codigo>/);

    if (erroMatch && !numeroMatch) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: erroMatch[1],
          codigo: codigoErro?.[1],
          resposta: responseText.substring(0, 500)
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        sucesso: true,
        numero: numeroMatch?.[1],
        resposta: responseText.substring(0, 500)
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

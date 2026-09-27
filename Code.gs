/** Entrada do Web App. */
function doGet(e) {
  const t = HtmlService.createTemplateFromFile('Index');
  t.appNome = APP.NOME;
  t.appVersao = APP.VERSAO;
  return t.evaluate().setTitle(APP.NOME)
    .addMetaTag('viewport','width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function incluir(nome) { return HtmlService.createHtmlOutputFromFile(nome).getContent(); }

/** Fachada única chamada pelo navegador. */
function api(acao, dados) {
  try {
    const rotas = {
      bootstrap: () => obterBootstrap(), painel: () => obterPainel(), listar: () => listarEntidade(dados),
      salvarCliente: () => salvarCliente(dados), salvarEndereco: () => salvarEndereco(dados),
      salvarCadastro: () => salvarCadastro(dados), salvarLocacao: () => salvarLocacao(dados),
      confirmarLocacao: () => confirmarLocacao(dados), registrarPagamento: () => registrarPagamento(dados),
      criarOS: () => criarOS(dados), iniciarOS: () => iniciarOS(dados), concluirOS: () => concluirOS(dados),
      registrarImpedimento: () => registrarImpedimento(dados), gerarPdfOS: () => gerarPdfOS(dados.osId),
      listarMinhasOS: () => listarMinhasOS(dados || {}), calcularDistancia: () => calcularDistancia(dados)
    };
    if (!rotas[acao]) throw new Error('Ação desconhecida.');
    if (acao !== 'bootstrap') autorizar(acao);
    // google.script.run não aceita objetos Date dentro do retorno. Registros
    // lidos da planilha possuem datas reais; por isso todo retorno é convertido
    // para valores simples antes de atravessar a ponte servidor/navegador.
    return { ok:true, dados:normalizarRetornoCliente_(rotas[acao]()) };
  } catch (erro) {
    console.error(erro.stack || erro);
    return { ok:false, erro:erro.message || 'Falha inesperada.' };
  }
}

/**
 * Converte Datas e objetos aninhados em valores serializáveis pelo
 * google.script.run, preservando números, textos, booleanos e valores nulos.
 */
function normalizarRetornoCliente_(valor) {
  if (valor === null || valor === undefined) return valor === undefined ? null : valor;
  if (Object.prototype.toString.call(valor) === '[object Date]') {
    return Utilities.formatDate(valor, APP.TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");
  }
  if (Array.isArray(valor)) return valor.map(normalizarRetornoCliente_);
  if (typeof valor === 'object') {
    const resultado = {};
    Object.keys(valor).forEach(function(chave) {
      resultado[chave] = normalizarRetornoCliente_(valor[chave]);
    });
    return resultado;
  }
  return valor;
}

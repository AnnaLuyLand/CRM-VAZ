/** Cria planilha, abas, cabeçalhos, configurações e pastas. Execute uma vez. */
function instalarSistema(emailPrimeiroAdmin) {
  const props = PropertiesService.getScriptProperties();
  let ss;
  const existente = props.getProperty(APP.PROPRIEDADE_PLANILHA);
  if (existente) ss = SpreadsheetApp.openById(existente);
  else {
    ss = SpreadsheetApp.create(APP.NOME + ' - Banco de Dados');
    props.setProperty(APP.PROPRIEDADE_PLANILHA, ss.getId());
  }
  Object.keys(ABAS).forEach((nome, i) => {
    let sh = ss.getSheetByName(nome);
    if (!sh) sh = i === 0 && ss.getSheets()[0].getLastRow() === 0 ? ss.getSheets()[0].setName(nome) : ss.insertSheet(nome);
    const cab = ABAS[nome];
    if (sh.getMaxColumns() < cab.length) sh.insertColumnsAfter(sh.getMaxColumns(), cab.length-sh.getMaxColumns());
    sh.getRange(1,1,1,cab.length).setValues([cab]).setFontWeight('bold').setBackground('#0f4c81').setFontColor('#fff');
    sh.setFrozenRows(1); sh.autoResizeColumns(1,cab.length);
  });
  let pasta;
  const pastaId = props.getProperty(APP.PROPRIEDADE_PASTA);
  if (pastaId) pasta = DriveApp.getFolderById(pastaId);
  else { pasta = DriveApp.createFolder(APP.NOME + ' - Arquivos'); props.setProperty(APP.PROPRIEDADE_PASTA,pasta.getId()); }
  ['Ordens de Serviço','Comprovantes','Backups'].forEach(n => obterOuCriarPasta_(pasta,n));
  const email = normalizarEmail_(emailPrimeiroAdmin || Session.getEffectiveUser().getEmail());
  if (!email) throw new Error('Informe o e-mail do primeiro administrador em instalarSistema("email@dominio.com").');
  const usuarios = tabela_('Usuarios');
  if (!usuarios.some(u => normalizarEmail_(u.Email) === email)) inserir_('Usuarios', {ID:uuid_(),Email:email,Nome:'Administrador inicial',Perfil:APP.PERFIS.ADMIN,Status:'Ativo',CriadoEm:agora_(),AtualizadoEm:agora_()});
  const padroes = {
    NOME_EMPRESA:'Minha Empresa', ENDERECO_BASE:'', VALOR_KM:'0', COBRANCA_TRAJETO:'Ida e volta',
    TAXA_MINIMA:'0', DISTANCIA_ISENCAO_KM:'0', ARREDONDAMENTO_KM:'1', PRAZO_PADRAO_DIAS:'15'
  };
  Object.keys(padroes).forEach(chave => {
    if (!buscarPor_('Configuracoes','Chave',chave)) inserir_('Configuracoes',{Chave:chave,Valor:padroes[chave],Descricao:'Configuração do sistema',AtualizadoEm:agora_(),AtualizadoPor:email});
  });
  SpreadsheetApp.flush();
  return {planilhaUrl:ss.getUrl(),pastaUrl:pasta.getUrl(),administrador:email};
}

function criarDadosDemonstracao() {
  autorizarAdmin_();
  if (!tabela_('TiposResiduos').length) {
    inserir_('TiposResiduos',{ID:uuid_(),Nome:'Entulho de obra',Descricao:'Resíduo classe A',Permitido:'Sim',ValorAdicional:0,Status:'Ativo',CriadoEm:agora_(),AtualizadoEm:agora_()});
    inserir_('TiposResiduos',{ID:uuid_(),Nome:'Resíduo perigoso',Descricao:'Não aceito',Permitido:'Não',ValorAdicional:0,Status:'Ativo',CriadoEm:agora_(),AtualizadoEm:agora_()});
  }
  if (!tabela_('Cacambas').length) for (let i=1;i<=5;i++) inserir_('Cacambas',{ID:uuid_(),Numero:String(i).padStart(3,'0'),VolumeM3:5,Status:APP.CACAMBA.DISPONIVEL,CriadoEm:agora_(),CriadoPor:emailAtual_(),AtualizadoEm:agora_(),AtualizadoPor:emailAtual_()});
  return 'Dados demonstrativos criados.';
}

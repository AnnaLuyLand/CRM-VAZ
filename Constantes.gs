/** Constantes centrais. Alterar nomes aqui evita divergências entre módulos. */
const APP = Object.freeze({
  NOME: 'Gestão de Caçambas',
  VERSAO: '1.0.1',
  TZ: 'America/Sao_Paulo',
  PROPRIEDADE_PLANILHA: 'PLANILHA_ID',
  PROPRIEDADE_PASTA: 'PASTA_RAIZ_ID',
  PERFIS: { ADMIN: 'Administrador', ATENDENTE: 'Atendente', MOTORISTA: 'Motorista' },
  CACAMBA: { DISPONIVEL:'Disponível', RESERVADA:'Reservada', LOCADA:'Locada', MANUTENCAO:'Em manutenção', INATIVA:'Inativa' },
  LOCACAO: { ELABORACAO:'Em elaboração', CONFIRMADA:'Confirmada', ANDAMENTO:'Em andamento', AGUARDANDO:'Aguardando retirada', FINALIZADA:'Finalizada', CANCELADA:'Cancelada' },
  ITEM: { RESERVADO:'Reservado', ENTREGA_PROGRAMADA:'Entrega programada', ENTREGUE:'Entregue', RETIRADA_SOLICITADA:'Retirada solicitada', RETIRADA_PROGRAMADA:'Retirada programada', RETIRADO:'Retirado', CANCELADO:'Cancelado', TROCADO:'Trocado' },
  OS: { PROGRAMADA:'Programada', DESLOCAMENTO:'Em deslocamento', EXECUCAO:'Em execução', CONCLUIDA:'Concluída', NAO_REALIZADA:'Não realizada', CANCELADA:'Cancelada' }
});

const ABAS = Object.freeze({
  Usuarios:['ID','Email','Nome','Perfil','MotoristaID','Status','CriadoEm','AtualizadoEm'],
  Clientes:['ID','TipoPessoa','NomeRazao','NomeFantasia','CpfCnpj','Responsavel','Telefone1','Telefone2','Email','Observacoes','Status','CriadoEm','CriadoPor','AtualizadoEm','AtualizadoPor'],
  Enderecos:['ID','ClienteID','Descricao','CEP','Logradouro','Numero','Complemento','Bairro','Cidade','Estado','Referencia','Latitude','Longitude','ObservacoesAcesso','Status','CriadoEm','AtualizadoEm'],
  Cacambas:['ID','Numero','VolumeM3','TipoModelo','Status','Observacoes','CriadoEm','CriadoPor','AtualizadoEm','AtualizadoPor'],
  Motoristas:['ID','Nome','CPF','CNH','CategoriaCNH','ValidadeCNH','Telefone','Status','CaminhaoID','Observacoes','CriadoEm','AtualizadoEm'],
  Caminhoes:['ID','Placa','Modelo','Capacidade','Status','MotoristaID','Observacoes','CriadoEm','AtualizadoEm'],
  TiposResiduos:['ID','Nome','Descricao','Permitido','Orientacoes','ValorAdicional','Status','CriadoEm','AtualizadoEm'],
  Locacoes:['ID','Numero','ClienteID','EnderecoID','EnderecoSnapshot','DataSolicitacao','PrazoPadrao','DistanciaKm','TaxaDeslocamento','Desconto','Acrescimo','ValorTotal','ValorRecebido','Saldo','StatusOperacional','StatusFinanceiro','Observacoes','CriadoEm','CriadoPor','AtualizadoEm','AtualizadoPor'],
  LocacaoItens:['ID','LocacaoID','CacambaID','TipoResiduoID','ValorBase','ValorDiaria','EntregaPrevista','EntregaEfetiva','RetiradaPrevista','RetiradaEfetiva','MotoristaEntregaID','CaminhaoEntregaID','MotoristaRetiradaID','CaminhaoRetiradaID','DiasExcedentes','ValorAdicional','Status','Observacoes','CriadoEm','AtualizadoEm'],
  OrdensServico:['ID','Numero','Tipo','LocacaoID','ClienteID','EnderecoSnapshot','DataProgramada','MotoristaID','CaminhaoID','Prioridade','Observacoes','Status','InicioEm','ConclusaoEm','NomeSignatario','AssinaturaArquivoID','MotivoImpedimento','PdfArquivoID','Idempotencia','CriadoEm','CriadoPor','AtualizadoEm'],
  OSItens:['ID','OSID','LocacaoItemID','CacambaID','TipoResiduoID'],
  ArquivosOS:['ID','OSID','Tipo','ArquivoID','Nome','MimeType','Tamanho','CriadoEm','CriadoPor'],
  Pagamentos:['ID','LocacaoID','Data','Valor','Forma','ComprovanteArquivoID','Observacao','Status','Idempotencia','CriadoEm','CriadoPor'],
  MovimentacoesCacambas:['ID','CacambaID','LocacaoItemID','OSID','Tipo','StatusAnterior','StatusNovo','DataHora','Usuario','Observacao'],
  Manutencoes:['ID','CacambaID','Motivo','Descricao','EntradaEm','ConclusaoEm','Responsavel','Custo','Status','Observacoes','CriadoEm','CriadoPor'],
  Configuracoes:['Chave','Valor','Descricao','AtualizadoEm','AtualizadoPor'],
  Auditoria:['ID','DataHora','Usuario','Acao','Entidade','EntidadeID','AntesJSON','DepoisJSON','Justificativa']
});

const PERMISSOES = Object.freeze({
  Administrador:['*'],
  Atendente:['painel','listar','salvarCliente','salvarEndereco','salvarLocacao','confirmarLocacao','registrarPagamento','criarOS','gerarPdfOS'],
  Motorista:['painelMotorista','listarMinhasOS','iniciarOS','concluirOS','registrarImpedimento']
});

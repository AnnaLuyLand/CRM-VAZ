function listarEntidade(d){
  const permitidas=['Clientes','Enderecos','Cacambas','Motoristas','Caminhoes','TiposResiduos','Locacoes','LocacaoItens','OrdensServico','Pagamentos','Manutencoes'];
  if(!d||!permitidas.includes(d.entidade))throw new Error('Entidade inválida.');
  const u=usuarioAtual_(); if(u.Perfil===APP.PERFIS.MOTORISTA)throw new Error('Consulta não permitida.');
  return tabela_(d.entidade).slice(-Math.min(numero_(d.limite)||500,1000)).reverse();
}

function salvarCliente(d){
  exigir_(d,['TipoPessoa','NomeRazao','CpfCnpj']); const doc=somenteDigitos_(d.CpfCnpj); if(!validarCpfCnpj_(doc))throw new Error('CPF/CNPJ inválido.');
  const dup=tabela_('Clientes').find(x=>String(x.CpfCnpj)===doc&&String(x.ID)!==String(d.ID||''));if(dup)throw new Error('CPF/CNPJ já cadastrado.');
  const agora=agora_(), obj={TipoPessoa:d.TipoPessoa,NomeRazao:sanitizarTexto_(d.NomeRazao,150),NomeFantasia:sanitizarTexto_(d.NomeFantasia,150),CpfCnpj:doc,Responsavel:sanitizarTexto_(d.Responsavel,120),Telefone1:somenteDigitos_(d.Telefone1),Telefone2:somenteDigitos_(d.Telefone2),Email:normalizarEmail_(d.Email),Observacoes:sanitizarTexto_(d.Observacoes),Status:d.Status||'Ativo',AtualizadoEm:agora,AtualizadoPor:emailAtual_()};
  if(d.ID){const r=atualizarPorId_('Clientes',d.ID,obj);auditar_('ATUALIZAR','Clientes',d.ID,r.antes,r.depois,d.justificativa);return r.depois;}
  obj.ID=uuid_();obj.CriadoEm=agora;obj.CriadoPor=emailAtual_();inserir_('Clientes',obj);auditar_('CRIAR','Clientes',obj.ID,null,obj);return obj;
}
function salvarEndereco(d){
  exigir_(d,['ClienteID','Descricao','CEP','Logradouro','Numero','Cidade','Estado']); if(!buscarPor_('Clientes','ID',d.ClienteID))throw new Error('Cliente não encontrado.');
  const obj={ClienteID:d.ClienteID,Descricao:sanitizarTexto_(d.Descricao,80),CEP:somenteDigitos_(d.CEP),Logradouro:sanitizarTexto_(d.Logradouro,150),Numero:sanitizarTexto_(d.Numero,20),Complemento:sanitizarTexto_(d.Complemento,80),Bairro:sanitizarTexto_(d.Bairro,80),Cidade:sanitizarTexto_(d.Cidade,80),Estado:sanitizarTexto_(d.Estado,2).toUpperCase(),Referencia:sanitizarTexto_(d.Referencia,200),Latitude:numero_(d.Latitude)||'',Longitude:numero_(d.Longitude)||'',ObservacoesAcesso:sanitizarTexto_(d.ObservacoesAcesso),Status:d.Status||'Ativo',AtualizadoEm:agora_()};
  if(d.ID){const r=atualizarPorId_('Enderecos',d.ID,obj);auditar_('ATUALIZAR','Enderecos',d.ID,r.antes,r.depois,d.justificativa);return r.depois;}
  obj.ID=uuid_();obj.CriadoEm=agora_();inserir_('Enderecos',obj);auditar_('CRIAR','Enderecos',obj.ID,null,obj);return obj;
}
function salvarCadastro(d){
  autorizarAdmin_();const permitidas=['Cacambas','Motoristas','Caminhoes','TiposResiduos','Usuarios','Manutencoes'];if(!d||!permitidas.includes(d.entidade))throw new Error('Cadastro inválido.');
  const obj=Object.assign({},d.registro);delete obj._linha; if(d.entidade==='Motoristas'){obj.CPF=somenteDigitos_(obj.CPF);if(!validarCpf_(obj.CPF))throw new Error('CPF inválido.');}
  if(d.entidade==='Caminhoes'){obj.Placa=String(obj.Placa||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(!validarPlaca_(obj.Placa))throw new Error('Placa inválida.');}
  const agora=agora_();obj.AtualizadoEm=agora;if(obj.ID){const r=atualizarPorId_(d.entidade,obj.ID,obj);auditar_('ATUALIZAR',d.entidade,obj.ID,r.antes,r.depois,d.justificativa);return r.depois;}
  obj.ID=uuid_();obj.CriadoEm=agora;inserir_(d.entidade,obj);auditar_('CRIAR',d.entidade,obj.ID,null,obj);return obj;
}

function snapshotEndereco_(e){return json_({descricao:e.Descricao,cep:e.CEP,logradouro:e.Logradouro,numero:e.Numero,complemento:e.Complemento,bairro:e.Bairro,cidade:e.Cidade,estado:e.Estado,referencia:e.Referencia,latitude:e.Latitude,longitude:e.Longitude});}
function calcularTaxa_(km){const c=configuracoes_(),dist=numero_(km),isento=numero_(c.DISTANCIA_ISENCAO_KM),multip=c.COBRANCA_TRAJETO==='Ida e volta'?2:1,passo=Math.max(0.01,numero_(c.ARREDONDAMENTO_KM)||1);if(dist<=isento)return 0;const arred=Math.ceil(dist/passo)*passo;return Math.max(numero_(c.TAXA_MINIMA),arred*numero_(c.VALOR_KM)*multip);}
function calcularDistancia(d){
  exigir_(d,['enderecoDestino']); const c=configuracoes_();
  if(d.distanciaManual!==undefined&&d.distanciaManual!==''){if(!d.justificativa)throw new Error('Justifique a distância manual.');return {km:numero_(d.distanciaManual),taxa:calcularTaxa_(d.distanciaManual),origem:'Manual',justificativa:d.justificativa};}
  if(!c.ENDERECO_BASE)throw new Error('Configure o endereço-base ou informe distância manual.');
  const dir=Maps.newDirectionFinder().setOrigin(c.ENDERECO_BASE).setDestination(d.enderecoDestino).setMode(Maps.DirectionFinder.Mode.DRIVING).getDirections();
  const metros=dir.routes?.[0]?.legs?.[0]?.distance?.value;if(!metros)throw new Error('Não foi possível calcular a rota. Use distância manual.');const km=Math.round(metros/100)/10;return {km:km,taxa:calcularTaxa_(km),origem:'Google Directions'};
}

function salvarLocacao(d){
  exigir_(d,['ClienteID','EnderecoID']);if(!Array.isArray(d.itens)||!d.itens.length)throw new Error('Inclua ao menos uma caçamba.');
  const cliente=buscarPor_('Clientes','ID',d.ClienteID),end=buscarPor_('Enderecos','ID',d.EnderecoID);if(!cliente||!end||String(end.ClienteID)!==String(cliente.ID))throw new Error('Cliente/endereço inválido.');
  const id=d.ID||uuid_(),agora=agora_(),prazo=numero_(d.PrazoPadrao)||15,taxa=numero_(d.TaxaDeslocamento),desc=numero_(d.Desconto),acre=numero_(d.Acrescimo);
  let subtotal=0;const itens=d.itens.map(i=>{const c=buscarPor_('Cacambas','ID',i.CacambaID),r=buscarPor_('TiposResiduos','ID',i.TipoResiduoID);if(!c)throw new Error('Caçamba inválida.');if(!r||r.Permitido!=='Sim')throw new Error('Tipo de resíduo proibido ou inválido.');const base=numero_(i.ValorBase),ad=numero_(r.ValorAdicional);subtotal+=base+ad;return {ID:i.ID||uuid_(),LocacaoID:id,CacambaID:c.ID,TipoResiduoID:r.ID,ValorBase:base,ValorDiaria:numero_(i.ValorDiaria),EntregaPrevista:i.EntregaPrevista||'',RetiradaPrevista:i.RetiradaPrevista||'',ValorAdicional:ad,Status:i.Status||APP.ITEM.RESERVADO,Observacoes:sanitizarTexto_(i.Observacoes),CriadoEm:agora,AtualizadoEm:agora};});
  const total=Math.max(0,subtotal+taxa+acre-desc), obj={ID:id,Numero:d.Numero||('LOC-'+Utilities.formatDate(agora,APP.TZ,'yyyyMMdd-HHmmss')),ClienteID:cliente.ID,EnderecoID:end.ID,EnderecoSnapshot:snapshotEndereco_(end),DataSolicitacao:d.DataSolicitacao||dataIso_(agora),PrazoPadrao:prazo,DistanciaKm:numero_(d.DistanciaKm),TaxaDeslocamento:taxa,Desconto:desc,Acrescimo:acre,ValorTotal:total,ValorRecebido:0,Saldo:total,StatusOperacional:APP.LOCACAO.ELABORACAO,StatusFinanceiro:'Pendente',Observacoes:sanitizarTexto_(d.Observacoes),CriadoEm:agora,CriadoPor:emailAtual_(),AtualizadoEm:agora,AtualizadoPor:emailAtual_()};
  if(d.ID)throw new Error('Edição de locação exige fluxo administrativo específico; crie uma nova versão nesta versão inicial.');inserir_('Locacoes',obj);itens.forEach(i=>inserir_('LocacaoItens',i));auditar_('CRIAR','Locacoes',id,null,Object.assign({},obj,{itens:itens}));return obj;
}

function confirmarLocacao(d){
  exigir_(d,['locacaoId']);const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{const loc=buscarPor_('Locacoes','ID',d.locacaoId);if(!loc||loc.StatusOperacional!==APP.LOCACAO.ELABORACAO)throw new Error('Locação não está em elaboração.');const itens=tabela_('LocacaoItens').filter(i=>String(i.LocacaoID)===String(loc.ID));if(!itens.length)throw new Error('Locação sem itens.');itens.forEach(i=>{const c=buscarPor_('Cacambas','ID',i.CacambaID);if(!c||c.Status!==APP.CACAMBA.DISPONIVEL)throw new Error('Caçamba '+(c?c.Numero:i.CacambaID)+' não está disponível.');});itens.forEach(i=>movimentarCacamba_(i.CacambaID,i.ID,'','Reserva',APP.CACAMBA.RESERVADA));const r=atualizarPorId_('Locacoes',loc.ID,{StatusOperacional:APP.LOCACAO.CONFIRMADA,AtualizadoEm:agora_(),AtualizadoPor:emailAtual_()});auditar_('CONFIRMAR','Locacoes',loc.ID,r.antes,r.depois);return r.depois;}finally{lock.releaseLock();}
}

function registrarPagamento(d){
  exigir_(d,['locacaoId','valor','forma','idempotencia']);if(!['Dinheiro','Pix'].includes(d.forma))throw new Error('Forma inválida.');if(numero_(d.valor)<=0)throw new Error('Valor deve ser positivo.');const dup=buscarPor_('Pagamentos','Idempotencia',d.idempotencia);if(dup)return dup;
  const loc=buscarPor_('Locacoes','ID',d.locacaoId);if(!loc)throw new Error('Locação não encontrada.');const p={ID:uuid_(),LocacaoID:loc.ID,Data:d.data||agora_(),Valor:numero_(d.valor),Forma:d.forma,ComprovanteArquivoID:'',Observacao:sanitizarTexto_(d.observacao),Status:'Confirmado',Idempotencia:d.idempotencia,CriadoEm:agora_(),CriadoPor:emailAtual_()};inserir_('Pagamentos',p);
  const recebido=tabela_('Pagamentos').filter(x=>String(x.LocacaoID)===String(loc.ID)&&x.Status==='Confirmado').reduce((s,x)=>s+numero_(x.Valor),0),saldo=Math.max(0,numero_(loc.ValorTotal)-recebido),status=saldo<=0?'Pago':recebido>0?'Parcialmente pago':'Pendente';atualizarPorId_('Locacoes',loc.ID,{ValorRecebido:recebido,Saldo:saldo,StatusFinanceiro:status,AtualizadoEm:agora_()});auditar_('PAGAMENTO','Locacoes',loc.ID,null,p);return p;
}

function obterPainel(){
  const cac=tabela_('Cacambas'),loc=tabela_('Locacoes'),os=tabela_('OrdensServico'),hoje=dataIso_(new Date());const itens=tabela_('LocacaoItens');
  return {cacambasPorStatus:cac.reduce((a,x)=>(a[x.Status]=(a[x.Status]||0)+1,a),{}),locacoesAndamento:loc.filter(x=>[APP.LOCACAO.CONFIRMADA,APP.LOCACAO.ANDAMENTO,APP.LOCACAO.AGUARDANDO].includes(x.StatusOperacional)).length,
    servicosHoje:os.filter(x=>dataIso_(x.DataProgramada)===hoje).length,ordensPendentes:os.filter(x=>![APP.OS.CONCLUIDA,APP.OS.CANCELADA].includes(x.Status)).length,
    valoresPendentes:loc.reduce((s,x)=>s+numero_(x.Saldo),0),itensExcedentes:itens.filter(i=>i.EntregaEfetiva&&!i.RetiradaEfetiva&&diasExcedentes_(i.EntregaEfetiva,null,buscarPor_('Locacoes','ID',i.LocacaoID)?.PrazoPadrao)>0).length};
}

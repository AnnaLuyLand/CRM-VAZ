/** Camada de acesso tabular. Leituras e gravações ficam concentradas aqui. */
function planilha_() {
  const id = PropertiesService.getScriptProperties().getProperty(APP.PROPRIEDADE_PLANILHA);
  if (!id) throw new Error('Sistema não instalado. Execute instalarSistema().');
  return SpreadsheetApp.openById(id);
}
function aba_(nome) { const sh=planilha_().getSheetByName(nome); if(!sh) throw new Error('Aba ausente: '+nome); return sh; }
function tabela_(nome) {
  const sh=aba_(nome), valores=sh.getDataRange().getValues();
  if (valores.length<2) return [];
  const cab=valores[0]; return valores.slice(1).filter(l=>l.some(v=>v!=='' && v!==null)).map(l=>Object.fromEntries(cab.map((c,i)=>[c,l[i]])));
}
function inserir_(nome,obj) {
  const cab=ABAS[nome]; if(!cab) throw new Error('Tabela inválida.');
  aba_(nome).appendRow(cab.map(c => obj[c] === undefined ? '' : obj[c])); return obj;
}
function buscarPor_(nome,campo,valor) { return tabela_(nome).find(r => String(r[campo])===String(valor)) || null; }
function atualizarPorId_(nome,id,alteracoes,campoId) {
  campoId=campoId||'ID'; const sh=aba_(nome), dados=sh.getDataRange().getValues(), cab=dados[0], ci=cab.indexOf(campoId);
  if(ci<0) throw new Error('Chave não encontrada: '+campoId);
  const idx=dados.findIndex((r,i)=>i>0 && String(r[ci])===String(id)); if(idx<1) throw new Error('Registro não encontrado.');
  const antes=Object.fromEntries(cab.map((c,i)=>[c,dados[idx][i]]));
  const depois=Object.assign({},antes,alteracoes); sh.getRange(idx+1,1,1,cab.length).setValues([cab.map(c=>depois[c]===undefined?'':depois[c])]);
  return {antes:antes,depois:depois};
}
function configuracoes_() { return Object.fromEntries(tabela_('Configuracoes').map(r=>[r.Chave,r.Valor])); }
function uuid_(){return Utilities.getUuid();}
function agora_(){return new Date();}
function dataIso_(d){ return d ? Utilities.formatDate(new Date(d),APP.TZ,'yyyy-MM-dd') : ''; }
function numero_(v){ const n=Number(String(v??0).replace(',','.')); return isFinite(n)?n:0; }
function json_(v){return JSON.stringify(v||{});}
function pastaRaiz_(){const id=PropertiesService.getScriptProperties().getProperty(APP.PROPRIEDADE_PASTA);if(!id)throw new Error('Pasta raiz não configurada.');return DriveApp.getFolderById(id);}
function obterOuCriarPasta_(pai,nome){const it=pai.getFoldersByName(nome);return it.hasNext()?it.next():pai.createFolder(nome);}

function auditar_(acao,entidade,id,antes,depois,justificativa){
  inserir_('Auditoria',{ID:uuid_(),DataHora:agora_(),Usuario:emailAtual_(),Acao:acao,Entidade:entidade,EntidadeID:id,AntesJSON:json_(antes),DepoisJSON:json_(depois),Justificativa:justificativa||''});
}
function movimentarCacamba_(cacambaId,itemId,osId,tipo,statusNovo,obs){
  const c=buscarPor_('Cacambas','ID',cacambaId); if(!c)throw new Error('Caçamba não encontrada.');
  atualizarPorId_('Cacambas',cacambaId,{Status:statusNovo,AtualizadoEm:agora_(),AtualizadoPor:emailAtual_()});
  inserir_('MovimentacoesCacambas',{ID:uuid_(),CacambaID:cacambaId,LocacaoItemID:itemId||'',OSID:osId||'',Tipo:tipo,StatusAnterior:c.Status,StatusNovo:statusNovo,DataHora:agora_(),Usuario:emailAtual_(),Observacao:obs||''});
}

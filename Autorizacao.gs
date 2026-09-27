function normalizarEmail_(v){return String(v||'').trim().toLowerCase();}
function emailAtual_(){return normalizarEmail_(Session.getActiveUser().getEmail());}
function usuarioAtual_(){
  const email=emailAtual_(); if(!email) throw new Error('Não foi possível identificar sua Conta Google. Implante exigindo login.');
  const u=tabela_('Usuarios').find(x=>normalizarEmail_(x.Email)===email && x.Status==='Ativo');
  if(!u) throw new Error('Usuário não autorizado: '+email); return u;
}
function autorizar(acao){const u=usuarioAtual_(),p=PERMISSOES[u.Perfil]||[];if(!(p.includes('*')||p.includes(acao)))throw new Error('Seu perfil não permite esta ação.');return u;}
function autorizarAdmin_(){const u=usuarioAtual_();if(u.Perfil!==APP.PERFIS.ADMIN)throw new Error('Acesso exclusivo do administrador.');return u;}
function obterBootstrap(){
  const u=usuarioAtual_();
  return {app:{nome:APP.NOME,versao:APP.VERSAO},usuario:{id:u.ID,nome:u.Nome,email:u.Email,perfil:u.Perfil,motoristaId:u.MotoristaID||''},
    permissoes:PERMISSOES[u.Perfil]||[],config:configuracoes_(),opcoes:obterOpcoes_(u)};
}
function obterOpcoes_(u){
  const filtrados=(nome,campo,valor)=>tabela_(nome).filter(r=>!campo||String(r[campo])===String(valor));
  return {clientes:filtrados('Clientes','Status','Ativo'),enderecos:filtrados('Enderecos','Status','Ativo'),cacambas:filtrados('Cacambas'),
    motoristas:filtrados('Motoristas','Status','Ativo'),caminhoes:filtrados('Caminhoes'),residuos:filtrados('TiposResiduos','Status','Ativo')};
}

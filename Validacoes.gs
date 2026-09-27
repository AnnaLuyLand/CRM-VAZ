function somenteDigitos_(v){return String(v||'').replace(/\D/g,'');}
function validarCpfCnpj_(v){const d=somenteDigitos_(v);return d.length===11?validarCpf_(d):d.length===14?validarCnpj_(d):false;}
function validarCpf_(s){if(/^(\d)\1+$/.test(s))return false;let calc=(n)=>{let soma=0;for(let i=0;i<n;i++)soma+=Number(s[i])*(n+1-i);let r=(soma*10)%11;return r===10?0:r;};return calc(9)===Number(s[9])&&calc(10)===Number(s[10]);}
function validarCnpj_(s){if(/^(\d)\1+$/.test(s))return false;const dig=(base,pesos)=>{let soma=0;for(let i=0;i<pesos.length;i++)soma+=Number(base[i])*pesos[i];const r=soma%11;return r<2?0:11-r;};return dig(s,[5,4,3,2,9,8,7,6,5,4,3,2])===Number(s[12])&&dig(s,[6,5,4,3,2,9,8,7,6,5,4,3,2])===Number(s[13]);}
function validarPlaca_(v){return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,''));}
function exigir_(obj,campos){campos.forEach(c=>{if(obj[c]===undefined||obj[c]===null||String(obj[c]).trim()==='')throw new Error('Campo obrigatório: '+c);});}
function sanitizarTexto_(v,max){return String(v||'').replace(/[<>]/g,'').trim().slice(0,max||2000);}
function parseData_(v){if(!v)return null;const d=new Date(String(v).length===10?v+'T12:00:00':v);if(isNaN(d))throw new Error('Data inválida.');return d;}
function diasExcedentes_(entrega,retirada,prazo){const e=parseData_(entrega),r=parseData_(retirada||new Date());if(!e)return 0;const limite=new Date(e);limite.setDate(limite.getDate()+numero_(prazo||15));return Math.max(0,Math.floor((r-limite)/86400000));}
function validarMotoristaCaminhao_(motoristaId,caminhaoId){
  const m=buscarPor_('Motoristas','ID',motoristaId),c=buscarPor_('Caminhoes','ID',caminhaoId);if(!m||m.Status!=='Ativo')throw new Error('Motorista indisponível.');
  if(parseData_(m.ValidadeCNH)<new Date())throw new Error('Motorista com CNH vencida.');if(!c||['Em manutenção','Inativo'].includes(c.Status))throw new Error('Caminhão indisponível.');
  if(m.CaminhaoID&&String(m.CaminhaoID)!==String(c.ID))throw new Error('Caminhão não associado ao motorista.');return {m,c};
}

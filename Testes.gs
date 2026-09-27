/** Testes de regras puras. Não altera dados. */
function executarTestesUnitarios(){
  const casos=[
    ['CPF válido',validarCpfCnpj_('529.982.247-25')===true],
    ['CPF inválido',validarCpfCnpj_('111.111.111-11')===false],
    ['CNPJ válido',validarCpfCnpj_('04.252.011/0001-10')===true],
    ['Placa antiga',validarPlaca_('ABC-1234')===true],
    ['Placa Mercosul',validarPlaca_('ABC1D23')===true],
    ['Prazo até 16/10',diasExcedentes_('2026-10-01','2026-10-16',15)===0],
    ['Excedente em 17/10',diasExcedentes_('2026-10-01','2026-10-17',15)===1]
  ];
  const falhas=casos.filter(x=>!x[1]).map(x=>x[0]);if(falhas.length)throw new Error('Falhas: '+falhas.join(', '));return casos.map(x=>x[0]+' OK');
}

# Plano e evidências de testes

## Testes automatizáveis no editor

Execute `executarTestesUnitarios()` no Apps Script. A função lança erro se alguma regra pura falhar.

## Roteiro funcional

| Caso | Procedimento | Resultado esperado |
|---|---|---|
| CPF/CNPJ inválido | Salvar documento inválido | Bloqueio com mensagem |
| Documento duplicado | Repetir CPF/CNPJ | Bloqueio |
| Vários endereços | Criar dois para um cliente | Ambos vinculados pelo ID |
| Várias caçambas | Chamar `salvarLocacao` com dois objetos em `itens` | Dois itens para uma locação |
| Concorrência | Confirmar a mesma locação simultaneamente | Uma confirmação; outra bloqueada |
| Resíduo proibido | Selecionar `Permitido = Não` | Locação bloqueada |
| Prazo 01–16/10 | Entrega 01/10, retirada 16/10 | 0 dia excedente |
| Diária 17/10 | Entrega 01/10, retirada 17/10 | 1 dia excedente |
| Pagamento parcial | Pagar menos que o total | Parcialmente pago e saldo correto |
| Repetição de pagamento | Reenviar mesma idempotência | Não duplica |
| Duas fotos | Enviar somente uma | Conclusão bloqueada no cliente e servidor |
| CNH vencida | Criar OS para motorista vencido | Bloqueio |
| Caminhão manutenção | Criar OS com caminhão indisponível | Bloqueio |
| Motorista | Acessar OS de outro motorista | Bloqueio no servidor |
| Retirada | Concluir OS | Caçamba disponível/manutenção e histórico preservado |
| PDF | Gerar após conclusão | PDF criado no Drive |

## Evidência incluída

As validações puras de CPF, CNPJ, placa e prazo são cobertas por `Testes.gs`. As regras integradas dependem de autorização real e recursos Google; devem ser executadas em uma planilha de homologação antes da produção.

# Cobrança de licenças por revenda — Asaas

O licenciamento manual e permanente continua disponível. Nenhuma empresa é convertida automaticamente. Não há split: o proprietário da cobrança é a revenda da empresa; clientes diretos usam a conta `direct` da plataforma. A cobrança de licenças não interfere nos pagamentos das encomendas.

## Configuração

1. Configure `BILLING_ENCRYPTION_KEY` no Railway: 32 bytes aleatórios em hexadecimal, gerados fora do chat. Faça backup seguro. Não altere a chave após conectar contas sem um procedimento de migração das credenciais.
2. Acesse `/admin` → **Cobranças**. Cada revenda conecta sua própria chave API Asaas; o administrador pode configurar a conta direta e as revendas. Use **Sandbox** primeiro.
3. Crie no Asaas um webhook para a URL exibida nessa tela, habilitando todos os eventos de cobranças e assinaturas. Defina um token aleatório exclusivo de 32 a 255 caracteres, diferente da chave API; informe o mesmo token na conexão do EncomendAki. O servidor valida `asaas-access-token`. Não reutilize senhas como token.
4. Configure canais e régua de avisos no Asaas (e-mail/WhatsApp, disponibilidade, consentimentos e custos da própria conta). O sistema cadastra o pagador com notificações habilitadas, mas não altera a régua nem promete ativar um canal que a conta não tenha disponível.
5. Em **Cobrança** na linha da empresa, informe CPF/CNPJ, telefone com DDD, valor por ciclo, periodicidade, primeiro vencimento e tolerância. Confirme explicitamente a criação de cobranças.
6. Valide no Sandbox: criação, pendência, recebimento, repetição do webhook, atraso, estorno, cancelamento e isolamento entre duas revendas. Só então conecte produção para uma cobrança real autorizada. Uma conexão com assinaturas não canceladas não pode mudar de conta ou ambiente; use outra revenda de testes ou cancele antes da troca.

## Comportamento

- API keys ficam cifradas com AES-256-GCM, com identificação da conta como AAD; nunca retornam ao navegador. Tokens de webhook são armazenados como hash.
- Cadastro de pagador/assinatura usa referência externa exclusiva e registro local antes de chamar o Asaas. Em caso de falha ou timeout, **Sincronizar Asaas** procura o recurso antes de tentar criar novamente. Uma trava temporária no banco reduz criações concorrentes.
- Webhook autenticado consulta o estado atual na API da conta correta; não confia em valor/status recebido no corpo. Eventos são deduplicados por conta, ambiente e ID. Falhas retornam erro para permitir reenvio. Há conciliação de até 50 assinaturas a cada 15 minutos e botão de sincronização.
- A primeira versão cria cobranças periódicas por Pix, boleto ou escolha no Asaas (`UNDEFINED`). Não coleta cartão no EncomendAki e não configura débito automático no cartão nem Pix Automático. A recorrência é a geração das cobranças: o pagador paga cada uma no link do Asaas.
- A validade automática é calculada pelas cobranças confirmadas/recebidas de valor suficiente: vencimento da cobrança + ciclo contratado + tolerância. Meses com menos dias usam o último dia do mês. O vencimento manual anterior é respeitado até terminar; uma licença permanente deixa de conceder acesso ilimitado quando convertida explicitamente para automática. A tolerância também se aplica ao período anterior preservado. Uma cobrança pendente não renova o período.
- Suspensões/inativações administrativas nunca são removidas pelo pagamento. Estornos deixam de conceder o período correspondente na próxima sincronização. Pagamentos em Sandbox nunca ampliam a licença.
- A tela **Minha assinatura / Pagar** permanece disponível para o estabelecimento mesmo com a licença vencida. URLs externas de pagamento são restritas a HTTPS em domínios Asaas.
- Cancelar a recorrência volta ao controle manual. Mantém a validade manual anterior ou, quando maior, a validade automática já adquirida (incluindo tolerância). Confira e ajuste a data manual após cancelar. As cobranças já emitidas devem ser conferidas/canceladas no Asaas conforme a regra comercial; não são prometidas como automaticamente eliminadas pelo EncomendAki.
- Trocar a revenda de um cliente com assinatura em andamento é bloqueado. Cancele a recorrência antiga antes e configure uma nova cobrança na conta de destino.
- Alterar o plano/valor no cadastro manual da empresa não altera o contrato financeiro no Asaas. Nesta versão, mudanças de cobrança são feitas com cancelamento e nova assinatura, conferindo antes as faturas existentes para evitar sobreposição. Histórico permanece no banco.

## Limites e operação

Não foi contratado nem disparado pagamento real por esta implementação. A ativação exige credenciais e homologação Sandbox. Monitore filas de webhooks no Asaas e logs de conciliação; mantenha o serviço Railway em execução para a conciliação periódica. Não há provisionamento por landing page nesta etapa. A chave mestra protege credenciais em repouso; quem administra o servidor e seu banco continua sendo um operador de confiança.

Referências: https://docs.asaas.com/reference/criar-nova-assinatura · https://docs.asaas.com/docs/sobre-os-webhooks · https://docs.asaas.com/reference/listar-cobrancas-de-uma-assinatura

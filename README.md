# EncomendAki

Sistema de encomendas com servidor Node.js 24, PostgreSQL, login e três perfis: administrador global, revenda e estabelecimento. A loja pública usa catálogo, carrinho e etapas por produto e grava o pedido no banco antes de abrir a mensagem do WhatsApp.

## Desenvolvimento local

1. Instale Node.js 24 ou superior e execute `npm ci`.
2. Copie `.env.example` para `.env`. Defina `ADMIN_EMAIL` e uma `ADMIN_PASSWORD` exclusiva com no mínimo 12 caracteres.
3. Execute `npm start` e abra `http://localhost:4173/login` (ou o endereço definido em PUBLIC_URL).
4. Sem DATABASE_URL, o desenvolvimento utiliza SQLite persistente em `data/development.sqlite`. Nunca use esse modo para o deploy.

O primeiro administrador é criado no banco no primeiro início. Nas próximas inicializações, as variáveis não alteram sua senha. Use Minha senha no painel. Não há credenciais padrão nem contas demonstrativas criadas automaticamente em produção.

## Deploy no Railway

Conecte o repositório `donds86/encomendaki`, branch `dev`, e adicione um serviço PostgreSQL. O projeto inclui `railway.json`, Dockerfile e comando `npm start`.

Variáveis do serviço da aplicação:

| Variável | Valor |
| --- | --- |
| NODE_ENV | production |
| DATABASE_URL | Referência à DATABASE_URL do serviço PostgreSQL, por exemplo `${{Postgres.DATABASE_URL}}` |
| PUBLIC_URL | URL HTTPS final da aplicação, sem caminho; exemplo `https://cake.up.railway.app` |
| ADMIN_EMAIL | Seu e-mail para o primeiro administrador |
| ADMIN_PASSWORD | Senha exclusiva de 12 a 128 caracteres para o primeiro administrador |

O Railway injeta PORT automaticamente. O servidor escuta em `0.0.0.0`. Se PUBLIC_URL não estiver definido, usa `https://RAILWAY_PUBLIC_DOMAIN` quando disponível. Produção recusa inicializar sem PostgreSQL ou sem URL HTTPS. Para o primeiro deploy, gere o domínio público nas configurações de rede antes de concluir o início do serviço. Configure backups do PostgreSQL no ambiente de hospedagem.

As migrações idempotentes são aplicadas na inicialização. O healthcheck `/health` verifica a conexão com o banco. Não há dados persistidos no disco da aplicação em produção: catálogo, fotos, pedidos, contas, sessões e auditoria ficam no PostgreSQL.

## Primeiro uso

- Entre em `/admin` com ADMIN_EMAIL e ADMIN_PASSWORD.
- Cadastre revendas com e-mail e senha de acesso. Somente o administrador global gerencia revendas.
- Cadastre uma empresa, responsável, e-mail, senha, link da loja, plano e validade. A revenda só cadastra e administra empresas vinculadas a ela.
- Abra o painel da empresa e configure catálogo, preços, adicionais e WhatsApp com DDD e número (+55 fixo).
- Compartilhe `/loja/slug-da-empresa` com os clientes. O estabelecimento entra em `/` (ou `/login`), com a conta da própria empresa.
- O botão final registra a encomenda e abre o WhatsApp com a mensagem pronta. Se o navegador bloquear a janela, o comprovante mostra um link para abrir o WhatsApp. O envio da mensagem e a disponibilidade dependem da confirmação das pessoas.
- Licenças inativas, suspensas ou vencidas bloqueiam a API e a loja, mas a gestão continua acessível para regularização.
- A senha pode ser alterada pelo usuário; o gestor pode redefinir a senha ao editar uma empresa/revenda. Não há recuperação automática por e-mail nesta versão.

## Regras de preço

Preço do tamanho + diferença do preço base do produto em relação a R$ 65 + recheios extras + adicional fixo por andar + topo. O backend valida preços não negativos, recalcula em centavos e salva os valores no pedido. Até três andares e seis recheios. O módulo Marketing é restrito ao plano Profissional, com bloqueio também na API; os demais recursos continuam disponíveis nos dois planos. Cobrança automática não está implementada.

## Verificação

`npm test` executa testes de integração HTTP com banco real SQLite em arquivo temporário. `TEST_DATABASE_URL` executa a mesma suíte com PostgreSQL. O GitHub Actions configura PostgreSQL 17 e testa os dois modos. Testes cobrem autenticação, isolamento entre empresas/revendas, licenças, preços adulterados, concorrência de catálogo, duplicação de pedido, persistência, auditoria e logout.

Veja `ARCHITECTURE.md` para o modelo de dados e limites operacionais. Os dados do antigo mockup no navegador não são importados automaticamente para o servidor.

## Empresa demonstrativa local

Para criar Doce Ateliê com quatro pedidos fictícios no banco local, defina DEMO_PASSWORD (mínimo 12 caracteres) e execute `npm run seed:demo`. O acesso será `demo@cakedelivery.local`, com a senha que você definiu. O script é bloqueado em produção e quando DATABASE_URL está configurada; não sobrescreve uma empresa já existente. A loja fica em `/loja/doce-atelie`; configure o WhatsApp antes de enviar encomendas.

## Acessos separados e demonstração para leads

- `/`: acesso exclusivo do estabelecimento. `/login` permanece como endereço alternativo.
- `/admin`: administrador da plataforma e revendas. Sessão e cookie separados; uma sessão administrativa não abre a gestão na raiz.
- `/loja/slug`: montagem pública do pedido.

Em `/admin`, clique em **Criar demonstração** para provisionar uma empresa separada **Maysa Lima · Demonstração**, com licença permanente, credenciais geradas, quatro pedidos fictícios e o cardápio da imagem de 2026. Login, senha (exibida uma vez) e link da loja aparecem na confirmação. Cada criação gera uma instância independente, sem alterar clientes existentes.

Cardápio demonstrativo: 10 cm/4 fatias/R$ 80; 12 cm/6/R$ 100; 15 cm/12/R$ 140; 20 cm/22/R$ 190; 25 cm/35/R$ 260; 30 cm/52/R$ 360; 35 cm/76/R$ 490. Tradicionais: Brigadeiro, Ninho e Coco. Especiais: Nutella, Morango, Maracujá, Abacaxi, Nozes, Ameixa, Pêssego e Doce de leite, com mínimos de R$ 15 por opção para a apresentação. Andar adicional: R$ 20. Topo não incluso e sem valor informado, portanto não oferecido com preço automático. Sem acréscimo por quantidade nesta configuração, pois a imagem não define uma regra. Limite técnico de seleção: seis recheios.

Pedidos com recheios especiais mostram total estimado e mensagem de confirmação do valor final, porque o cardápio diz “a partir de”. Todos esses adicionais e comportamentos são editáveis em Preços. O número 99873-6335 é apresentado como contato; o WhatsApp permanece sem configuração até informar país e DDD. Nenhum DDD foi inferido. A imagem original não integra a publicação no GitHub; somente os dados de cardápio foram cadastrados.


Demonstrações criadas por `demo.created` são convertidas para licença permanente pela migração única `permanent-demo-v1`. São preservados dados, login, senha, slug e status. A validade interna `9999-12-31` representa licença sem vencimento e aparece como Permanente no painel; ainda é possível suspender ou desativar a licença. A opção é editável no cadastro da empresa.

## E-mail compartilhado entre empresa e revenda
O mesmo e-mail pode ser cadastrado no estabelecimento (`/`) e em uma revenda (`/admin`). São contas independentes; cada uma tem sua própria senha, sessão e permissões. O e-mail continua único dentro de cada portal: não pode identificar duas empresas distintas na raiz nem duas contas de gestão em `/admin`. A migração `scoped-email-v1` remove a restrição global antiga e preserva usuários, hashes, vínculos e sessões existentes. O login consulta apenas as contas do portal acessado.

A montagem inclui Tema logo após Recheios, com opções prontas, sem tema ou personalizado. O tema é salvo no pedido e enviado no WhatsApp; não altera automaticamente o preço. A navegação Voltar/Continuar e a finalização ficam após o resumo, no computador e no celular.


## Temas e imagens de referência

No painel da confeitaria, o menu **Temas** permite cadastrar, editar e excluir opções com nome, descrição e foto opcional. A lista é individual por empresa e atualiza a etapa Tema da loja. Personalizado permanece como opção livre. Excluir ou renomear um tema não altera o texto salvo em pedidos anteriores.

O cliente pode anexar uma imagem opcional na etapa Tema: JPG, PNG ou WebP, até 2 MB, com prévia e remoção. Uma imagem também pode descrever um tema personalizado sem texto adicional. O backend valida formato, assinatura e tamanho. A referência é gravada em order_references, vinculada ao pedido e à empresa no PostgreSQL; não é salva no disco temporário do serviço Railway nem retornada na listagem de pedidos. Os detalhes do pedido carregam a imagem em um endpoint autenticado e autorizado pelo tenant. Permanece após reinício/deploy, junto aos demais dados do banco.

Fotos de temas fazem parte do catálogo público. A imagem anexada pelo comprador pertence ao pedido privado. O WhatsApp recebe somente o texto indicando a existência de uma referência no sistema; o link wa.me não anexa arquivos automaticamente. Para enviar também na conversa, o cliente deve anexar a imagem manualmente. Não há nova variável de ambiente para este armazenamento, que usa DATABASE_URL já configurada. O limite total de atualização do catálogo continua em 8 MB.

## Personalização e fotos

No painel do estabelecimento, **Personalização** controla nome público, logomarca, imagem de topo, cor, título, subtítulo, aviso do cardápio, Instagram, contato e rodapé. O WhatsApp foi movido de Preços para esse menu. Logos e fotos de topo ficam no banco dentro do catálogo versionado da empresa. Fotos de produtos/temas/topo são reduzidas no navegador, mantendo a proporção (originais de até 20 MB; saída normalmente abaixo de 700 KB). O servidor continua validando os arquivos e o limite de 8 MB por atualização do catálogo. Cartões e resumo possuem regiões de imagem de tamanho fixo com object-fit, sem avançar sobre textos ou botões.

## Ficha técnica e estoque

1. Em **Estoque**, cadastre os insumos e a unidade base: g, ml ou un. Informe saldo inicial, estoque mínimo e custo por unidade base.
2. Registre compras/entradas e saídas/perdas com motivo. As quantidades aceitam até três casas decimais. Use sempre a unidade base: 1 kg = 1.000 g.
3. Em **Ficha técnica**, cadastre a composição por produto e tamanho. Opcionalmente, adicione fichas de recheios por tamanho; elas serão somadas à base conforme a escolha do cliente. Cada ficha representa um andar; o consumo é multiplicado pela quantidade de andares. O custo calculado corresponde apenas aos insumos, sem mão de obra, impostos ou despesas gerais.
4. Pedidos novos capturam os insumos das fichas existentes. Ao aceitar, o consumo é reservado, sem reduzir o saldo físico. Em Produção ou Entregue dá baixa uma única vez. Cancelado libera a reserva e estorna uma baixa existente, também uma única vez. Voltar de um status produzido para Novo/Aceito reverte a baixa; haverá nova baixa se retornar à produção.
5. Produção é bloqueada se os insumos mapeados forem insuficientes, respeitando as reservas de outros pedidos aceitos. Pedidos sem ficha de base são sinalizados, mas permanecem operáveis. A previsão pode estar incompleta até cadastrar as fichas. Pedidos ainda sem ficha completa capturam novamente ao mudar de Novo/Aceito/Cancelado para um status ativo; pedidos já mapeados preservam o snapshot mesmo após editar ou excluir uma ficha.
6. Selecione o mês em Estoque para ver demanda, disponível, falta prevista e data da primeira falta, além da previsão por data de entrega. Ela considera pedidos Novo/Aceito, saldo atual e reservas de outros meses. Compras futuras não registradas não são consideradas.

## Acompanhamento do pedido

Novas mensagens WhatsApp incluem um link `/pedido/token-aleatorio`. A página mostra status, bolo, tamanho, tema, entrega e valor, sem nome, observações ou anexos. O link funciona sem login e deve ser compartilhado apenas com o cliente. O botão Atualizar consulta o status atual. Cancelado aparece explicitamente. Pedidos antigos recebem um token na inicialização e seu link aparece nos detalhes do pedido no painel; mensagens WhatsApp já enviadas não podem ser alteradas retroativamente.

## Revenda responsável

No `/admin`, **Vincular revenda** permite atribuir a empresa à revenda correta. Criar demonstração também oferece a seleção da revenda. Para a solicitação Maysa/Gledson, uma migração auditada vincula automaticamente a única Maysa demonstrativa ainda sem revenda à única revenda com Gledson no nome. Ela preserva os acessos, não modifica empresas já vinculadas e não escolhe entre múltiplas correspondências. Se houver ambiguidade, selecione explicitamente a revenda no painel global.
# Encomendas em diferentes segmentos

A loja pública agora começa por um catálogo e permite vários itens no mesmo carrinho. Cada item possui sua própria configuração; a data, o horário solicitado e o contato são comuns à encomenda. O carrinho fica na sessão da página e é registrado no servidor ao finalizar. Atualizar/fechar a página antes da finalização limpa o carrinho.

- **Produtos → Perguntas e regras:** modelos bolo, produto simples, doces por lote e personalizado. Perguntas de texto ou seleção, obrigatórias ou opcionais. Tamanhos e preços próprios, instruções, antecedência e condições de pagamento por produto.
- **Doces:** configure, por exemplo, lote de 100, até quatro sabores e mínimo/múltiplo de 25 por sabor. A distribuição é por lote; dois lotes multiplicam a distribuição. Para distribuições distintas, adicione o mesmo produto outra vez.
- **Tortas e personalizados:** tamanhos próprios (P/M/G, rendimento e preço) e perguntas como sabor, cor ou texto da estampa. Não precisam responder às etapas do bolo.
- **Personalização:** identidade visual, textos do topo, segmento, antecedência geral, pagamento e mensagens por status. A maior antecedência entre a loja e os itens determina a primeira data disponível, em dias corridos. O horário solicitado depende da confirmação do estabelecimento; não há bloqueio de capacidade por faixa horária.
- **Agenda:** calendário mensal com filtro de status, seleção de dia e lista ordenada por horário. **Pedidos → Lista / Kanban:** Novo, Aceito, Em Produção, Finalizado, Entregue e Cancelado, com mudança pela seleção de etapa.
- **Notificações:** ao atualizar o status, o painel prepara um link de WhatsApp com a mensagem configurada e o número informado pelo cliente. O operador precisa abrir o link e enviar. Não há integração contratada com API de WhatsApp nem disparo automático em segundo plano. O acompanhamento público reflete o status salvo e possui botão de atualização.
- **Estoque:** ficha por unidade/lote nos produtos simples e por tamanho/andar nos bolos. Quantidades dos vários itens são somadas; Finalizado mantém a baixa da produção, e o cancelamento estorna uma vez. A imagem de referência é única para a encomenda e fica privada no painel.

Os pedidos antigos continuam acessíveis. A migração `commerce-v1` amplia os status e preserva materiais, anexos e links de acompanhamento. O total e todas as escolhas são validados no servidor; os preços enviados pelo navegador não são usados.

## Relacionamento e operação

- Pedidos concentra Lista e Kanban, com busca por nome ou código (com ou sem #), filtro compartilhado e atualização automática de 15 segundos. O acompanhamento público também consulta a cada 15 segundos em abas visíveis. O código e a loja estão visíveis para distinguir demonstrações diferentes.
- Links novos de acompanhamento usam a origem pública validada da requisição, evitando um PUBLIC_URL antigo quando o serviço muda de domínio. Mensagens antigas já enviadas não são reescritas. Mantenha PUBLIC_URL atualizado.
- No cadastro administrativo, segmento Festas e alimentação, Personalizados ou Outros define o catálogo de exemplo e o tema inicial. Em empresas existentes, mudar o segmento preserva produtos e imagens; a opção explícita de aplicar o padrão substitui apenas textos e cor. Personalização continua disponível ao estabelecimento.
- Produtos → Perguntas e regras inclui complementos relacionados (até 12 por produto). A loja sugere itens ainda ausentes do carrinho antes da finalização, sem inclusão obrigatória nem alteração de preços. É recomendação manual do estabelecimento, não uma estatística de compras de outros clientes.
- Marketing Pro oferece campanhas anuais do evento, datas fixas e clientes inativos. A antecedência é configurável. Apenas pedidos entregues e contatos com autorização explícita alimentam as campanhas. O checkout informa evento/data opcionais e consentimento desmarcado.
- As mensagens são preparadas ao consultar o módulo; não há trabalhador de envio, API WhatsApp ou notificações agendadas fora do painel. O operador abre o WhatsApp e confirma manualmente o registro do envio. Registros impedem repetição por campanha/telefone/ocasião. A opção Não receber mais retira o contato das campanhas da loja. Não há contato automático com compras legadas sem consentimento.
- WhatsApp é brasileiro, com +55 fixo na tela. O backend aceita DDD+número ou o número completo com +55 e normaliza o armazenamento. Temas habilitados nos bolos são obrigatórios no carrinho e na validação do servidor; Sem tema é uma escolha explícita.

## Bloqueio de dias na agenda

Em Agenda, selecione uma data e use Marcar dia como indisponível ou Liberar este dia. O bloqueio é individual por estabelecimento, vale para o dia inteiro e não cancela nem altera pedidos já registrados. O calendário da loja desabilita datas bloqueadas e respeita a antecedência mínima dos produtos. A lista fica em commerce.blockedDates no catálogo versionado. O servidor consulta o catálogo atual dentro da transação do pedido e recusa datas bloqueadas mesmo quando o cliente estava com uma página antiga aberta; tentativas idempotentes de pedidos já registrados continuam retornando o pedido original.

## Tema claro e escuro

O botão no topo permite alternar a aparência em todas as telas. A preferência é salva localmente no navegador (encomendaki-color-mode) e sincronizada entre abas da mesma origem. Sem escolha salva, utiliza a preferência de cor do sistema. A preferência visual não altera o catálogo nem as configurações da empresa.

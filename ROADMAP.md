# Roadmap

## Fonte de verdade

Este arquivo segue o backlog original do projeto. O objetivo aqui e manter:

- status real de cada milestone
- o ultimo bloco implementado
- o proximo bloco correto
- a regra operacional de atualizar este arquivo a cada bloco

## Regras fixas do projeto

- stack: `Next.js + Vercel + Supabase`
- pagamento: `Mercado Pago Checkout Pro`
- emails: `Resend`
- rate limit distribuido: `Upstash Redis`
- acesso do cliente por token assinado, sem login
- geracao do produto e manual no MVP
- modo presente fica para fase 2
- upsells fisicos ficam para fase 3
- antes de integrar libs, SDKs, APIs ou CLIs, consultar docs atuais via `ctx7`
- ao fim de cada bloco: atualizar este arquivo e fazer push para o remoto

## Ordem de execucao

1. Milestones `1`, `2`, `3`
2. Milestone `4`
3. Milestones `5`, `6`
4. Milestones `7`, `8`, `9`
5. Milestone `10`
6. Milestones `11`, `12`
7. Milestone `13`

## Milestone 1: Fundacao

Status: `feito`

Escopo original:

- inicializar o app com Next.js App Router, TypeScript, ESLint, Prettier e estrutura modular
- configurar ambientes local, preview e prod com variaveis e secrets
- integrar Supabase ao app
- configurar observabilidade basica
- configurar headers de seguranca e CSP inicial

Evidencias:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/next.config.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/next.config.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/env.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/env.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/supabase/server.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/supabase/server.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/supabase/browser.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/supabase/browser.ts)

## Milestone 2: Modelo de dados

Status: `feito`

Escopo original:

- criar schema inicial do banco
- definir enums, constraints, indices e idempotencia
- definir politica de retencao de dados e limpeza

Evidencias:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/supabase/migrations/20260403_000001_initial_foundation.sql](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/supabase/migrations/20260403_000001_initial_foundation.sql)

## Milestone 3: Seguranca minima obrigatoria

Status: `parcial`

Feito:

- validacao com `zod` nas partes centrais do fluxo publico
- auth separada para admin
- token assinado para acesso do cliente ao pedido
- rate limiting base nas rotas criticas
- responses genericas para o client
- honeypot no formulario publico
- endurecimento do webhook com validacao estrutural, idempotencia menos fragil e transicoes seguras

Pendente:

- garantir `zod` em todas as rotas sem excecao
- revisar transicoes criticas restantes com testes de concorrencia
- revisar sanitizacao de campos livres de ponta a ponta
- revisar logs e respostas para confirmar ausencia de vazamento sensivel

Evidencias:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/orders/schema.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/orders/schema.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/auth/admin.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/auth/admin.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/security/order-access-token.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/security/order-access-token.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/security/rate-limit.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/security/rate-limit.ts)

## Milestone 4: Upload seguro

Status: `feito`

Feito:

- fluxo de upload temporario da foto
- validacao por MIME, magic bytes e decode real
- remocao de EXIF e normalizacao
- armazenamento em bucket privado com UUID
- limpeza automatica de upload nao convertido em pedido pago
- limpeza automatica da foto apos uso operacional

Evidencias:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/api/uploads/baby-photo/route.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/api/uploads/baby-photo/route.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/uploads/cleanup.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/uploads/cleanup.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/api/internal/cleanup/uploads/route.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/api/internal/cleanup/uploads/route.ts)

## Milestone 5: Catalogo e regras comerciais

Status: `feito`

Escopo original:

- modelar catalogo com pack e avulsos
- permitir multiplos produtos avulsos no mesmo pedido
- implementar regra de ancora de preco do pack
- implementar aviso e upsell para troca de avulsos pelo pack

Evidencias:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/catalog.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/catalog.ts)

## Milestone 6: Interface publica

Status: `feito`

Observacao:

- existe interface publica funcional e consistente
- o design system existe de forma implicita na base visual, mas nao foi separado como camada formal

Evidencias:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/page.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/criar/_components/create-order-form.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/criar/_components/create-order-form.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/pedido/[token]/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/pedido/[token]/page.tsx)

## Milestone 7: Checkout assincrono

Status: `feito`

Observacao:

- o fluxo principal esta implementado
- ainda cabe endurecimento adicional do webhook e testes de idempotencia

Evidencias:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/orders/repository.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/orders/repository.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/api/webhooks/mercadopago/route.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/api/webhooks/mercadopago/route.ts)

## Milestone 8: Entrega

Status: `feito`

Escopo original:

- estrutura de entregaveis privados
- upload admin dos entregaveis finais
- publicacao da entrega
- links assinados com expiracao
- pagina de entrega final

Evidencias:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/orders/deliverables.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/orders/deliverables.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/pedido/[token]/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/pedido/[token]/page.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/api/pedido/[token]/zip/route.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/api/pedido/[token]/zip/route.ts)

## Milestone 9: Admin operacional

Status: `feito`

Escopo original:

- dashboard minimo de pedidos
- tela de detalhe operacional
- acoes operacionais minimas

Evidencias:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/page.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/pedidos/[id]/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/pedidos/[id]/page.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/actions.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/actions.ts)

## Milestone 10: Email

Status: `parcial`

Feito:

- integracao com Resend
- emails transacionais
  - pedido recebido
  - pagamento aprovado
  - entrega pronta

Pendente:

- preferencia e consentimento de drip
- agendamento de drip semanal
- unsubscribe

Evidencias:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/email/client.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/email/client.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/email/service.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/email/service.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/orders/email-events.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/orders/email-events.ts)

## Milestone 11: Blog e AdSense readiness

Status: `quase feito`

Feito:

- MDX no app
- template editorial
- template programatico de nomes
- paginas institucionais

Pendente:

- preparar slots e estrutura explicita para AdSense sem degradar a base

Evidencias:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/blog/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/blog/page.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/blog/[slug]/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/blog/[slug]/page.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/blog/nomes/[slug]/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/blog/nomes/[slug]/page.tsx)

## Milestone 12: Conteudo inicial

Status: `parcial`

Feito:

- lote inicial de conteudo editorial
- lote inicial de paginas programaticas de nomes
- sitemap, robots e linking base

Pendente:

- aumentar o volume ate o patamar desejado para submissao no AdSense

Evidencias:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/content/blog](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/content/blog)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/content/names.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/content/names.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/sitemap.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/sitemap.ts)

## Milestone 13: Hardening

Status: `parcial`

Feito:

- parte do rate limit
- honeypot no formulario publico
- correcao da duplicacao do email de entrega
- endurecimento de webhook com recuperacao de evento preso e sem regressao de status
- validacao de transicoes operacionais no admin
- limpeza automatizada de uploads expirados

Pendente:

- testar race conditions em pagamentos e transicoes criticas
- testar duplicidade de webhook
- testar abuso de upload e limites
- testar expiracao de links e acesso indevido
- revisar checklist final do `docs/SECURITY.md`

Evidencias:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/security/rate-limit.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/security/rate-limit.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/criar/actions.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/criar/actions.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/actions.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/actions.ts)

## Ultimo bloco implementado

Bloco:

- `fix: harden payment webhook and upload cleanup`

Escopo:

- validacao estrutural e idempotencia mais segura no webhook do Mercado Pago
- transicoes de status protegidas no webhook e no admin
- limpeza automatica de uploads expirados e fotos apos uso operacional

Commit:

- `3865358`

## Proximo bloco correto

Fechar os pendentes de `Milestone 10`:

- preferencia e consentimento de drip
- agendamento de jobs reais
- unsubscribe

## Bloco seguinte

Retomar os pendentes restantes de:

- `Milestone 3`
- `Milestone 13`

Escopo alvo:

- fechar `zod` nas rotas restantes
- testar concorrencia e duplicidade de webhook
- revisar checklist final do `docs/SECURITY.md`

## Regra operacional

Ao fim de cada bloco:

1. atualizar este `ROADMAP.md`
2. validar o bloco
3. criar commit
4. fazer push para o remoto

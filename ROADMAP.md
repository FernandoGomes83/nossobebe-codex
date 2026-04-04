# Roadmap

## Objetivo

Entregar o MVP do Nossobebe com:

- venda de `pack + avulsos`
- checkout assíncrono com Mercado Pago Checkout Pro
- operação manual pelo admin
- entrega digital segura
- blog e páginas programáticas para SEO e AdSense
- segurança tratada como requisito de entrada

## Regras do projeto

- stack: `Next.js + Vercel + Supabase`
- pagamento: `Mercado Pago Checkout Pro`
- emails: `Resend`
- rate limit distribuído: `Upstash Redis`
- acesso do cliente por token assinado, sem login
- geração de conteúdo do pedido é manual no MVP
- modo presente fica para fase 2
- upsells físicos ficam para fase 3
- antes de integrar libs/SDKs, consultar docs atuais via `ctx7`

## Milestones

### 1. Fundação

Status: `feito`

Escopo:

- bootstrap do app em Next.js
- integração base com Supabase
- variáveis de ambiente e utilitários de env
- headers de segurança
- base visual inicial

Referências principais:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/env.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/env.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/supabase/server.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/supabase/server.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/next.config.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/next.config.ts)

### 2. Banco e segurança base

Status: `feito`

Escopo:

- schema inicial no Supabase
- buckets privados
- auth separada para admin
- token assinado para pedido
- criptografia/hash de email
- rate limit com fallback local e suporte a Upstash

Referências principais:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/supabase/migrations/20260403_000001_initial_foundation.sql](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/supabase/migrations/20260403_000001_initial_foundation.sql)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/security/order-access-token.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/security/order-access-token.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/security/crypto.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/security/crypto.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/security/rate-limit.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/security/rate-limit.ts)

### 3. Pedido e checkout

Status: `feito`

Escopo:

- catálogo com pack e avulsos
- regra de ancoragem comercial do pack
- wizard de pedido
- upload seguro da foto
- criação do pedido e da sessão de checkout
- integração com Mercado Pago Checkout Pro
- página pública de status do pedido

Referências principais:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/catalog.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/catalog.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/orders/schema.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/orders/schema.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/orders/repository.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/orders/repository.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/criar/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/criar/page.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/api/uploads/baby-photo/route.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/api/uploads/baby-photo/route.ts)

### 4. Webhook e estados do pedido

Status: `feito`

Escopo:

- webhook do Mercado Pago
- confirmação assíncrona do pagamento
- atualização dos estados do pedido
- registro de eventos operacionais

Referências principais:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/api/webhooks/mercadopago/route.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/api/webhooks/mercadopago/route.ts)

### 5. Admin operacional

Status: `feito`

Escopo:

- login admin
- dashboard básico
- detalhe do pedido
- mudança manual de status
- upload e publicação de entregáveis

Referências principais:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/login/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/login/page.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/page.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/pedidos/[id]/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/pedidos/[id]/page.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/actions.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/actions.ts)

### 6. Entrega digital

Status: `feito`

Escopo:

- signed URLs para entregáveis
- página pública do pedido com downloads
- ZIP consolidado do pedido

Referências principais:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/pedido/[token]/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/pedido/[token]/page.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/api/pedido/[token]/zip/route.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/api/pedido/[token]/zip/route.ts)

### 7. Emails transacionais

Status: `feito`

Escopo:

- email de pedido criado
- email de pagamento aprovado
- email de entrega pronta

Referências principais:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/email/service.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/email/service.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/orders/email-events.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/orders/email-events.ts)

### 8. Blog, SEO e base para AdSense

Status: `feito`

Escopo:

- blog em MDX
- páginas institucionais
- sitemap e robots
- schema JSON-LD
- breadcrumbs
- páginas programáticas de nomes

Referências principais:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/blog/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/blog/page.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/blog/nomes/page.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/blog/nomes/page.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/layout.tsx](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/layout.tsx)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/sitemap.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/sitemap.ts)

### 9. Conteúdo inicial

Status: `feito`

Escopo:

- artigos editoriais iniciais
- base inicial de páginas programáticas de nomes

Referências principais:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/content/blog](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/content/blog)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/content/names.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/content/names.ts)

### 10. Operação e produção

Status: `feito`

Escopo:

- setup operacional
- checklist de produção
- bootstrap do primeiro admin
- scripts de validação de ambiente e smoke check

Referências principais:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/SETUP.md](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/SETUP.md)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/PRODUCTION_CHECKLIST.md](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/PRODUCTION_CHECKLIST.md)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/scripts/bootstrap-admin.mjs](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/scripts/bootstrap-admin.mjs)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/scripts/check-env.mjs](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/scripts/check-env.mjs)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/scripts/smoke-check.mjs](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/scripts/smoke-check.mjs)

### 11. Hardening do MVP

Status: `em andamento`

Feito até agora:

- rate limit nas rotas críticas
- deduplicação prática do email de entrega
- honeypot no formulário público

Referências principais:

- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/security/rate-limit.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/lib/security/rate-limit.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/criar/actions.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/criar/actions.ts)
- [/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/actions.ts](/Users/fernando/Desenvolvimento/pessoal/nossobebe_codex/src/app/admin/actions.ts)

## Último bloco implementado

`fix: harden public order flow`

Escopo:

- adição de honeypot no pedido
- bloqueio server-side do honeypot
- envio do email de entrega apenas na transição real para `ready`

Commit:

- `2cf6758`

## Próximo bloco

### Hardening do webhook e limpeza operacional

Status planejado: `próximo`

Escopo:

- endurecer validações do webhook do Mercado Pago
- adicionar limpeza automática de uploads/fotos expiradas
- revisar mais pontos de abuso em rotas públicas

## Bloco seguinte

### Drip básico

Status planejado: `depois do próximo bloco`

Escopo:

- começar a usar `drip_jobs`
- registrar jobs reais no banco
- preparar disparo inicial com Resend

## Como usar este arquivo

Atualizar ao fim de cada bloco:

- milestone afetado
- status
- commit do bloco
- próximo bloco planejado

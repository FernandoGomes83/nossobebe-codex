# Setup Operacional

## Stack

- Next.js 16
- Supabase
- Mercado Pago Checkout Pro
- Resend
- Upstash Redis Rate Limit

## Variáveis obrigatórias

Copie `.env.example` para `.env.local` e preencha:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_URL`
- `EMAIL_ENCRYPTION_KEY`
- `ORDER_ACCESS_TOKEN_SECRET`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`

## Variáveis recomendadas para produção

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Sem Upstash, o projeto usa um fallback local em memória para rate limiting. Isso é aceitável para desenvolvimento, mas não para produção real.

## Supabase

1. Criar projeto no Supabase
2. Configurar Auth por email/senha para admin
3. Aplicar a migration em `supabase/migrations/20260403_000001_initial_foundation.sql`
4. Criar pelo menos um usuário admin no Auth
5. Inserir esse usuário em `public.admin_users`

## Mercado Pago

1. Criar aplicação do tipo Checkout Pro
2. Copiar Access Token
3. Configurar webhook apontando para:

`https://seu-dominio.com/api/webhooks/mercadopago`

4. Copiar o segredo do webhook

## Resend

1. Criar conta e chave de API
2. Configurar domínio ou usar sender inicial de teste
3. Definir `EMAIL_FROM`

## Comandos

```bash
npm install
npm run dev
```

Build validado localmente:

```bash
npm run lint
npx next build --webpack
npm run smoke:check
```

## Bootstrap inicial

Gerar segredos fortes:

```bash
npm run generate:secrets
```

Criar o primeiro admin no Supabase:

```bash
npm run bootstrap:admin -- --email admin@exemplo.com --password 'senha-forte' --name 'Seu Nome'
```

Esse comando:

- cria o usuário no Auth com email confirmado
- grava `role=admin` em `app_metadata`
- insere o usuário em `public.admin_users`

Validar variáveis obrigatórias antes de subir:

```bash
npm run check:env
```

## Observações

- No sandbox atual, `next build` com Turbopack já apresentou panic interno. O build com Webpack passou.
- O fluxo de entrega já suporta publicação manual de entregáveis no admin.
- O rate limit distribuído só fica ativo quando as envs do Upstash existem.

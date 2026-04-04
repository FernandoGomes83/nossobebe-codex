# Production Checklist

## Antes do deploy

- [ ] Preencher todas as variáveis obrigatórias do `.env.example`
- [ ] Gerar segredos com `npm run generate:secrets`
- [ ] Rodar `npm run check:env`
- [ ] Rodar `npm run smoke:check`
- [ ] Rodar `npm run lint`
- [ ] Rodar `npx next build --webpack`

## Supabase

- [ ] Projeto criado
- [ ] Migration `20260403_000001_initial_foundation.sql` aplicada
- [ ] Buckets privados confirmados
- [ ] Auth por email habilitada para admin
- [ ] Primeiro admin criado com `npm run bootstrap:admin -- --email ... --password ...`

## Mercado Pago

- [ ] Aplicação criada como Checkout Pro
- [ ] Access token configurado
- [ ] Webhook configurado para `/api/webhooks/mercadopago`
- [ ] Segredo do webhook configurado
- [ ] Fluxo de pagamento validado em sandbox

## Resend

- [ ] API key configurada
- [ ] Sender `EMAIL_FROM` configurado
- [ ] Domínio validado ou sender de teste aceito para o ambiente atual
- [ ] Email de pedido criado validado
- [ ] Email de pagamento aprovado validado
- [ ] Email de entrega publicada validado

## Rate limiting

- [ ] `UPSTASH_REDIS_REST_URL` configurada
- [ ] `UPSTASH_REDIS_REST_TOKEN` configurado
- [ ] Confirmado que o ambiente nao esta usando fallback local em memoria

## Smoke tests manuais

- [ ] Criar pedido em `/criar`
- [ ] Confirmar abertura do checkout
- [ ] Verificar atualizacao de status por webhook
- [ ] Entrar no admin
- [ ] Marcar pedido como `in_production`
- [ ] Subir entregavel
- [ ] Publicar entregavel
- [ ] Baixar arquivo individual pela pagina do pedido
- [ ] Baixar ZIP consolidado

## Conteudo e SEO

- [ ] `/blog` carregando
- [ ] `/blog/nomes` carregando
- [ ] `NEXT_PUBLIC_ADSENSE_CLIENT_ID` configurado, se a monetização for ativada agora
- [ ] Slots `NEXT_PUBLIC_ADSENSE_BLOG_*` configurados para os artigos do blog, se a monetização for ativada agora
- [ ] `robots.txt` carregando
- [ ] `sitemap.xml` carregando
- [ ] Páginas institucionais publicadas

## Observação

No ambiente atual, `next build` com Turbopack já apresentou panic interno de sandbox. O build válido para conferência foi `npx next build --webpack`.

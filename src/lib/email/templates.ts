function wrapEmailTemplate(input: {
  preview: string;
  title: string;
  intro: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const ctaBlock =
    input.ctaHref && input.ctaLabel
      ? `<p style="margin:24px 0 0;"><a href="${input.ctaHref}" style="display:inline-block;padding:14px 18px;border-radius:999px;background:#e74c8b;color:#fffafc;text-decoration:none;font-weight:700;">${input.ctaLabel}</a></p>`
      : "";

  return {
    preview: input.preview,
    html: `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:24px;background:#fffaf8;color:#203243;font-family:'Avenir Next','Segoe UI','Helvetica Neue',sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:32px;border:1px solid rgba(32,50,67,0.12);border-radius:28px;background:#ffffff;">
      <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#2e86c1;font-weight:700;">NossoBebe</p>
      <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1;">${input.title}</h1>
      <p style="margin:0 0 16px;line-height:1.8;color:#5f6d79;">${input.intro}</p>
      <div style="line-height:1.8;color:#203243;">${input.body}</div>
      ${ctaBlock}
    </div>
  </body>
</html>`,
  };
}

export function buildOrderCreatedEmail(input: {
  babyName: string;
  orderUrl: string;
  totalFormatted: string;
}) {
  return wrapEmailTemplate({
    preview: `Recebemos o pedido de ${input.babyName}`,
    title: `Pedido recebido para ${input.babyName}`,
    intro:
      "Seu briefing foi recebido e o checkout foi iniciado. A confirmacao real do pagamento acontece de forma assincrona.",
    body: `<p>Total atual do pedido: <strong>${input.totalFormatted}</strong>.</p><p>Voce pode acompanhar o status a qualquer momento pelo link abaixo.</p>`,
    ctaHref: input.orderUrl,
    ctaLabel: "Acompanhar pedido",
  });
}

export function buildPaymentApprovedEmail(input: {
  babyName: string;
  orderUrl: string;
}) {
  return wrapEmailTemplate({
    preview: `Pagamento aprovado para ${input.babyName}`,
    title: "Pagamento aprovado",
    intro:
      "O pagamento foi confirmado e o pedido entrou na fila operacional do NossoBebe.",
    body: `<p>Agora seguimos com a producao manual do material e mantemos o prazo prometido de ate 24 horas.</p><p>Voce pode acompanhar o andamento pelo link abaixo.</p>`,
    ctaHref: input.orderUrl,
    ctaLabel: "Ver status do pedido",
  });
}

export function buildDeliveryPublishedEmail(input: {
  babyName: string;
  orderUrl: string;
}) {
  return wrapEmailTemplate({
    preview: `Seu material de ${input.babyName} ja esta disponivel`,
    title: "Entrega disponivel",
    intro:
      "Os primeiros entregaveis do seu pedido ja foram publicados em area segura.",
    body: `<p>Use o link abaixo para acessar a pagina do pedido e baixar os arquivos disponiveis.</p><p>Os links de download sao temporarios e podem ser renovados pela propria pagina do pedido.</p>`,
    ctaHref: input.orderUrl,
    ctaLabel: "Abrir entrega",
  });
}

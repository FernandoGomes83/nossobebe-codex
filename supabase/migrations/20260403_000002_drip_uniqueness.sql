create unique index if not exists drip_subscriptions_order_id_unique_idx
on public.drip_subscriptions (order_id);

create unique index if not exists drip_jobs_subscription_template_key_unique_idx
on public.drip_jobs (subscription_id, template_key);

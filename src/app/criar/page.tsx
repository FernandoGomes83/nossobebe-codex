import type { Metadata } from "next";

import { CreateOrderForm } from "./_components/create-order-form";

export const metadata: Metadata = {
  title: "Criar pedido | NossoBebe",
  description:
    "Monte o pedido do pack ou dos produtos avulsos com os dados do bebe.",
};

export default function CreatePage() {
  return <CreateOrderForm />;
}

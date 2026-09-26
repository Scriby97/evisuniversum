import type { Metadata } from "next";
import { OrderForm } from "@/components/OrderForm";
import { getProducts, getSettings } from "@/lib/sanity";

export const metadata: Metadata = { title: "Warenkorb" };

export default async function OrderPage() {
  const [settings, products] = await Promise.all([getSettings(), getProducts()]);
  const available = products
    .filter((p) => p.available)
    .map(({ slug, name, price, digital }) => ({ slug, name, price, digital }));

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[3fr_2fr]">
      <div>
        <h1 className="mb-8 font-script text-6xl">Warenkorb</h1>
        <OrderForm products={available} />
      </div>
      <aside className="flex flex-col gap-6 self-start rounded-2xl bg-sand/60 p-6 text-sm">
        {settings.orderInfo && (
          <div>
            <h2 className="mb-2 font-serif text-xl">So funktioniert&apos;s</h2>
            <p className="whitespace-pre-line text-muted">{settings.orderInfo}</p>
          </div>
        )}
        {settings.shippingInfo && (
          <div>
            <h2 className="mb-2 font-serif text-xl">Versand</h2>
            <p className="whitespace-pre-line text-muted">{settings.shippingInfo}</p>
          </div>
        )}
      </aside>
    </section>
  );
}

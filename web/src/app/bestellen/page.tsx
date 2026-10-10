import type { Metadata } from "next";
import { RichText } from "@/components/RichText";
import { OrderForm } from "@/components/OrderForm";
import { getProducts, getSettings, imageUrl } from "@/lib/sanity";

export const metadata: Metadata = { title: "Warenkorb" };

export default async function OrderPage() {
  const [settings, products] = await Promise.all([getSettings(), getProducts()]);
  const available = products
    .filter((p) => p.available)
    .map(({ slug, name, price, digital, onRequest, extras, stock }) => ({
      slug,
      name,
      price,
      digital,
      onRequest: Boolean(onRequest),
      extras: extras ?? undefined,
      stock,
    }));

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[3fr_2fr] print:block">
      <div>
        <h1 className="mb-8 font-serif text-5xl font-medium">Warenkorb</h1>
        <OrderForm
          products={available}
          shippingOptions={
            settings.shippingOptions?.length
              ? settings.shippingOptions.map(({ name, price }) => ({ name, price }))
              : [{ name: "Versand", price: 0 }]
          }
          freeShippingFrom={settings.freeShippingFrom}
          giftWrapPrice={settings.giftWrapPrice}
          twintQrUrl={imageUrl(settings.twintQr) ?? undefined}
        />
      </div>
      <aside className="flex flex-col gap-6 self-start rounded-2xl bg-sand/60 p-6 text-sm print:hidden">
        {settings.orderInfo && (
          <div>
            <h2 className="mb-2 font-serif text-xl">So funktioniert&apos;s</h2>
            <RichText value={settings.orderInfo} className="text-muted" />
          </div>
        )}
        {settings.shippingInfo && (
          <div>
            <h2 className="mb-2 font-serif text-xl">Versand</h2>
            <RichText value={settings.shippingInfo} className="text-muted" />
          </div>
        )}
      </aside>
    </section>
  );
}

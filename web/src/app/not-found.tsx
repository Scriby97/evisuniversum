import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-start gap-4 px-4 py-20">
      <h1 className="font-serif text-4xl">Seite nicht gefunden</h1>
      <Link href="/" className="text-accent hover:text-accent-dark">
        Zur Startseite
      </Link>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SanityImage } from "@/components/SanityImage";
import { SimpleText } from "@/components/SimpleText";
import { formatEventDate } from "@/lib/format";
import { getUpcomingEvents } from "@/lib/sanity";

export const metadata: Metadata = { title: "Märkte & Events" };


export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 font-serif text-5xl font-medium">Märkte & Events</h1>
      <p className="mb-10 text-muted">Hier findest du mich vor Ort – ich freue mich auf deinen Besuch!</p>

      {events.length === 0 ? (
        <p className="text-muted">
          Im Moment sind keine Termine geplant. Schau bald wieder vorbei oder{" "}
          <Link href="/kontakt" className="text-accent hover:text-accent-dark">
            schreib mir
          </Link>
          .
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {events.map((event) => (
            <li key={event._id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {event.image?.asset && (
                <div className="relative aspect-[16/9]">
                  <SanityImage
                    image={event.image}
                    alt={event.title}
                    crop={{ width: 1600, height: 900 }}
                    sizes="(min-width: 768px) 720px, 100vw"
                  />
                </div>
              )}
              <div className="p-6">
                <p className="text-sm uppercase tracking-wide text-accent">
                  {formatEventDate(event)}
                  {event.time && ` · ${event.time}`}
                </p>
                <h2 className="mt-1 font-serif text-2xl font-medium">{event.title}</h2>
                {event.location && <p className="text-muted">{event.location}</p>}
                {event.description && (
                  <p className="mt-3 whitespace-pre-line text-sm text-muted">
                    <SimpleText text={event.description} />
                  </p>
                )}
                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm text-accent hover:text-accent-dark"
                  >
                    Mehr zum Event →
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

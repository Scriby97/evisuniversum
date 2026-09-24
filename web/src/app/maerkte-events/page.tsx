import type { Metadata } from "next";
import Link from "next/link";
import { getUpcomingEvents, type Event } from "@/lib/sanity";

export const metadata: Metadata = { title: "Märkte & Events" };

const dateFormat = new Intl.DateTimeFormat("de-CH", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

function formatDate({ date, endDate }: Event) {
  const start = dateFormat.format(new Date(date));
  return endDate && endDate !== date ? `${start} – ${dateFormat.format(new Date(endDate))}` : start;
}

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 font-script text-6xl">Märkte & Events</h1>
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
            <li key={event._id} className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-wide text-accent">
                {formatDate(event)}
                {event.time && ` · ${event.time}`}
              </p>
              <h2 className="mt-1 font-serif text-2xl font-medium">{event.title}</h2>
              {event.location && <p className="text-muted">{event.location}</p>}
              {event.description && <p className="mt-3 whitespace-pre-line text-sm text-muted">{event.description}</p>}
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

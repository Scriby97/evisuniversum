"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { inputClass } from "@/lib/web3forms";

const storageKey = "evisuniversum-preview";

function readStored() {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

// Sichtschutz, kein echter Passwortschutz: die Seite ist statisch, Inhalte stehen im HTML.
// Das Overlay ist schon im ausgelieferten HTML, damit die Inhalte nie kurz aufblitzen.
export function ComingSoonGate({
  siteName,
  text,
  password,
  children,
}: {
  siteName: string;
  text: string;
  password: string;
  children: React.ReactNode;
}) {
  // Beim Build (Server) gibt es kein localStorage → dort immer gesperrt
  const stored = useSyncExternalStore(subscribe, readStored, () => null);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const unlocked = justUnlocked || stored === password.toLowerCase();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = String(new FormData(event.currentTarget).get("password") ?? "");
    if (input.trim().toLowerCase() !== password.toLowerCase()) {
      setError(true);
      return;
    }
    try {
      localStorage.setItem(storageKey, password.toLowerCase());
    } catch {}
    setJustUnlocked(true);
  }

  if (unlocked) return <>{children}</>;

  return (
    <>
      <div inert className="hidden">
        {children}
      </div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream px-4">
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <h1 className="font-script text-6xl sm:text-7xl">{siteName}</h1>
          <p className="whitespace-pre-line font-serif text-2xl text-muted">{text}</p>
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
            <label htmlFor="preview-password" className="text-sm text-muted">
              Vorschau-Passwort
            </label>
            <div className="flex gap-2">
              <input
                id="preview-password"
                name="password"
                type="password"
                autoComplete="off"
                onChange={() => setError(false)}
                className={inputClass}
              />
              <button type="submit" className="shrink-0 rounded-full bg-accent px-5 py-2 text-white hover:bg-accent-dark">
                Weiter
              </button>
            </div>
            {error && <p className="text-sm text-red-700">Das Passwort stimmt leider nicht.</p>}
          </form>
        </div>
      </div>
    </>
  );
}

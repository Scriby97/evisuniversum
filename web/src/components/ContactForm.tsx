"use client";

import { useState, type FormEvent } from "react";
import { inputClass, sendForm, web3formsKey } from "@/lib/web3forms";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    try {
      await sendForm({
        subject: `Kontaktanfrage von ${form.get("name")}`,
        botcheck: form.get("botcheck"),
        Name: form.get("name"),
        email: form.get("email"),
        Nachricht: form.get("message"),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-2 font-serif text-3xl">Danke für deine Nachricht! ♡</h2>
        <p className="text-muted">Ich melde mich so bald wie möglich bei dir.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!web3formsKey && (
        <p className="rounded-lg bg-yellow-100 p-3 text-sm text-yellow-900">
          NEXT_PUBLIC_WEB3FORMS_KEY fehlt – das Formular kann noch nicht versendet werden.
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input name="name" required autoComplete="name" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        E-Mail
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Nachricht
        <textarea name="message" required rows={6} className={inputClass} />
      </label>
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

      {status === "error" && (
        <p className="text-sm text-red-700">
          Die Nachricht konnte nicht gesendet werden. Bitte versuche es nochmals oder schreib mir direkt eine E-Mail.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending" || !web3formsKey}
        className="self-start rounded-full bg-accent px-6 py-3 text-white hover:bg-accent-dark disabled:opacity-50"
      >
        {status === "sending" ? "Wird gesendet …" : "Nachricht senden"}
      </button>
    </form>
  );
}

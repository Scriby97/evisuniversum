// Web3Forms leitet Formulare als E-Mail an Evi weiter – ganz ohne eigenen Server
export const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

export async function sendForm(fields: Record<string, FormDataEntryValue | string | null>) {
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ access_key: web3formsKey, from_name: "Website evi’s universum", ...fields }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
}

export const inputClass =
  "w-full rounded-lg border border-sand bg-white px-3 py-2 outline-none focus:border-accent";

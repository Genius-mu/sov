"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { MODELS, SITE } from "@/lib/site";

type FormState = { name: string; contact: string; model: string; date: string; message: string };
type Errors = Partial<Record<keyof FormState, string>>;
type Status = "idle" | "sending" | "sent" | "error";

const MODEL_OPTIONS: string[] = [...MODELS.map((m) => m.name), "Approved pre-owned", "Not sure yet"];
const EMPTY: FormState = { name: "", contact: "", model: "Not sure yet", date: "", message: "" };

function localToday() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-moon/80">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-[#f0a3ad]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Visit() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [minDate, setMinDate] = useState<string | undefined>();

  useEffect(() => {
    setMinDate(localToday());
    // The configurator and the pre-owned card prefill this form
    const onSpec = (e: Event) => {
      const detail = (e as CustomEvent<{ model?: string; message?: string }>).detail ?? {};
      setForm((f) => ({ ...f, model: detail.model ?? f.model, message: detail.message ?? f.message }));
      setStatus("idle");
    };
    window.addEventListener("sovereign:spec", onSpec);
    return () => window.removeEventListener("sovereign:spec", onSpec);
  }, []);

  const update =
    (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((f) => ({ ...f, [key]: value }));
      setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
    };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Add your name so your advisor knows who to ask for.";
    if (!form.contact.trim()) next.contact = "Add a phone number or email so we can confirm the time.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (!res.ok || !data.ok) throw new Error("Request failed");
      setStatus("sent");
      setForm(EMPTY);
    } catch {
      setStatus("error");
    }
  }

  const tel = `tel:${SITE.phone.replace(/\s/g, "")}`;

  return (
    <section id="visit" data-scene="visit" className="relative min-h-svh py-32">
      <div className="mx-auto grid max-w-[1400px] gap-16 px-6 md:px-10 lg:grid-cols-[1fr_minmax(0,520px)]">
        <div>
          <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] leading-[1.0] tracking-[-0.02em]">
            Visit by appointment
          </h2>
          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-moon/75">
            Tell us which car you’d like to see and when. A client advisor will call to confirm, and
            the car will be ready when you arrive.
          </p>

          <dl className="mt-14 grid gap-10 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-mist">Showroom</dt>
              <dd className="mt-2 leading-relaxed">
                {SITE.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-mist">Opening hours</dt>
              <dd className="mt-2 space-y-1">
                {SITE.hours.map((h) => (
                  <span key={h.days} className="flex justify-between gap-6">
                    <span>{h.days}</span>
                    <span className="text-moon/70">{h.time}</span>
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-mist">Call</dt>
              <dd className="mt-2">
                <a href={tel} className="transition-colors hover:text-champagne">
                  {SITE.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-mist">Email</dt>
              <dd className="mt-2">
                <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-champagne">
                  {SITE.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="glass-strong rounded-[32px] p-7 md:p-9">
          {status === "sent" ? (
            <div className="flex min-h-[420px] flex-col justify-center" role="status">
              <h3 className="font-display text-4xl">Viewing requested.</h3>
              <p className="mt-4 max-w-[38ch] leading-relaxed text-moon/75">
                A client advisor will contact you within one working day to confirm the time. If it’s
                urgent, call {SITE.phone}.
              </p>
              <button type="button" onClick={() => setStatus("idle")} className="btn-ghost mt-8 self-start">
                Request another viewing
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-5">
              <Field id="name" label="Your name" error={errors.name}>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={update("name")}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className="field"
                />
              </Field>
              <Field id="contact" label="Phone or email" error={errors.contact}>
                <input
                  id="contact"
                  name="contact"
                  autoComplete="email"
                  value={form.contact}
                  onChange={update("contact")}
                  aria-invalid={errors.contact ? true : undefined}
                  aria-describedby={errors.contact ? "contact-error" : undefined}
                  className="field"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="model" label="Car">
                  <select id="model" name="model" value={form.model} onChange={update("model")} className="field">
                    {MODEL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field id="date" label="Preferred date">
                  <input
                    id="date"
                    name="date"
                    type="date"
                    min={minDate}
                    value={form.date}
                    onChange={update("date")}
                    className="field"
                  />
                </Field>
              </div>
              <Field id="message" label="Anything we should prepare (optional)">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={update("message")}
                  className="field resize-none"
                />
              </Field>

              {status === "error" ? (
                <p role="alert" className="text-sm leading-relaxed text-[#f0a3ad]">
                  Your request didn’t send. Check your connection and try again, or call {SITE.phone}.
                </p>
              ) : null}

              <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
                {status === "sending" ? "Sending…" : "Request a viewing"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

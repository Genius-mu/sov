import { NextResponse } from "next/server";

type Incoming = {
  name?: unknown;
  contact?: unknown;
  model?: unknown;
  date?: unknown;
  message?: unknown;
};

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  let body: Incoming;
  try {
    body = (await request.json()) as Incoming;
  } catch {
    return NextResponse.json({ ok: false, error: "Send the enquiry as JSON." }, { status: 400 });
  }

  const enquiry = {
    name: clean(body.name, 120),
    contact: clean(body.contact, 160),
    model: clean(body.model, 60),
    date: clean(body.date, 10),
    message: clean(body.message, 2000),
  };

  if (!enquiry.name || !enquiry.contact) {
    return NextResponse.json(
      { ok: false, error: "A name and a phone number or email are required." },
      { status: 422 },
    );
  }

  // Connect your CRM or email provider here (Resend, Postmark, HubSpot, etc.).
  console.info("[enquiry]", { ...enquiry, receivedAt: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}

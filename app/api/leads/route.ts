import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_NAME_LEN = 100;
const MAX_CONTACT_LEN = 200;
const MIN_FILL_MS = 1500;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const { creatorId, name, contact, company, renderedAt } = (body ?? {}) as Record<string, unknown>;

  if (typeof creatorId !== "string" || !creatorId) {
    return NextResponse.json({ ok: false, error: "Missing creator." }, { status: 400 });
  }
  if (typeof contact !== "string" || !contact.trim()) {
    return NextResponse.json({ ok: false, error: "Enter an email or phone number." }, { status: 400 });
  }
  if (contact.length > MAX_CONTACT_LEN || (typeof name === "string" && name.length > MAX_NAME_LEN)) {
    return NextResponse.json({ ok: false, error: "That's too long." }, { status: 400 });
  }

  // Honeypot filled, or submitted faster than a human could type: pretend it
  // worked without touching the database.
  const tooFast = typeof renderedAt !== "number" || Date.now() - renderedAt < MIN_FILL_MS;
  if ((typeof company === "string" && company.trim()) || tooFast) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    creator_id: creatorId,
    name: typeof name === "string" && name.trim() ? name.trim() : null,
    contact: contact.trim(),
  });

  if (error) {
    return NextResponse.json({ ok: false, error: "Couldn't submit — try again." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

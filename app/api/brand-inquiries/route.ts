import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_LEN = 500;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const { creatorId, company, contactName, email, budget, message } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (!isNonEmptyString(creatorId)) {
    return NextResponse.json({ ok: false, error: "Missing creator." }, { status: 400 });
  }
  if (!isNonEmptyString(company) || !isNonEmptyString(email)) {
    return NextResponse.json(
      { ok: false, error: "Company and email are required." },
      { status: 400 },
    );
  }
  const fields = [company, contactName, email, budget, message];
  if (fields.some((f) => typeof f === "string" && f.length > MAX_LEN)) {
    return NextResponse.json({ ok: false, error: "That's too long." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("brand_inquiries").insert({
    creator_id: creatorId,
    company: company.trim(),
    contact_name: isNonEmptyString(contactName) ? contactName.trim() : null,
    email: email.trim(),
    budget: isNonEmptyString(budget) ? budget.trim() : null,
    message: isNonEmptyString(message) ? message.trim() : null,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: "Couldn't submit — try again." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

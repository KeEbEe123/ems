// app/api/me/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, email, first_name, last_name, phone_number, full_name, avatar_url"
    )
    .eq("email", session.user.email)
    .maybeSingle();

  if (error) {
    console.error("[/api/me] GET error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  return NextResponse.json({ user: data });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { first_name, last_name, phone_number } = body ?? {};

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({
      first_name: first_name ?? null,
      last_name: last_name ?? null,
      phone_number: phone_number ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("email", session.user.email);

  if (error) {
    console.error("[/api/me] PATCH error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

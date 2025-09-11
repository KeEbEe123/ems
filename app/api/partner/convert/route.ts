// app/api/partner/convert/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@/lib/supabase/server";

export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = await createClient();

  // 1) Grab the user row (we need the UUID id)
  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("id, email, full_name, avatar_url")
    .eq("email", session.user.email)
    .maybeSingle();

  if (userErr) {
    console.error("[/api/partner/convert] fetch user error:", userErr);
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 2) Update role to 'club'
  const { error: updErr } = await supabase
    .from("users")
    .update({ role: "club", updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (updErr) {
    console.error("[/api/partner/convert] update user role error:", updErr);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // 3) Upsert into public.clubs with same UUID as user.id
  const displayName =
    user.full_name ||
    session.user.name ||
    (user.email ? user.email.split("@")[0] : "New Club");

  const clubRow = {
    id: user.id, // same as users.id
    name: displayName,
    description: "", // or a default copy
    owner_id: user.id, // FK → public.users.id
    form_schema: {}, // empty JSON for now
    avatar_url: user.avatar_url || session.user.image || null,
    email: user.email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: clubErr } = await supabase
    .from("clubs")
    .upsert(clubRow, { onConflict: "id" }); // safe if already exists

  if (clubErr) {
    console.error("[/api/partner/convert] upsert club error:", clubErr);
    return NextResponse.json(
      { error: "Club creation failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

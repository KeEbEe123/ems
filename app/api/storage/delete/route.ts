import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs"; // ensure Node runtime

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bucket, path } = body || {};

    if (typeof bucket !== "string" || typeof path !== "string") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.storage.from(bucket).remove([path]);
    if (error) {
      console.error("[delete] Storage delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    console.error("[delete] Unexpected error:", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs"; // ensure Node runtime for Buffer

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const bucket = form.get("bucket");
    const path = form.get("path");
    const file = form.get("file");

    if (typeof bucket !== "string" || typeof path !== "string" || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload via admin client to bypass RLS
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: (file as any).type || "application/octet-stream",
      });

    if (error) {
      console.error("[upload] Storage upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

    return NextResponse.json({ path: data.path, publicUrl: pub.publicUrl }, { status: 200 });
  } catch (err: any) {
    console.error("[upload] Unexpected error:", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

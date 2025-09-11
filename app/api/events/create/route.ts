import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { v4 as uuidv4 } from "uuid";

// Ensure Node.js runtime for Buffer/FormData handling
export const runtime = 'nodejs';

// Simple filename/path sanitization
function sanitizePathPart(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const name = String(form.get("name") || "").trim();
    const theme = String(form.get("theme") || "").trim();
    const start_datetime = String(form.get("start_datetime") || "").trim();
    const end_datetime = String(form.get("end_datetime") || "").trim();
    const estimated_participants = Number(form.get("estimated_participants"));
    const estimated_budget = Number(form.get("estimated_budget"));
    const club_id = String(form.get("club_id") || "").trim();
    const event_type = String(form.get("event_type") || "free").trim() as 'free' | 'paid';
    const file = form.get("event_blueprint") as unknown as File | null;

    // Validate event_type
    if (event_type !== 'free' && event_type !== 'paid') {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    if (!name || !theme || !start_datetime || !end_datetime || !club_id || !file || Number.isNaN(estimated_participants) || Number.isNaN(estimated_budget)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Basic date validation
    if (new Date(end_datetime) < new Date(start_datetime)) {
      return NextResponse.json({ error: "End datetime must be after start datetime" }, { status: 400 });
    }

    // Validate file type and size
    const MAX_BYTES = 200 * 1024; // 200KB
    const fileSize = (file as any).size as number;
    const fileType = (file as any).type as string;
    
    // Debug log (server-side)
    console.debug('[API] Received create event request', {
      name,
      theme,
      start_datetime,
      end_datetime,
      estimated_participants,
      estimated_budget,
      club_id,
      fileType,
      fileSize,
    });
    if (!fileType || fileType !== "application/pdf") {
      return NextResponse.json({ error: "Event blueprint must be a PDF" }, { status: 400 });
    }
    if (fileSize > MAX_BYTES) {
      return NextResponse.json({ error: "Event blueprint must be 200KB or smaller" }, { status: 400 });
    }

    // Upload to Storage (service role bypasses RLS)
    const BUCKET = "event-blueprints";
    const safeClub = sanitizePathPart(club_id);
    const safeName = sanitizePathPart(file.name || "blueprint.pdf");
    const filePath = `${safeClub}/${Date.now()}_${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { error: uploadErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, fileBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/pdf",
      });

    if (uploadErr) {
      console.error('[API] Storage upload error', uploadErr);
      return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 400 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);
    const blueprintUrl = publicUrlData.publicUrl;

    if (!blueprintUrl) {
      return NextResponse.json({ error: "Failed to get public URL" }, { status: 500 });
    }

    // Insert into events (service role bypasses RLS)
    const id = String(form.get("id") || uuidv4());
    const insertPayload = {
      id,
      name,
      theme,
      start_datetime,
      end_datetime,
      estimated_participants,
      estimated_budget,
      event_blueprint: blueprintUrl,
      event_type,
      status: "pending_approval",
      hosted: "self",
      club_id,
    } as any;

    const { data, error: insertErr } = await supabaseAdmin
      .from("events")
      .insert(insertPayload)
      .select("id")
      .single();

    if (insertErr) {
      console.error('[API] DB insert error', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    return NextResponse.json({ id: data.id, event_blueprint: blueprintUrl }, { status: 201 });
  } catch (err: any) {
    console.error('[API] Unexpected error', err);
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}

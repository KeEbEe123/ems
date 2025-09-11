"use server";

import { createClient } from "@/lib/supabase/server";

type UserProfile = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

export async function createOrUpdateUser(profile: UserProfile) {
  console.log("[Supabase] createOrUpdateUser called with:", profile);

  const supabase = await createClient();

  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", profile.id)
    .maybeSingle();

  if (fetchError) {
    console.error("[Supabase] fetchError:", fetchError);
  } else {
    console.log("[Supabase] existingUser:", existingUser);
  }

  const userData = {
    id: profile.id,
    email: profile.email,
    full_name: profile.name,
    avatar_url: profile.image,
    updated_at: new Date().toISOString(),
  };

  if (!existingUser) {
    console.log("[Supabase] Inserting new user:", userData);
    const { error: insertError } = await supabase
      .from("users")
      .insert([{ ...userData, created_at: new Date().toISOString() }]);
    if (insertError) {
      console.error("[Supabase] insertError:", insertError);
      return { error: "Failed to insert user" };
    }
  } else {
    console.log("[Supabase] Updating existing user:", userData);
    const { error: updateError } = await supabase
      .from("users")
      .update(userData)
      .eq("id", profile.id);
    if (updateError) {
      console.error("[Supabase] updateError:", updateError);
      return { error: "Failed to update user" };
    }
  }

  console.log("[Supabase] createOrUpdateUser success");
  return { success: true };
}

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hxcygmrgqrfjoggeuwnw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Y3lnbXJncXJmam9nZ2V1d253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzg2MzYsImV4cCI6MjA3Mjc1NDYzNn0.c2K4k_l30h2scSoSpjs54xM8VNFW0dqCgpYgiD7UjVg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


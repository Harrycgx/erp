import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("[TRACE:S1] supabase.js module loading", {
  urlDefined: !!supabaseUrl,
  urlValue: supabaseUrl,
  keyDefined: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length,
  keyPrefix: supabaseAnonKey?.substring(0, 20),
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[TRACE:S1-ERR] Missing Supabase env vars — THROWING");
  throw new Error('Missing Supabase environment variables.');
}

console.log("[TRACE:S2] Creating Supabase client...");
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
console.log("[TRACE:S3] Supabase client created", {
  authUrl: supabaseUrl + "/auth/v1",
  hasAuth: !!supabase?.auth,
  authMethods: supabase?.auth ? Object.keys(supabase.auth) : "NONE",
});

export default supabase;
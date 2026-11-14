/* =====================================================================
   Business Dost — cloud (Supabase) configuration

   Fill these two values from
   Supabase → Project Settings → API.

   The anon key is public by design: every request is filtered by row level
   security, so it can only ever read the signed-in user's own shop.
   NEVER put the service_role key here — it bypasses RLS.
   ===================================================================== */
window.BD_SUPABASE = {
  url: "",      // e.g. "https://abcdefghijkl.supabase.co"
  anonKey: "",  // e.g. "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
};

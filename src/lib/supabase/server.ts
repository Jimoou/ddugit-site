import { cookies } from "next/headers";
import { supabaseWith } from "./client";

/** Supabase for Server Components, Server Actions and Route Handlers (session in cookies). */
export async function supabaseServer() {
  const store = await cookies();
  return supabaseWith({
    getAll: () => store.getAll(),
    setAll(list) {
      // Server Components cannot set cookies; the proxy refreshes the session for them.
      try {
        for (const { name, value, options } of list) store.set(name, value, options);
      } catch {}
    },
  });
}

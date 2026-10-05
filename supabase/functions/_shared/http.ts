// What every Edge Function shares: JSON answers, required settings, and the POST-only
// entry point. Deno only (Deno.env); the pure modules next to it run in Node tests too.

/** A JSON answer. */
export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/** A required setting that isn't there (thrown by `env`, answered by `handle`). */
export class MissingEnv extends Error {}

/** The value of a required environment variable (Edge Functions → Secrets); throws `MissingEnv` when unset. */
export function env(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new MissingEnv(name);
  return value;
}

/** An optional environment variable, trimmed; "" when unset. */
export const optionalEnv = (name: string) => Deno.env.get(name)?.trim() ?? "";

/**
 * A function's entry point: POST only, and a missing setting answers 500 "not configured"
 * with a log line naming the variable, instead of a crash.
 */
export function handle(fn: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    if (req.method !== "POST") return json({ error: "POST only" }, 405);
    try {
      return await fn(req);
    } catch (e) {
      if (!(e instanceof MissingEnv)) throw e;
      console.error(`not configured: ${e.message} is not set`);
      return json({ error: "not configured" }, 500);
    }
  };
}

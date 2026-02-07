import { createServerClient, parseCookieHeader } from "@supabase/ssr";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

/**
 * Creates a Supabase client for server-side use (in loaders).
 * Reads the session from cookies in the incoming request.
 */
export function createSupabaseServerClient(request: Request) {
  const cookies = parseCookieHeader(request.headers.get("Cookie") ?? "");

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookies
          .filter((c): c is { name: string; value: string } => c.value !== undefined);
      },
    },
  });
}

/**
 * Helper to get the session and auth headers for API calls in loaders.
 * Returns the headers object to pass to API calls.
 */
export async function getAuthHeaders(request: Request): Promise<{ Authorization: string } | {}> {
  // Debug: log raw cookies
  const rawCookies = request.headers.get("Cookie");
  console.log("[SSR Auth] Raw cookies:", rawCookies?.substring(0, 100));

  const supabase = createSupabaseServerClient(request);
  const { data: { session }, error } = await supabase.auth.getSession();

  // Debug: log session result
  console.log("[SSR Auth] Session exists:", !!session, "Error:", error?.message);

  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }

  return {};
}

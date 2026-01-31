import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import { Navbar } from "./components/navbar";
import { AuthProvider } from "./lib/auth-context";
import { QueryProvider } from "./lib/query-provider";
import { api } from "./lib/api/client";
import { getAuthHeaders } from "./lib/supabase/server";
import { Toaster } from "./components/ui/sonner";
import "./app.css";

export async function loader({ request }: Route.LoaderArgs) {
  const authHeaders = await getAuthHeaders(request);

  // Not authenticated - no user to fetch
  if (!("Authorization" in authHeaders)) {
    return { user: null };
  }

  try {
    const response = await api.auth.authControllerMe({
      headers: authHeaders,
    });
    return { user: response.data.data?.user ?? null };
  } catch {
    // Auth failed or user not found - return null
    return { user: null };
  }
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// Blocking script to prevent flash of wrong theme
const themeScript = `
  (function() {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <QueryProvider>
      <AuthProvider initialUser={user}>
        <Navbar />
        <Outlet />
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let status = "Error";
  let message = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    status = String(error.status);
    message =
      error.status === 404
        ? "The page you're looking for doesn't exist or has been moved."
        : error.statusText || message;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    message = error.message;
    stack = error.stack;
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <Navbar />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-6xl font-bold text-muted-foreground mb-4">{status}</h1>
            <h2 className="text-2xl font-semibold mb-2">
              {status === "404" ? "Page not found" : "Something went wrong"}
            </h2>
            <p className="text-muted-foreground mb-8">{message}</p>
            <div className="flex gap-3 justify-center">
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2"
              >
                Go home
              </a>
              <a
                href="/explore"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Explore
              </a>
            </div>
            {stack && (
              <pre className="mt-8 w-full p-4 overflow-x-auto text-left text-xs bg-muted rounded-lg">
                <code>{stack}</code>
              </pre>
            )}
          </div>
        </div>
      </AuthProvider>
    </QueryProvider>
  );
}

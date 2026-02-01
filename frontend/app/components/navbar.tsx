import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "~/lib/auth-context";
import { LoginModal } from "./auth/login-modal";
import { SignupModal } from "./auth/signup-modal";
import { Button } from "./ui/button";

type Theme = "dark" | "light";

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

export function Navbar() {
  const { user } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  const openLogin = () => setLoginModalOpen(true);
  const openSignup = () => setSignupModalOpen(true);

  const switchToSignup = () => setSignupModalOpen(true);
  const switchToLogin = () => setLoginModalOpen(true);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left - Logo/Home link */}
          <Link
            to="/"
            className="text-lg font-semibold text-foreground hover:opacity-80 transition-opacity"
          >
            stuff i'm into
          </Link>

          {/* Right - Auth & Theme */}
          <div className="flex items-center gap-2">
            {user && (
              <Link
                to={`/users/${user.username}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                my media
              </Link>
            )}

            <ThemeToggle />

            {user ? (
              <Link
                to="/profile"
                className="h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all"
              >
                {user.avatarUrl ? (
                  <img
                    src={String(user.avatarUrl)}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={openLogin}>
                  Sign in
                </Button>
                <Button size="sm" onClick={openSignup}>
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        onSwitchToSignup={switchToSignup}
      />
      <SignupModal
        open={signupModalOpen}
        onOpenChange={setSignupModalOpen}
        onSwitchToLogin={switchToLogin}
      />
    </nav>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/lib/auth-context";

export function meta() {
  return [
    { title: "Complete Your Profile | Stuffiminto" },
    { name: "description", content: "Set up your profile to get started" },
  ];
}

export default function OnboardingPage() {
  const { completeOnboarding, isAuthenticated, needsOnboarding, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  // Redirect if already onboarded
  if (!needsOnboarding && user) {
    navigate(`/${user.username}`, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }

    setIsLoading(true);

    const result = await completeOnboarding(username, bio || undefined);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      // Navigate to the new profile
      navigate(`/${username}`, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Complete your profile</h1>
          <p className="text-muted-foreground mt-2">
            Choose a username to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <Input
                id="username"
                type="text"
                placeholder="yourname"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="pl-8"
                required
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Letters, numbers, and underscores only
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="bio"
              type="text"
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating profile..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}

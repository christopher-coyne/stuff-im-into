import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/lib/auth-context";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stuffiminto - Share what you're into" },
    { name: "description", content: "A place to share your thoughts on movies, music, books, and everything you love." },
  ];
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            Stuffiminto
          </span>
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Share your thoughts on movies, music, books, and everything you're into.
        </p>
        <div className="flex gap-3 justify-center">
          {isAuthenticated && user ? (
            <Button asChild>
              <Link to={`/${user.username}`}>My Profile</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/explore">Explore</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

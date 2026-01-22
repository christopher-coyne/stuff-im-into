import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "./supabase/client";
import { api } from "./api/client";
import type { UserProfileDto } from "./api/api";

interface AuthContextType {
  // Supabase user (from auth)
  supabaseUser: SupabaseUser | null;
  // App user profile (from our database)
  user: UserProfileDto | null;
  // Session contains the access token
  session: Session | null;
  // Loading state for initial auth check
  isLoading: boolean;
  // Helper booleans
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  // Auth methods
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  completeOnboarding: (username: string, bio?: string) => Promise<{ error?: string }>;
  // Refresh user profile from API
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!session;
  const needsOnboarding = isAuthenticated && !user;

  // Fetch app user profile from our backend
  const fetchUserProfile = async (accessToken: string) => {
    try {
      const response = await api.auth.authControllerMe({
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = response.data.data;
      if (data?.user) {
        setUser(data.user as UserProfileDto);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (currentSession) {
          setSession(currentSession);
          setSupabaseUser(currentSession.user);
          await fetchUserProfile(currentSession.access_token);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setSupabaseUser(newSession?.user ?? null);

      if (newSession) {
        await fetchUserProfile(newSession.access_token);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { error: error.message };
    }
    return {};
  };

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return { error: error.message };
    }
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const completeOnboarding = async (username: string, bio?: string) => {
    if (!session) {
      return { error: "Not authenticated" };
    }

    try {
      const response = await api.auth.authControllerOnboarding(
        { username, bio },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      if (response.data.data) {
        setUser(response.data.data as UserProfileDto);
      }
      return {};
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || "Failed to complete onboarding",
      };
    }
  };

  const refreshUser = async () => {
    if (session) {
      await fetchUserProfile(session.access_token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        supabaseUser,
        user,
        session,
        isLoading,
        isAuthenticated,
        needsOnboarding,
        login,
        signup,
        logout,
        completeOnboarding,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

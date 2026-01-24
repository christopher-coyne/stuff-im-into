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
  createProfile: (username: string, bio?: string) => Promise<{ error?: string }>;
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

  // Fetch app user profile from our backend (used on initial load)
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

  // Fetch fresh user data (used after updates)
  const fetchFreshUserProfile = async (accessToken: string) => {
    try {
      const response = await api.users.usersControllerGetMe({
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.data.data) {
        setUser(response.data.data as unknown as UserProfileDto);
      }
    } catch {
      // Silently fail - user state remains unchanged
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

  const createProfile = async (username: string, bio?: string) => {
    // Get fresh session from Supabase (React state may not have updated yet)
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    if (!currentSession) {
      return { error: "Not authenticated" };
    }

    try {
      const response = await api.users.usersControllerUpsertMe(
        { username, bio },
        { headers: { Authorization: `Bearer ${currentSession.access_token}` } }
      );

      if (response.data.data) {
        setUser(response.data.data as UserProfileDto);
      }
      return {};
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || "Failed to create profile",
      };
    }
  };

  const refreshUser = async () => {
    if (session) {
      await fetchFreshUserProfile(session.access_token);
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
        createProfile,
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

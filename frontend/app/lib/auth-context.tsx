import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Api } from "./api/api";
import type { UserProfileDto } from "./api/api";

const api = new Api({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

interface AuthContextType {
  user: UserProfileDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      api.instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.auth.authControllerMe();
      setUser(response.data.data?.user ?? null);
    } catch {
      localStorage.removeItem("accessToken");
      delete api.instance.defaults.headers.common["Authorization"];
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    const response = await api.auth.authControllerLogin({ email, password });
    const accessToken = response.data.data?.accessToken;
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      api.instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      await fetchCurrentUser();
    }
  };

  const signup = async (email: string, password: string) => {
    const response = await api.auth.authControllerSignUp({ email, password });
    const accessToken = response.data.data?.accessToken;
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      api.instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      await fetchCurrentUser();
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    delete api.instance.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refetchUser: fetchCurrentUser,
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

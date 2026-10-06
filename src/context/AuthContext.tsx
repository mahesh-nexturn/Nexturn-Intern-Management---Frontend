import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";
import * as authApi from "../services/authApi";
import { clearTokens, getAccessToken } from "../services/api";

// UI-facing role: backend "ADMIN" is displayed/labeled as "HR" everywhere in the UI.
export type UserRole = "HR" | "MENTOR" | "INTERN";

export function backendRoleToUi(role: authApi.BackendRole): UserRole {
  return role === "ADMIN" ? "HR" : role;
}

export function uiRoleToBackend(role: UserRole): authApi.BackendRole {
  return role === "HR" ? "ADMIN" : role;
}

type AuthUser = {
  id: number;
  role: UserRole;
  email: string;
  name: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

type Props = {
  children: ReactNode;
};

function persistUser(user: AuthUser) {
  localStorage.setItem("role", user.role);
  localStorage.setItem("email", user.email);
  localStorage.setItem("name", user.name);
  localStorage.setItem("userId", String(user.id));
}

function clearUser() {
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("name");
  localStorage.removeItem("userId");
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On app load, if we still hold an access token, re-hydrate the session
    // from the backend (/auth/me) instead of trusting stale localStorage values.
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((current) => {
        const authUser: AuthUser = {
          id: current.id,
          role: backendRoleToUi(current.role),
          email: current.email,
          name: current.name,
        };
        persistUser(authUser);
        setUser(authUser);
      })
      .catch(() => {
        clearTokens();
        clearUser();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    const authUser: AuthUser = {
      id: result.userId,
      role: backendRoleToUi(result.role),
      email: result.email,
      name: result.name,
    };
    persistUser(authUser);
    setUser(authUser);
    return authUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearUser();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
import { createContext, useContext, useEffect, useState } from "react";
import { loginApi, registerApi, setAuthToken } from "@/api/auth";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "candidate";
};

type ApiError = {
  message: string;
};

type SignInResult =
  | { data: { token: string; user: User } }
  | { error: ApiError };

type SignUpResult =
  | { data: unknown }
  | { error: ApiError };

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, name: string) => Promise<SignUpResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const token = localStorage.getItem("auth_token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setAuthToken(token);
    }

    setIsLoading(false);
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<SignInResult> => {
    try {
      const res = await loginApi(email, password);

      if (!res.status) {
        return { error: { message: "Invalid credentials" } };
      }

      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("auth_user", JSON.stringify(res.user));

      setAuthToken(res.token);
      setUser(res.user);

      return {
        data: {
          token: res.token,
          user: res.user,
        },
      };
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as Record<string, unknown>).response === "object"
      ) {
        return {
          error: {
            message: (err as { response: { data: ApiError } }).response.data
              .message,
          },
        };
      }

      return {
        error: {
          message: "Server not reachable",
        },
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<SignUpResult> => {
    try {
      const res = await registerApi(name, email, password, "candidate");
      return { data: res };
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as Record<string, unknown>).response === "object"
      ) {
        return {
          error: {
            message: (err as { response: { data: ApiError } }).response.data
              .message,
          },
        };
      }

      return {
        error: {
          message: "Registration failed",
        },
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

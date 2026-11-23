import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("ecommerce_token") || "",
  );
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem("ecommerce_token");
    if (!savedToken) {
      setUser(null);
      setToken("");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      setToken(savedToken);
    } catch {
      localStorage.removeItem("ecommerce_token");
      setUser(null);
      setToken("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("ecommerce_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password, address) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      address,
    });
    localStorage.setItem("ecommerce_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const updateProfile = async (profilePayload) => {
    const { data } = await api.put("/auth/profile", profilePayload);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("ecommerce_token");
    setToken("");
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    login,
    register,
    updateProfile,
    logout,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};

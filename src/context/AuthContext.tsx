"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  LoginPayload,
  RegisterPayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload
} from "@/lib/types";
import {
  loginUser,
  registerUser,
  changePassword,
  forgotPassword,
  resetPassword,
  fetchCurrentUser
} from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  changeUserPassword: (payload: ChangePasswordPayload) => Promise<void>;
  requestForgotPassword: (payload: ForgotPasswordPayload) => Promise<{ message: string; resetCode?: string }>;
  performResetPassword: (payload: ResetPasswordPayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load stored token and user on startup
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("cabinetmap_token");
      const storedUser = localStorage.getItem("cabinetmap_user");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("cabinetmap_token");
          localStorage.removeItem("cabinetmap_user");
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    const res = await loginUser(payload);
    setToken(res.token);
    setUser(res.user);
    if (typeof window !== "undefined") {
      localStorage.setItem("cabinetmap_token", res.token);
      localStorage.setItem("cabinetmap_user", JSON.stringify(res.user));
    }
  };

  const register = async (payload: RegisterPayload) => {
    const res = await registerUser(payload);
    setToken(res.token);
    setUser(res.user);
    if (typeof window !== "undefined") {
      localStorage.setItem("cabinetmap_token", res.token);
      localStorage.setItem("cabinetmap_user", JSON.stringify(res.user));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("cabinetmap_token");
      localStorage.removeItem("cabinetmap_user");
    }
  };

  const changeUserPassword = async (payload: ChangePasswordPayload) => {
    await changePassword(payload);
  };

  const requestForgotPassword = async (payload: ForgotPasswordPayload) => {
    return await forgotPassword(payload);
  };

  const performResetPassword = async (payload: ResetPasswordPayload) => {
    await resetPassword(payload);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        changeUserPassword,
        requestForgotPassword,
        performResetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

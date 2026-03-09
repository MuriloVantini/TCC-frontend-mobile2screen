import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuthApi } from "../hooks/api/entities";
import type { AuthUser } from "../hooks/api/laravel-api.types";

export interface UserContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<AuthUser | null>;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

interface UserContextProviderProps {
  children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const authApi = useMemo(() => useAuthApi(), []);
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setUser = useCallback((nextUser: AuthUser | null) => {
    setUserState(nextUser);
    setError(null);
  }, []);

  const clearUser = useCallback(() => {
    setUserState(null);
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentUser = await authApi.user();
      setUserState(currentUser);
      return currentUser;
    } catch {
      setUserState(null);
      setError("Nao foi possivel carregar o usuario autenticado.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [authApi]);

  useEffect(() => {
    refreshUser().catch(() => {
      // Erro ja tratado no proprio refreshUser.
    });
  }, [refreshUser]);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isLoading,
      error,
      refreshUser,
      setUser,
      clearUser,
    }),
    [user, isLoading, error, refreshUser, setUser, clearUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext(): UserContextValue {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUserContext deve ser usado dentro de UserContextProvider.");
  }

  return context;
}

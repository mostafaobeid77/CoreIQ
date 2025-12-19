import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService, CurrentUser } from "../services/authService";
import { api } from "../services/api";

export interface AuthContextValue {
  user: CurrentUser | null;
  initializing: boolean;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const refreshUser = useCallback(async () => {
    console.time('Auth Bootstrap');
    try {
      // 1. Try to load from cache first for immediate UI
      const cachedUser = await authService.getUserCache();
      if (cachedUser) {
        console.log('Loaded user from cache');
        setUser(cachedUser);
        setInitializing(false); // Unblock UI immediately if we have cache
      }

      const token = await api.getToken();
      if (!token) {
        setUser(null);
        console.timeEnd('Auth Bootstrap');
        return;
      }

      // 2. Fetch fresh data in background
      console.time('Fetch User Profile');
      const profile = await authService.getCurrentUser();
      console.timeEnd('Fetch User Profile');
      setUser(profile);
    } catch (error) {
      console.error("Failed to fetch current user:", (error as Error)?.message);
      // Only logout if we don't have a cached user, or if the token is invalid
      // If network fails but we have cache, keep the user logged in
      const cachedUser = await authService.getUserCache();
      if (!cachedUser) {
        await authService.logout();
        setUser(null);
      }
    } finally {
      setInitializing(false);
      console.timeEnd('Auth Bootstrap');
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      refreshUser,
      setUser,
      logout,
    }),
    [user, initializing, refreshUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}






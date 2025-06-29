import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import {
  isAuthenticated as authIsAuthenticated,
  getCurrentUser,
  login as authLogin,
  logout as authLogout,
  checkAndHandleRefreshTokenFailure,
} from "../services/auth/AuthService";
import { clearOtherUsersProgress } from "../services/api/SurveyService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutCallbacks, setLogoutCallbacks] = useState([]);

  // Register logout callback
  const registerLogoutCallback = useCallback((callback) => {
    setLogoutCallbacks((prev) => [...prev, callback]);
    return () => {
      setLogoutCallbacks((prev) => prev.filter((cb) => cb !== callback));
    };
  }, []);

  // Trigger logout callbacks
  const triggerLogout = useCallback(() => {
    logoutCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error("Logout callback error:", error);
      }
    });
  }, [logoutCallbacks]);

  // Load user function
  const loadUser = useCallback(async () => {
    try {
      // First check if there's a refresh token failure
      const hasRefreshFailure = await checkAndHandleRefreshTokenFailure();
      if (hasRefreshFailure) {
        // console.log("Refresh token failure detected, clearing user state");
        setUser(null);
        setLoading(false);
        return;
      }

      const authenticated = await authIsAuthenticated();
      if (authenticated) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Clear survey progress from other users when app loads
        try {
          await clearOtherUsersProgress();
        } catch (error) {
          console.error("Error clearing other users progress on load:", error);
        }
      } else {
        // Clear user state if not authenticated
        setUser(null);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      // Clear tokens and user state on error
      try {
        await authLogout();
      } catch (logoutError) {
        console.error("Error during logout after load failure:", logoutError);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email, password) => {
    try {
      const result = await authLogin(email, password);
      setUser(result.user);

      // Clear survey progress from other users after successful login
      try {
        await clearOtherUsersProgress();
      } catch (error) {
        console.error("Error clearing other users progress:", error);
      }

      return result;
    } catch (error) {
      console.error("Login error in context:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authLogout();
      setUser(null);
      triggerLogout(); // Trigger all logout callbacks
    } catch (error) {
      console.error("Logout error in context:", error);
      // Still clear user state even if logout fails
      setUser(null);
      triggerLogout();
    }
  }, [triggerLogout]);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
      return null;
    }
  }, []);

  const isAuthenticated = useCallback(() => {
    return user !== null;
  }, [user]);

  const hasRole = useCallback(
    (role) => {
      return user?.role === role;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        refreshUser,
        isAuthenticated: isAuthenticated(),
        hasRole,
        registerLogoutCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

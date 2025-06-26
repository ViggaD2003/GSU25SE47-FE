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
} from "../utils/AuthService";

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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authenticated = await authIsAuthenticated();
        if (authenticated) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        await authLogout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await authLogin(email, password);
      setUser(result.user);
      return result;
    } catch (error) {
      console.error("Login error in context:", error);
      throw error;
    }
  };

  const logout = async () => {
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
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
      return null;
    }
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

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

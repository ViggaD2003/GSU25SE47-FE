import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { token, role }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          setUser({ token, role: decoded.role });
        }
      } catch (e) { }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (token) => {
    const decoded = jwtDecode(token);
    const allowedRoles = ["STUDENT", "PARENTS"];

    if (!allowedRoles.includes(decoded.role)) {
      throw new Error("Only Student or Parent can log in.");
    }

    await AsyncStorage.setItem("token", token);
    setUser({ token, role: decoded.role });
  };


  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 
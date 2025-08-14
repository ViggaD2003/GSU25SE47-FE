import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { APP_CONFIG } from "../constants";
import { Client } from "@stomp/stompjs";

const RealTimeContext = createContext(null);

export const RealTimeProvider = ({ children }) => {
  const { user } = useAuth();
  const token = user?.accessToken || user?.token;

  console.log("🔧 RealTimeProvider render - Token:", !!token, "User:", !!user);

  // State management

  return (
    <RealTimeContext.Provider value={{}}>{children}</RealTimeContext.Provider>
  );
};

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error("useRealTime must be used within a RealTimeProvider");
  }
  return context;
};

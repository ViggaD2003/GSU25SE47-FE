import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import * as Calendar from "expo-calendar";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({
    calendar: null,
  });

  const appState = useRef(AppState.currentState);

  // --- Check tất cả quyền
  const checkAllPermissions = async () => {
    const [{ status: calendar }] = await Promise.all([
      Calendar.getCalendarPermissionsAsync(),
    ]);

    setPermissions({
      calendar,
      location,
      camera,
      microphone,
      notifications,
    });
  };

  // --- Request quyền theo từng loại
  const requestPermission = async (type) => {
    let status = null;
    switch (type) {
      case "calendar":
        ({ status } = await Calendar.requestCalendarPermissionsAsync());
        break;
      default:
        throw new Error(`Unknown permission type: ${type}`);
    }

    setPermissions((prev) => ({
      ...prev,
      [type]: status,
    }));

    return status;
  };

  useEffect(() => {
    checkAllPermissions(); // khi mở app
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        checkAllPermissions(); // khi quay lại app
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, []);

  return (
    <PermissionContext.Provider
      value={{ permissions, checkAllPermissions, requestPermission }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);

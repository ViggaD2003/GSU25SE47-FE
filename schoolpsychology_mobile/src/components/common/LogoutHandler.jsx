import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import Toast from "./Toast";
import { useAuth } from "../../contexts/AuthContext";
import { useTokenErrorHandler } from "../../utils/hooks";
import { AUTH_ERRORS } from "../../constants";

const LogoutHandler = ({ children }) => {
  const { isAuthenticated, user, registerLogoutCallback } = useAuth();
  const { handleTokenError, resetErrorCount } = useTokenErrorHandler();
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");

  // Reset error count when user changes
  useEffect(() => {
    resetErrorCount();
  }, [user, resetErrorCount]);

  // Handle logout notification
  const handleLogoutNotification = useCallback(
    (message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.") => {
      setLogoutMessage(message);
      setShowLogoutToast(true);
    },
    []
  );

  // Register logout callback
  useEffect(() => {
    const unsubscribe = registerLogoutCallback(() => {
      handleLogoutNotification();
    });

    return unsubscribe;
  }, [registerLogoutCallback, handleLogoutNotification]);

  // Handle toast hide
  const handleToastHide = useCallback(() => {
    setShowLogoutToast(false);
    setLogoutMessage("");
  }, []);

  // Handle toast press (optional - for additional actions)
  const handleToastPress = useCallback(() => {
    // You can add additional actions here, like navigating to login screen
    console.log("Logout toast pressed");
  }, []);

  return (
    <View style={styles.container}>
      {children}

      {/* <Toast
        visible={showLogoutToast}
        message={logoutMessage}
        type="logout"
        duration={5000}
        onHide={handleToastHide}
        onPress={handleToastPress}
        showCloseButton={true}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LogoutHandler;

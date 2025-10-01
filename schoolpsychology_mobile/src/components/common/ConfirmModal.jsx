import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ConfirmModal = ({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "warning",
}) => {
  const getModalStyle = () => {
    switch (type) {
      case "danger":
        return {
          icon: "warning",
          iconColor: "#EF4444",
          confirmButtonColor: "#EF4444",
          backgroundColor: "#FEF2F2",
        };
      case "warning":
        return {
          icon: "alert-circle",
          iconColor: "#F59E0B",
          confirmButtonColor: "#F59E0B",
          backgroundColor: "#FFFBEB",
        };
      case "info":
        return {
          icon: "information-circle",
          iconColor: "#3B82F6",
          confirmButtonColor: "#3B82F6",
          backgroundColor: "#EFF6FF",
        };
      default:
        return {
          icon: "alert-circle",
          iconColor: "#F59E0B",
          confirmButtonColor: "#F59E0B",
          backgroundColor: "#FFFBEB",
        };
    }
  };

  const modalStyle = getModalStyle();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                { backgroundColor: modalStyle.backgroundColor },
              ]}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={modalStyle.icon}
                  size={48}
                  color={modalStyle.iconColor}
                />
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: modalStyle.confirmButtonColor },
                  ]}
                  onPress={onConfirm}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFBEB",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
});

export default ConfirmModal;

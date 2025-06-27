import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import api from "../../utils/axios";
import Container from "../../components/Container";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function ChangePassword({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!currentPassword) newErrors.currentPassword = "Current password must not be blank";
    if (!newPassword) {
      newErrors.newPassword = "New password must not be blank";
    } else if (newPassword.length < 8 || newPassword.length > 50) {
      newErrors.newPassword = "New password must be between 8 and 50 characters";
    }

    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = "Confirm new password must not be blank";
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = "New password and confirm password do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    const isValid = validate();
    if (!isValid) return;
  
    setLoading(true);
    try {
      await api.post("/api/v1/auth/change-password", {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
  
      Toast.show({
        type: 'success',
        text1: 'Success 🎉',
        text2: 'Password changed successfully',
      });
  
      navigation.goBack();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      Toast.show({
        type: 'error',
        text1: 'Error ❌',
        text2: msg,
      });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Container>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.wrapper}>
        <TextInput
          style={[styles.input, errors.currentPassword && styles.inputError]}
          placeholder="Current Password"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        {errors.currentPassword && (
          <Text style={styles.errorText}>{errors.currentPassword}</Text>
        )}

        <TextInput
          style={[styles.input, errors.newPassword && styles.inputError]}
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        {errors.newPassword && (
          <Text style={styles.errorText}>{errors.newPassword}</Text>
        )}

        <TextInput
          style={[styles.input, errors.confirmNewPassword && styles.inputError]}
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />
        {errors.confirmNewPassword && (
          <Text style={styles.errorText}>{errors.confirmNewPassword}</Text>
        )}

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Changing..." : "Change Password"}
          </Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
    fontSize: 13,
  },
  button: {
    backgroundColor: "#2E7D32",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
});

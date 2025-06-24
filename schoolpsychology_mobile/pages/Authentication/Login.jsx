import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { GlobalStyles } from "../../contants/styles";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/v1/auth/login", { email, password });
      const token = res.data.data.token;
      if (!token) throw new Error("No token returned");
      await login(token);
    } catch (err) {
      let msg = "Login failed. Please check your credentials.";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Image source={require("../../assets/logo.svg")} style={styles.logo} />
        <Text style={styles.appName}>
          <Text style={styles.appNameBold}>Mindful</Text>Care
        </Text>
        <Text style={styles.title}>Sign in to your account</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor="#B0B0B0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter your password"
              placeholderTextColor="#B0B0B0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text style={{ fontSize: 20, color: "#888" }}>
                {showPassword ? "🙈" : "👁️"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.signInButtonText}>Sign in</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={loading} transparent animationType="none">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator
            size="large"
            color={GlobalStyles.colors.primary700}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "top",
    alignItems: "center",
  },
  innerContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 8,
    padding: 32,
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 16,
    resizeMode: "contain",
  },
  appName: {
    fontSize: 28,
    fontWeight: "400",
    color: "#222",
    marginBottom: 4,
  },
  appNameBold: {
    fontWeight: "300",
    color: GlobalStyles.colors.primary700,
  },
  title: {
    fontSize: 22,
    color: GlobalStyles.colors.gray700,
    marginBottom: 32,
    fontWeight: "500",
    textAlign: "center",
  },
  inputGroup: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#222",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#222",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeButton: {
    padding: 8,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: "#888",
    fontSize: 15,
  },
  signInButton: {
    width: "100%",
    backgroundColor: "#004B48",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    marginTop: 8,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  errorText: { color: "red", marginBottom: 12, alignSelf: "flex-start" },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Login;

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { apiSendOtp, emailRegex } from "../../utils/helpers";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyEmailScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const res = await apiSendOtp(email);

    setLoading(false);
    if (res.status !== 200) {
      setError(res.message || "Something went wrong.");
      return;
    }
    navigation.navigate("VerifyOtp", { email });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar barStyle="dark-content" />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
          backgroundColor: "#FFFFFF",
        }}
      >
        <View style={{ width: "100%", maxWidth: 420 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <View>
              <Text style={{ fontSize: 20, color: "#6B7280" }}>
                Securely recover access to your account
              </Text>
            </View>
          </View>

          {/* Card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#6B7280",
                marginBottom: 12,
              }}
            >
              Verify email
            </Text>

            <Text style={{ fontSize: 14, color: "#111827" }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              inputMode="email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@company.com"
              placeholderTextColor="#9CA3AF"
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 12,
                paddingHorizontal: 12,
                height: 44,
                color: "#111827",
                backgroundColor: "#FFFFFF",
              }}
            />
            {!!error && (
              <Text style={{ color: "#DC2626", marginTop: 8, fontSize: 12 }}>
                {error}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={{
                marginTop: 16,
                backgroundColor: "#004B48",
                paddingVertical: 12,
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                {loading ? "Sending…" : "Send verification code"}
              </Text>
            </TouchableOpacity>

            <Text style={{ marginTop: 8, fontSize: 12, color: "#6B7280" }}>
              We'll email a 6-digit code to verify it's you.
            </Text>
          </View>

          {/* Footer */}
          {/* <View style={{ marginTop: 12, alignItems: "center" }}>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>
              Remembered it?{" "}
              <Text style={{ fontWeight: "600", color: "#004B48", textDecorationLine: 'underline'}} onPress={() => navigation.navigate('Login')}>
                Go back to sign in
              </Text>
            </Text>
          </View> */}
        </View>
      </View>
    </SafeAreaView>
  );
}

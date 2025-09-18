import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { apiResetPassword, getPasswordScore, maskEmail } from "../../utils/helpers";
import StrengthBar from "../../components/common/StrengthBar";
import { SafeAreaView } from "react-native-safe-area-context";

function Check({ ok }) {
  return (
    <View
      style={{
        height: 16,
        width: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: ok ? "#10B981" : "#D1D5DB",
        backgroundColor: ok ? "#10B981" : "transparent",
      }}
    />
  );
}

export default function ChangePasswordScreen({ route, navigation }) {
  const email = route?.params?.email || "";

  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const score = getPasswordScore(pw);
  const valid = score >= 3 && pw === confirm;

  async function handleSubmit() {
    try {
      setError("");
      if (!valid) {
        setError("Please meet the requirements and confirm your password.");
        return;
      }
      setLoading(true);
      const res = await apiResetPassword(email, pw, confirm);
      if (res.status !== 200) {
        setError(res.message || "Could not change password.");
        return;
      }
      navigation.replace("Done");
    } catch (error) {
      console.log("Error changing password:", error);
    } finally {
      setLoading(false);
    }
  }

  // màu cố định sáng
  const BORDER = "#E5E7EB";
  const FG = "#111827";
  const BG = "#FFFFFF";
  const MUTED = "#6B7280";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="dark-content" />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
          backgroundColor: BG,
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
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                padding: 6,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: BORDER,
              }}
            >
              <Text style={{ color: FG }}>Back</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 12, color: MUTED }}>
              Changing password for{" "}
              <Text style={{ fontWeight: "600", color: FG }}>
                {maskEmail(email || "")}
              </Text>
            </Text>
          </View>

          <View
            style={{
              backgroundColor: BG,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: BORDER,
            }}
          >
            <Text style={{ fontSize: 14, color: FG }}>New password</Text>
            <TextInput
              value={pw}
              onChangeText={setPw}
              secureTextEntry
              autoComplete="password-new"
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 12,
                paddingHorizontal: 12,
                height: 44,
                color: FG,
                backgroundColor: BG,
              }}
            />
            <StrengthBar score={score} color="#2563EB" />

            <View style={{ marginTop: 10, gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Check ok={pw.length >= 8} />
                <Text style={{ color: FG, fontSize: 12 }}>At least 8 characters</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Check ok={/[A-Z]/.test(pw)} />
                <Text style={{ color: FG, fontSize: 12 }}>One uppercase letter</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Check ok={/[a-z]/.test(pw)} />
                <Text style={{ color: FG, fontSize: 12 }}>One lowercase letter</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Check ok={/[0-9]/.test(pw)} />
                <Text style={{ color: FG, fontSize: 12 }}>One number</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Check ok={/[^A-Za-z0-9]/.test(pw)} />
                <Text style={{ color: FG, fontSize: 12 }}>One special character</Text>
              </View>
            </View>

            <Text style={{ marginTop: 14, fontSize: 14, color: FG }}>
              Confirm password
            </Text>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoComplete="password-new"
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 12,
                paddingHorizontal: 12,
                height: 44,
                color: FG,
                backgroundColor: BG,
              }}
            />
            {confirm !== "" && confirm !== pw && (
              <Text style={{ marginTop: 6, fontSize: 12, color: "#DC2626" }}>
                Passwords do not match.
              </Text>
            )}

            {!!error && (
              <Text style={{ color: "#DC2626", marginTop: 8, fontSize: 12 }}>
                {error}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!valid || loading}
              style={{
                marginTop: 16,
                backgroundColor: "#004B48",
                paddingVertical: 12,
                borderRadius: 16,
                alignItems: "center"
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                {loading ? "Updating…" : "Change password"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

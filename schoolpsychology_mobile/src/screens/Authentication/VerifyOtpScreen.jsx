import React, { useMemo, useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { apiVerifyOtp, apiSendOtp, maskEmail } from "../../utils/helpers";
import OtpCell from "../../components/common/OtpCell";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyOtpScreen({ route, navigation }) {
  const email = route?.params?.email || "";
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(60);
  const refs = Array.from({ length: 6 }, () => useRef(null));

  // fixed light theme colors
  const BG = "#FFFFFF";
  const FG = "#111827";
  const MUTED = "#6B7280";
  const BORDER = "#E5E7EB";
  const LINK = "#1D4ED8";

  useEffect(() => {
    if (counter <= 0) return;
    const t = setTimeout(() => setCounter((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [counter]);

  const code = useMemo(() => digits.join(""), [digits]);

  async function handleVerify() {
    setError("");
    if (code.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setLoading(true);
    const res = await apiVerifyOtp(email, code);
    setLoading(false);
    if (res.status !== 200) {
      setError(res.message || "Invalid code.");
      return;
    }
    navigation.navigate("ChangePassword", { email });
  }

  async function handleResendToken() {
    const res = await apiSendOtp(email);
    setLoading(false);
    if (res.status !== 200) {
      setError(res.message || "Something went wrong.");
      return;
    }
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: BG }}
    >
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
            <Text style={{ fontSize: 12, color: MUTED }}>
              Code sent to{" "}
              <Text style={{ fontWeight: "600", color: FG }}>
                {maskEmail(email)}
              </Text>
            </Text>
          </View>

          {/* OTP cells */}
          <View
            style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}
          >
            {digits.map((d, i) => (
              <OtpCell
                key={i}
                value={d}
                scheme="light" // ép style sáng cho OtpCell
                inputRef={refs[i]}
                onChange={(v) => {
                  const next = [...digits];
                  next[i] = v;
                  setDigits(next);
                  if (v && i < 5)
                    refs[i + 1].current && refs[i + 1].current.focus();
                }}
                onBackspace={() => {
                  if (i > 0) refs[i - 1].current && refs[i - 1].current.focus();
                }}
              />
            ))}
          </View>

          {!!error && (
            <Text
              style={{
                color: "#DC2626",
                marginTop: 8,
                fontSize: 12,
                textAlign: "center",
              }}
            >
              {error}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleVerify}
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
              {loading ? "Verifying…" : "Verify code"}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 12, color: MUTED }}>
              Didn't receive the code?{" "}
            </Text>
            <TouchableOpacity
              onPress={async () => {
                if (counter > 0) return;
                setCounter(60);
                await handleResendToken();
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: counter > 0 ? "#9CA3AF" : LINK,
                }}
              >
                {counter > 0 ? `Resend in ${counter}s` : "Resend now"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

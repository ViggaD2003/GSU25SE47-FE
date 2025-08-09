import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useLanguage } from "../../contexts";

const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <TouchableOpacity onPress={toggleLanguage} style={styles.container}>
      <View style={[styles.badge, language === "vi" ? styles.active : null]}>
        <Text
          style={[styles.text, language === "vi" ? styles.textActive : null]}
        >
          VI
        </Text>
      </View>
      <View style={[styles.badge, language === "en" ? styles.active : null]}>
        <Text
          style={[styles.text, language === "en" ? styles.textActive : null]}
        >
          EN
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 2,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  active: {
    backgroundColor: "#FFFFFF",
  },
  text: {
    fontSize: 12,
    color: "#334155",
  },
  textActive: {
    color: "#0f766e",
    fontWeight: "700",
  },
});

export default LanguageSwitcher;

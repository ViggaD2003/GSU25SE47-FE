import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { Container } from "../../components";
import { useLanguage } from "../../contexts";
import { useTranslation } from "react-i18next";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";

export default function LanguageSettings({ navigation }) {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  const languages = [
    {
      code: "vi",
      name: "Tiếng Việt",
      nativeName: "Tiếng Việt",
      flag: "🇻🇳",
    },
    {
      code: "en",
      name: "English",
      nativeName: "English",
      flag: "🇺🇸",
    },
  ];

  const handleLanguageChange = async (langCode) => {
    await changeLanguage(langCode);
  };

  return (
    <Container>
      <HeaderWithoutTab
        title={t("profile.languageSettings")}
        subtitle={t("profile.languageSettingsSubtitle")}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile.selectLanguage")}</Text>
          <Text style={styles.sectionDescription}>
            {t("profile.languageDescription")}
          </Text>
        </View>

        <View style={styles.languageList}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                language === lang.code && styles.languageItemActive,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <View style={styles.languageText}>
                  <Text
                    style={[
                      styles.languageName,
                      language === lang.code && styles.languageNameActive,
                    ]}
                  >
                    {lang.name}
                  </Text>
                  <Text
                    style={[
                      styles.languageNative,
                      language === lang.code && styles.languageNativeActive,
                    ]}
                  >
                    {lang.nativeName}
                  </Text>
                </View>
              </View>

              {language === lang.code && (
                <View style={styles.checkIcon}>
                  <Icon name="check-circle" size={24} color="#0f766e" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Icon name="information-outline" size={20} color="#6b7280" />
            <Text style={styles.infoText}>
              {t("profile.languageChangeNote")}
            </Text>
          </View>
        </View> */}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#181A3D",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  languageList: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  languageItemActive: {
    backgroundColor: "#f0fdfa",
    borderBottomColor: "#0f766e",
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#181A3D",
    marginBottom: 2,
  },
  languageNameActive: {
    color: "#0f766e",
    fontWeight: "600",
  },
  languageNative: {
    fontSize: 14,
    color: "#6b7280",
  },
  languageNativeActive: {
    color: "#0f766e",
  },
  checkIcon: {
    marginLeft: 12,
  },
  infoSection: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoText: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});

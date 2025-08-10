import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import * as Localization from "expo-localization";

const LanguageContext = createContext(undefined);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(null); // Start with null to indicate not initialized
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        console.log("LanguageProvider: Initializing language...");
        console.log("LanguageProvider: i18n.language =", i18n.language);

        // Load saved language from AsyncStorage first
        const saved = await AsyncStorage.getItem("language");
        console.log(
          "LanguageProvider: Saved language from AsyncStorage =",
          saved
        );

        let finalLanguage = "vi"; // Default fallback

        if (saved && (saved === "en" || saved === "vi")) {
          // If we have a valid saved language, use it
          console.log("LanguageProvider: Using saved language:", saved);
          finalLanguage = saved;
        } else {
          // If no saved language or invalid, get device language from expo-localization
          const deviceLanguageCode =
            Array.isArray(Localization.getLocales()) &&
            Localization.getLocales().length > 0
              ? Localization.getLocales()[0].languageCode
              : "vi";

          finalLanguage = deviceLanguageCode?.startsWith("vi") ? "vi" : "en";
          console.log(
            "LanguageProvider: No valid saved language, using device language:",
            finalLanguage,
            "(device code:",
            deviceLanguageCode,
            ")"
          );

          // Save the detected device language to AsyncStorage
          await AsyncStorage.setItem("language", finalLanguage);
          console.log(
            "LanguageProvider: Saved device language to AsyncStorage:",
            finalLanguage
          );
        }

        // Set the language state and update i18n
        console.log(
          "LanguageProvider: Setting final language to:",
          finalLanguage
        );
        setLanguage(finalLanguage);
        await i18n.changeLanguage(finalLanguage);

        // Update fallback language to match the final language
        i18n.options.fallbackLng = finalLanguage;
        console.log(
          "LanguageProvider: Updated i18n fallback language to:",
          finalLanguage
        );

        console.log(
          "LanguageProvider: Language initialization completed with language:",
          finalLanguage
        );
      } catch (error) {
        console.error("LanguageProvider: Error loading language:", error);
        // Fallback to Vietnamese
        console.log(
          "LanguageProvider: Falling back to Vietnamese due to error"
        );
        setLanguage("vi");
        await i18n.changeLanguage("vi");
      } finally {
        setLoading(false);
        console.log("LanguageProvider: Language initialization completed");
      }
    })();
  }, []); // Empty dependency array to run only once

  const changeLanguage = async (lang) => {
    try {
      console.log("LanguageProvider: Changing language to:", lang);
      setLanguage(lang);
      await i18n.changeLanguage(lang);
      await AsyncStorage.setItem("language", lang);
      console.log("LanguageProvider: Language changed successfully to:", lang);
    } catch (error) {
      console.error("LanguageProvider: Error changing language:", error);
    }
  };

  const toggleLanguage = async () => {
    const currentLang = language || "vi"; // Handle null case
    const next = currentLang === "vi" ? "en" : "vi";
    console.log(
      "LanguageProvider: Toggling language from",
      currentLang,
      "to",
      next
    );
    await changeLanguage(next);
  };

  // Debug function to clear language from AsyncStorage
  const clearLanguageStorage = async () => {
    try {
      await AsyncStorage.removeItem("language");
      console.log("LanguageProvider: Cleared language from AsyncStorage");
    } catch (error) {
      console.error(
        "LanguageProvider: Error clearing language storage:",
        error
      );
    }
  };

  const value = useMemo(
    () => ({
      language: language || "vi", // Provide fallback for null case
      changeLanguage,
      toggleLanguage,
      loading,
      clearLanguageStorage, // Export for debugging
    }),
    [language, loading]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

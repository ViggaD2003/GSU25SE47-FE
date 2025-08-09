import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

const LanguageContext = createContext(undefined);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "vi");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("language");
        if (saved && saved !== language) {
          setLanguage(saved);
          await i18n.changeLanguage(saved);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const changeLanguage = async (lang) => {
    setLanguage(lang);
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem("language", lang);
  };

  const toggleLanguage = async () => {
    const next = language === "vi" ? "en" : "vi";
    await changeLanguage(next);
  };

  const value = useMemo(
    () => ({ language, changeLanguage, toggleLanguage, loading }),
    [language, loading]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

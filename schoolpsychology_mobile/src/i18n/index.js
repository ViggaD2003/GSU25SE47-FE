import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "../locales/en/translation.json";
import vi from "../locales/vi/translation.json";

const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

// Get device language for reference only - don't use as fallback initially
const deviceLanguageCode =
  Array.isArray(Localization.getLocales()) &&
  Localization.getLocales().length > 0
    ? Localization.getLocales()[0].languageCode
    : "vi";

console.log("i18n: Device language code =", deviceLanguageCode);
console.log(
  "i18n: Note: Language will be set by LanguageContext after checking AsyncStorage"
);

i18n.use(initReactI18next).init({
  resources,
  lng: "vi", // Start with Vietnamese as default, will be overridden by LanguageContext
  fallbackLng: "vi", // Simple fallback, will be updated by LanguageContext
  compatibilityJSON: "v3",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

console.log("i18n: Initialized with basic fallback language = vi");
console.log(
  "i18n: Note: Actual language and fallback will be set by LanguageContext after checking AsyncStorage"
);

export default i18n;

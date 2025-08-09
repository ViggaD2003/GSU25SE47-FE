import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "../locales/en/translation.json";
import vi from "../locales/vi/translation.json";

const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

const deviceLanguageCode =
  Array.isArray(Localization.getLocales()) &&
  Localization.getLocales().length > 0
    ? Localization.getLocales()[0].languageCode
    : "vi";

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguageCode?.startsWith("vi") ? "vi" : "en",
  fallbackLng: "vi",
  compatibilityJSON: "v3",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;

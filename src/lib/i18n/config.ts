export const locales = ["en", "th", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  th: "ไทย",
  zh: "中文",
};

export const localeHtmlLang: Record<Locale, string> = {
  en: "en",
  th: "th",
  zh: "zh-Hans",
};

export const LOCALE_STORAGE_KEY = "ratequip-locale";

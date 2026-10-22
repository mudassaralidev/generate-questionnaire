import clm from "country-locale-map";
import { COUNTRIES } from "./countries";

/** ISO 639 language code, for example `ja`, `zh`, or `ar`. */
export const LANGUAGE_CODE = /^[a-z]{2,3}$/;

/** Preferred country for a language when resolving a flag emoji. */
const PRIMARY_COUNTRY_BY_LANGUAGE = {
  en: "GB",
  zh: "CN",
  ar: "SA",
  es: "ES",
  fr: "FR",
  pt: "PT",
  de: "DE",
  it: "IT",
  ja: "JP",
  ko: "KR",
  ru: "RU",
  nl: "NL",
  pl: "PL",
  tr: "TR",
  vi: "VN",
  th: "TH",
  id: "ID",
  hi: "IN",
  bn: "BD",
  ur: "PK",
  fa: "IR",
  he: "IL",
  el: "GR",
  sv: "SE",
  no: "NO",
  da: "DK",
  fi: "FI",
  cs: "CZ",
  hu: "HU",
  ro: "RO",
  uk: "UA",
  ms: "MY",
};

function languageFromCountry(alpha2) {
  const locale = clm.getLocaleByAlpha2(String(alpha2 || "").toUpperCase());
  if (!locale) return "";
  const language = String(locale).split(/[_-]/)[0].toLowerCase();
  return LANGUAGE_CODE.test(language) ? language : "";
}

const KNOWN_LANGUAGE_CODES = new Set(
  COUNTRIES.map((country) => languageFromCountry(country.value)).filter(
    Boolean,
  ),
);

/**
 * Resolve a country code or locale into a lowercase language code.
 * Japan (`JP` or `ja-jp`) becomes `ja`. China (`CN` or `zh-cn`) becomes `zh`.
 */
export function toLanguageCode(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const normalized = raw.replace(/_/g, "-").toLowerCase();
  if (normalized.includes("-")) {
    const language = normalized.split("-")[0];
    if (LANGUAGE_CODE.test(language)) return language;
  }

  if (/^[A-Z]{2}$/.test(raw)) {
    return languageFromCountry(raw) || raw.toLowerCase();
  }

  if (LANGUAGE_CODE.test(normalized)) {
    if (KNOWN_LANGUAGE_CODES.has(normalized)) return normalized;
    return languageFromCountry(normalized) || normalized;
  }

  return normalized;
}

function languageLabel(code) {
  try {
    const name = new Intl.DisplayNames(["en"], { type: "language" }).of(code);
    if (name && name.toLowerCase() !== code) return name;
  } catch {
    // Fall back to the code when the runtime has no display name.
  }
  return code;
}

/** Country whose flag emoji represents this language code. */
export function getCountryForLanguage(languageCode) {
  const code = toLanguageCode(languageCode);
  if (!LANGUAGE_CODE.test(code)) return null;

  const preferredAlpha2 = PRIMARY_COUNTRY_BY_LANGUAGE[code];
  if (preferredAlpha2) {
    const preferred = clm.getCountryByAlpha2(preferredAlpha2);
    if (preferred) return preferred;
  }

  const matches = clm.getAllCountries().filter((country) => {
    const language = String(country.default_locale || "")
      .split(/[_-]/)[0]
      .toLowerCase();
    return language === code;
  });

  const exact = matches.find((country) => {
    const parts = String(country.default_locale || "").split(/[_-]/);
    return parts[parts.length - 1]?.toUpperCase() === country.alpha2;
  });

  return exact || matches[0] || null;
}

export function getCountryEmojiForLanguage(languageCode) {
  return getCountryForLanguage(languageCode)?.emoji || "";
}

/**
 * FIELD-user language_configuration entries with label, value, and emoji.
 */
export function buildTranslationConfiguration({
  translationLanguage = "",
  translationLanguageCode = "",
  englishLabel = "English",
  englishCode = "en",
} = {}) {
  const label = String(translationLanguage || "").trim();
  const code = toLanguageCode(translationLanguageCode);
  if (!label || !LANGUAGE_CODE.test(code)) return [];

  return [
    {
      label: englishLabel,
      value: englishCode,
      emoji: getCountryEmojiForLanguage(englishCode),
    },
    {
      label,
      value: code,
      emoji: getCountryEmojiForLanguage(code),
    },
  ];
}

/** One option per language. The stored value is the language code. */
export const TRANSLATION_LANGUAGE_CODE_OPTIONS = [...KNOWN_LANGUAGE_CODES]
  .map((code) => ({
    value: code,
    label: `${languageLabel(code)} (${code})`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

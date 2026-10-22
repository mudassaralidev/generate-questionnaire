const clm = require("country-locale-map");

/** ISO 639 language code, for example `ja`, `zh`, or `ar`. */
const LANGUAGE_CODE = /^[a-z]{2,3}$/;

function languageFromCountry(alpha2) {
  const locale = clm.getLocaleByAlpha2(String(alpha2 || "").toUpperCase());
  if (!locale) return "";
  const language = String(locale).split(/[_-]/)[0].toLowerCase();
  return LANGUAGE_CODE.test(language) ? language : "";
}

const KNOWN_LANGUAGE_CODES = new Set(
  clm
    .getAllCountries()
    .map((country) => languageFromCountry(country.alpha2))
    .filter(Boolean),
);

/**
 * Resolve a country code or locale into a lowercase language code.
 * Japan (`JP` or `ja-jp`) becomes `ja`. China (`CN` or `zh-cn`) becomes `zh`.
 */
function toLanguageCode(value) {
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

module.exports = {
  LANGUAGE_CODE,
  toLanguageCode,
};

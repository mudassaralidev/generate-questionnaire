/**
 * Shared helpers for UI-visible string translation siblings (`{field}_translation`).
 */

export function translationKeyFor(field) {
  return `${field}_translation`;
}

export function isTranslationKey(key) {
  return String(key || "").endsWith("_translation");
}

/** Strip all `*_translation` keys from a plain object */
export function stripTranslationFields(obj = {}) {
  const out = { ...(obj || {}) };
  for (const key of Object.keys(out)) {
    if (isTranslationKey(key)) delete out[key];
  }
  return out;
}

/** Keep translation siblings only when translation is enabled */
export function withOptionalTranslation(obj = {}, requiresTranslation = false) {
  if (requiresTranslation) return { ...(obj || {}) };
  return stripTranslationFields(obj);
}

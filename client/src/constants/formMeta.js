export const SUBMISSION_TYPES = [
  { value: "FOUND", label: "Found" },
  { value: "NOT_FOUND", label: "Not Found" },
];

export const FORM_TYPES = [
  { value: "submission", label: "Submission" },
  { value: "new_poi", label: "New POI" },
  { value: "additional", label: "Additional" },
];

export const SUBMISSION_FORM_TYPE = "submission";

export const ENGLISH_LANGUAGE = "EN";

export const EMPTY_POP_DATA = {
  confirmation_text: "",
  confirmation_text_translation: "",
  confirm_button_text: "",
  confirm_button_text_translation: "",
  cancel_button_text: "",
  cancel_button_text_translation: "",
};

export const EMPTY_TRANSLATION = {
  requires_translation: false,
  translation_language_code: "",
  translation_language_title: "",
  default_language: ENGLISH_LANGUAGE,
  verify_button_translation: "",
  translation_support_to_overall_app: false,
};

/** @deprecated use EMPTY_TRANSLATION */
export const EMPTY_TRANSLATION_META = EMPTY_TRANSLATION;

export function requiresSubmissionType(formType) {
  return formType === SUBMISSION_FORM_TYPE;
}

export function translationKeyFor(field) {
  return `${field}_translation`;
}

export function isEnglishDefaultLanguage(value) {
  const normalized = String(value || "").trim();
  return !normalized || normalized === ENGLISH_LANGUAGE;
}

export function normalizePopData(
  popData,
  { requiresTranslation = false } = {},
) {
  const out = {
    confirmation_text: popData?.confirmation_text ?? "",
    confirm_button_text: popData?.confirm_button_text ?? "",
    cancel_button_text: popData?.cancel_button_text ?? "",
  };

  if (requiresTranslation) {
    out.confirmation_text_translation =
      popData?.confirmation_text_translation ?? "";
    out.confirm_button_text_translation =
      popData?.confirm_button_text_translation ?? "";
    out.cancel_button_text_translation =
      popData?.cancel_button_text_translation ?? "";
  }

  return out;
}

/**
 * Normalize translation settings into a nested `translation` object.
 */
export function normalizeTranslationMeta(source = {}) {
  const raw = source?.translation || {};

  const requires_translation = Boolean(raw?.requires_translation);
  const translation_language_code = String(raw?.translation_language_code || "")
    .trim()
    .toUpperCase();
  const translation_language_title = requires_translation
    ? String(raw?.translation_language_title || "").trim()
    : "";

  let default_language = ENGLISH_LANGUAGE;
  if (requires_translation) {
    const rawDefault = String(raw?.default_language || "").trim();
    if (isEnglishDefaultLanguage(rawDefault)) {
      default_language = ENGLISH_LANGUAGE;
    } else {
      // Non-English default stores the selected country Alpha-2 code
      default_language = translation_language_code || rawDefault.toUpperCase();
    }
  }

  const verify_button_translation = requires_translation
    ? String(raw?.verify_button_translation || "").trim()
    : "";

  const translation_support_to_overall_app = Boolean(
    raw?.translation_support_to_overall_app,
  );

  return {
    requires_translation,
    translation_language_code,
    translation_language_title,
    default_language,
    verify_button_translation,
    translation_support_to_overall_app,
  };
}

export function getDefaultLanguageOptions({
  translationLanguage = "",
  translationLanguageCode = "",
} = {}) {
  const options = [{ value: ENGLISH_LANGUAGE, label: "English" }];
  const title = String(translationLanguage || "").trim();
  const code = String(translationLanguageCode || "")
    .trim()
    .toUpperCase();
  if (code) {
    options.push({
      value: code,
      label: title ? `${title} (${code})` : code,
    });
  }
  return options;
}

export function normalizeMetaForStorage(meta = {}) {
  return {
    tenant: meta.tenant,
    form_type: meta.form_type,
    submission_type: requiresSubmissionType(meta.form_type)
      ? meta.submission_type
      : "",
  };
}

export function buildConfigPayloadForSave(
  meta,
  questions,
  {
    is_confirmation_popup = false,
    confirmation_popup = null,
    translation = EMPTY_TRANSLATION,
  } = {},
) {
  const isPopup = Boolean(is_confirmation_popup);
  const normalizedTranslation = normalizeTranslationMeta({
    translation,
  });

  return {
    ...normalizeMetaForStorage(meta),
    translation: normalizedTranslation,
    is_confirmation_popup: isPopup,
    confirmation_popup: isPopup
      ? normalizePopData(confirmation_popup, {
          requiresTranslation: normalizedTranslation.requires_translation,
        })
      : null,
    questions: isPopup ? [] : questions,
  };
}

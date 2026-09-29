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

export const ENGLISH_LANGUAGE = "ENGLISH";

export const EMPTY_POP_DATA = {
  confirmation_text: "",
  confirmation_text_translation: "",
  confirm_button_text: "",
  confirm_button_text_translation: "",
  cancel_button_text: "",
  cancel_button_text_translation: "",
};

export const EMPTY_TRANSLATION_META = {
  requires_translation: false,
  translation_language: "",
  default_language: ENGLISH_LANGUAGE,
};

export function requiresSubmissionType(formType) {
  return formType === SUBMISSION_FORM_TYPE;
}

export function translationKeyFor(field) {
  return `${field}_translation`;
}

export function normalizePopData(popData, { requiresTranslation = false } = {}) {
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

export function normalizeTranslationMeta(meta = {}) {
  const requires_translation = Boolean(meta.requires_translation);
  const translation_language = requires_translation
    ? String(meta.translation_language || "").trim()
    : "";

  let default_language = ENGLISH_LANGUAGE;
  if (requires_translation) {
    const rawDefault = String(meta.default_language || "").trim();
    if (rawDefault === ENGLISH_LANGUAGE || !rawDefault) {
      default_language = ENGLISH_LANGUAGE;
    } else {
      // Non-English default must match the typed translation language
      default_language = translation_language || rawDefault;
    }
  }

  return {
    requires_translation,
    translation_language,
    default_language,
  };
}

export function getDefaultLanguageOptions(translationLanguage = "") {
  const options = [{ value: ENGLISH_LANGUAGE, label: "English" }];
  const trimmed = String(translationLanguage || "").trim();
  if (trimmed) {
    options.push({ value: trimmed, label: trimmed });
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
    requires_translation = false,
    translation_language = "",
    default_language = ENGLISH_LANGUAGE,
  } = {},
) {
  const isPopup = Boolean(is_confirmation_popup);
  const translation = normalizeTranslationMeta({
    requires_translation,
    translation_language,
    default_language,
  });

  return {
    ...normalizeMetaForStorage(meta),
    ...translation,
    is_confirmation_popup: isPopup,
    confirmation_popup: isPopup
      ? normalizePopData(confirmation_popup, {
          requiresTranslation: translation.requires_translation,
        })
      : null,
    questions: isPopup ? [] : questions,
  };
}

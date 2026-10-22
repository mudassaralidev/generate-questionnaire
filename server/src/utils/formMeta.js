const { LANGUAGE_CODE, toLanguageCode } = require("./languageCountryCode");

const SUBMISSION_TYPE_VALUES = ["FOUND", "NOT_FOUND"];
const SUBMISSION_FORM_TYPE = "submission";
const ENGLISH_LANGUAGE = "en";

function requiresSubmissionType(formType) {
  return formType === SUBMISSION_FORM_TYPE;
}

function isEnglishDefaultLanguage(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return !normalized || normalized === ENGLISH_LANGUAGE;
}

function normalizeTranslationConfiguration(raw = [], { enabled = false } = {}) {
  if (!enabled || !Array.isArray(raw)) return [];

  return raw
    .map((item) => ({
      label: String(item?.label || "").trim(),
      value: toLanguageCode(item?.value || ""),
      emoji: String(item?.emoji || "").trim(),
    }))
    .filter((item) => item.label && LANGUAGE_CODE.test(item.value));
}

/**
 * Normalize into nested `translation` object.
 */
function normalizeTranslationMeta(doc = {}) {
  const raw = doc?.translation || {};

  const requires_translation = Boolean(raw.requires_translation);
  const translation_language_code = toLanguageCode(
    raw.translation_language_code || "",
  );
  const translation_language = requires_translation
    ? String(
        raw.translation_language || raw.translation_language_title || "",
      ).trim()
    : "";

  let default_language = ENGLISH_LANGUAGE;
  if (requires_translation) {
    const rawDefault = String(raw.default_language || "").trim();
    if (isEnglishDefaultLanguage(rawDefault)) {
      default_language = ENGLISH_LANGUAGE;
    } else {
      default_language =
        translation_language_code || toLanguageCode(rawDefault);
    }
  }

  const verify_button_translation = requires_translation
    ? String(raw.verify_button_translation || "").trim()
    : "";

  const translation_support_to_overall_app = requires_translation
    ? Boolean(raw.translation_support_to_overall_app)
    : false;

  const language_configuration = normalizeTranslationConfiguration(
    raw.language_configuration,
    { enabled: translation_support_to_overall_app },
  );

  return {
    requires_translation,
    translation_language_code,
    translation_language,
    default_language,
    verify_button_translation,
    translation_support_to_overall_app,
    language_configuration,
  };
}

/** Map legacy stored meta → submission_type + form_type */
function normalizeConfigMeta(doc) {
  if (!doc) return doc;

  const out = { ...doc };

  if (!out.submission_type && out.questions_type) {
    if (SUBMISSION_TYPE_VALUES.includes(out.form_type)) {
      out.submission_type = out.form_type;
      out.form_type = out.questions_type;
    } else if (SUBMISSION_TYPE_VALUES.includes(out.questions_type)) {
      out.submission_type = out.questions_type;
      out.form_type = out.form_type || "submission";
    } else {
      out.submission_type = out.questions_type;
    }
  }

  delete out.questions_type;

  if (!requiresSubmissionType(out.form_type)) {
    out.submission_type = out.submission_type || "";
  }

  out.translation = normalizeTranslationMeta(out);

  out.is_confirmation_popup = Boolean(out.is_confirmation_popup);
  if (!out.is_confirmation_popup) {
    out.confirmation_popup = null;
  } else if (
    !out.confirmation_popup ||
    typeof out.confirmation_popup !== "object"
  ) {
    out.confirmation_popup = {
      confirmation_text: "",
      confirm_button_text: "",
      cancel_button_text: "",
    };
  }

  return out;
}

function stripLegacyMetaFields(data = {}) {
  const out = { ...data };
  delete out._id;
  delete out.type;
  delete out.createdAt;
  delete out.updatedAt;
  delete out.__v;
  delete out.questions_type;
  if (!requiresSubmissionType(out.form_type)) {
    out.submission_type = "";
  }

  out.translation = normalizeTranslationMeta(out);

  return out;
}

module.exports = {
  normalizeConfigMeta,
  stripLegacyMetaFields,
  requiresSubmissionType,
  normalizeTranslationMeta,
  ENGLISH_LANGUAGE,
};

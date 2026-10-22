const Joi = require("joi");
const {
  LANGUAGE_CODE,
  toLanguageCode,
} = require("../utils/languageCountryCode");

const objectId = Joi.string().pattern(/^[a-f\d]{24}$/i, "ObjectId");

const positiveInteger = Joi.number().integer().min(1);

const validationErrorFields = {
  required_error: Joi.string().max(500),
  required_error_translation: Joi.string().max(500).allow(""),
  min_length_error: Joi.string().max(500),
  min_length_error_translation: Joi.string().max(500).allow(""),
  max_length_error: Joi.string().max(500),
  max_length_error_translation: Joi.string().max(500).allow(""),
  pattern_error: Joi.string().max(500),
  pattern_error_translation: Joi.string().max(500).allow(""),
  contains_error: Joi.string().max(500),
  contains_error_translation: Joi.string().max(500).allow(""),
  not_contains_error: Joi.string().max(500),
  not_contains_error_translation: Joi.string().max(500).allow(""),
  min_error: Joi.string().max(500),
  min_error_translation: Joi.string().max(500).allow(""),
  max_error: Joi.string().max(500),
  max_error_translation: Joi.string().max(500).allow(""),
  integer_only_error: Joi.string().max(500),
  integer_only_error_translation: Joi.string().max(500).allow(""),
  min_date_error: Joi.string().max(500),
  min_date_error_translation: Joi.string().max(500).allow(""),
  max_date_error: Joi.string().max(500),
  max_date_error_translation: Joi.string().max(500).allow(""),
  must_match_option_error: Joi.string().max(500),
  must_match_option_error_translation: Joi.string().max(500).allow(""),
  min_selections_error: Joi.string().max(500),
  min_selections_error_translation: Joi.string().max(500).allow(""),
  max_selections_error: Joi.string().max(500),
  max_selections_error_translation: Joi.string().max(500).allow(""),
  min_images_error: Joi.string().max(500),
  min_images_error_translation: Joi.string().max(500).allow(""),
  max_images_error: Joi.string().max(500),
  max_images_error_translation: Joi.string().max(500).allow(""),
  region_code_error: Joi.string().max(500),
  region_code_error_translation: Joi.string().max(500).allow(""),
};

const questionValidationsSchema = Joi.object({
  required: Joi.boolean(),
  is_readonly: Joi.boolean(),
  is_autofill: Joi.boolean(),
  fill_from: Joi.string().allow(""),
  min_length: positiveInteger,
  max_length: positiveInteger,
  pattern: Joi.string(),
  contains: Joi.string(),
  not_contains: Joi.string(),
  min: Joi.number(),
  max: Joi.number(),
  integer_only: Joi.boolean(),
  min_date: Joi.string(),
  max_date: Joi.string(),
  must_match_option: Joi.boolean(),
  min_selections: positiveInteger,
  max_selections: positiveInteger,
  region_code: Joi.string().length(2).uppercase().allow("").default(""),
  ...validationErrorFields,
})
  .unknown(true)
  .default({ required: false });

/** Image slots on `image` questions — required only */
const imageValidationsSchema = Joi.object({
  required: Joi.boolean(),
  required_error: Joi.string().max(500),
  required_error_translation: Joi.string().max(500).allow(""),
})
  .unknown(true)
  .default({ required: false });

/** Image slots on `dynamic_images` questions */
const dynamicImageValidationsSchema = Joi.object({
  required: Joi.boolean(),
  min_images: positiveInteger,
  max_images: positiveInteger,
  required_error: Joi.string().max(500),
  required_error_translation: Joi.string().max(500).allow(""),
  min_images_error: Joi.string().max(500),
  min_images_error_translation: Joi.string().max(500).allow(""),
  max_images_error: Joi.string().max(500),
  max_images_error_translation: Joi.string().max(500).allow(""),
})
  .unknown(true)
  .default({ required: false });

const optionSchema = Joi.object({
  _id: objectId.optional(),
  label: Joi.string().required(),
  label_translation: Joi.string().allow("").default(""),
  value: Joi.string().required(),
  order: Joi.number().default(1),
});

const imageSchema = Joi.object({
  _id: objectId.optional(),
  key: Joi.string().required(),
  title: Joi.string().allow("").default(""),
  title_translation: Joi.string().allow("").default(""),
  image_validations: imageValidationsSchema,
  order: Joi.number().default(1),
});

const dynamicImageSchema = Joi.object({
  _id: objectId.optional(),
  key: Joi.string().required(),
  title: Joi.string().allow("").default(""),
  title_translation: Joi.string().allow("").default(""),
  dynamic_image_validations: dynamicImageValidationsSchema,
  order: Joi.number().default(1),
});

const questionSchema = Joi.object({
  _id: objectId.optional(),
  description: Joi.string().allow("").default(""),
  description_translation: Joi.string().allow("").default(""),
  placeholder_text: Joi.string().allow("").default(""),
  placeholder_text_translation: Joi.string().allow("").default(""),
  type: Joi.string()
    .valid(
      "radio",
      "checkbox",
      "dropdown",
      "text",
      "textarea",
      "number",
      "phone_number",
      "date",
      "image",
      "dynamic_images",
    )
    .required(),
  answer_key: Joi.string().required(),
  is_external_source: Joi.boolean().default(false),
  external_source: Joi.string().allow("").default(""),
  parent_question_ids: Joi.array().items(objectId).default([]),
  parent_option_ids: Joi.array().items(objectId).default([]),
  order: Joi.number().default(1),
  validations: questionValidationsSchema,
  options: Joi.array().items(optionSchema).default([]),
  images: Joi.array().items(imageSchema).default([]),
  dynamic_images: Joi.array().items(dynamicImageSchema).default([]),
})
  // Allow new scalar question fields without updating Joi for every addition.
  .unknown(true)
  .custom((value, helpers) => {
    if (
      value.is_external_source &&
      !String(value.external_source || "").trim()
    ) {
      return helpers.message(
        '"external_source" is required when is_external_source is true',
      );
    }
    return value;
  });

const popDataSchema = Joi.object({
  confirmation_text: Joi.string().trim().min(1).required(),
  confirmation_text_translation: Joi.string().allow("").default(""),
  confirm_button_text: Joi.string().trim().min(1).required(),
  confirm_button_text_translation: Joi.string().allow("").default(""),
  cancel_button_text: Joi.string().trim().min(1).required(),
  cancel_button_text_translation: Joi.string().allow("").default(""),
}).required();

const ENGLISH_LANGUAGE = "en";

const translationLanguageCodeSchema = Joi.string()
  .trim()
  .allow("")
  .default("")
  .custom((value, helpers) => {
    if (!value) return "";
    const code = toLanguageCode(value);
    if (!LANGUAGE_CODE.test(code)) {
      return helpers.message(
        '"translation.translation_language_code" must be a lowercase language code',
      );
    }
    return code;
  });

const translationConfigurationItemSchema = Joi.object({
  label: Joi.string().trim().min(1).required(),
  value: Joi.string().trim().lowercase().pattern(LANGUAGE_CODE).required(),
  emoji: Joi.string().allow("").default(""),
});

const translationSchema = Joi.object({
  requires_translation: Joi.boolean().default(false),
  translation_language_code: translationLanguageCodeSchema,
  translation_language: Joi.string().allow("").default(""),
  translation_language_title: Joi.string().allow("").optional(),
  default_language: Joi.string()
    .trim()
    .lowercase()
    .allow("")
    .default(ENGLISH_LANGUAGE),
  verify_button_translation: Joi.string().allow("").default(""),
  translation_support_to_overall_app: Joi.boolean().default(false),
  language_configuration: Joi.array()
    .items(translationConfigurationItemSchema)
    .default([]),
}).default({
  requires_translation: false,
  translation_language_code: "",
  translation_language: "",
  default_language: ENGLISH_LANGUAGE,
  verify_button_translation: "",
  translation_support_to_overall_app: false,
  language_configuration: [],
});

function withTranslationRules(schema) {
  return schema.custom((value, helpers) => {
    const translation = { ...(value.translation ?? {}) };
    const requires = Boolean(translation.requires_translation);
    const languageCode = toLanguageCode(
      translation.translation_language_code || "",
    );
    const language = String(
      translation.translation_language ||
        translation.translation_language_title ||
        "",
    ).trim();
    const defaultLang = String(translation.default_language || "")
      .trim()
      .toLowerCase();
    const verifyButton = String(
      translation.verify_button_translation || "",
    ).trim();

    if (requires) {
      if (!LANGUAGE_CODE.test(languageCode)) {
        return helpers.message(
          '"translation.translation_language_code" is required when translation is enabled',
        );
      }
      if (!language) {
        return helpers.message(
          '"translation.translation_language" is required when translation is enabled',
        );
      }
      if (!verifyButton) {
        return helpers.message(
          '"translation.verify_button_translation" is required when translation is enabled',
        );
      }
      const isEnglishDefault = !defaultLang || defaultLang === ENGLISH_LANGUAGE;
      const normalizedDefault = isEnglishDefault
        ? ENGLISH_LANGUAGE
        : toLanguageCode(defaultLang);
      if (!isEnglishDefault && normalizedDefault !== languageCode) {
        return helpers.message(
          '"translation.default_language" must be en or match translation_language_code',
        );
      }

      const supportOverallApp = Boolean(
        translation.translation_support_to_overall_app,
      );
      const configuration = Array.isArray(translation.language_configuration)
        ? translation.language_configuration
            .map((item) => ({
              label: String(item?.label || "").trim(),
              value: toLanguageCode(item?.value || ""),
              emoji: String(item?.emoji || "").trim(),
            }))
            .filter((item) => item.label && LANGUAGE_CODE.test(item.value))
        : [];

      if (supportOverallApp) {
        if (configuration.length < 2) {
          return helpers.message(
            '"translation.language_configuration" is required when overall app translation support is enabled',
          );
        }
        const hasEnglish = configuration.some(
          (item) => item.value === ENGLISH_LANGUAGE,
        );
        const hasSelected = configuration.some(
          (item) => item.value === languageCode,
        );
        if (!hasEnglish || !hasSelected) {
          return helpers.message(
            '"translation.language_configuration" must include English and the selected language',
          );
        }
      }

      translation.translation_language_code = languageCode;
      translation.translation_language = language;
      translation.default_language = isEnglishDefault
        ? ENGLISH_LANGUAGE
        : languageCode;
      translation.translation_support_to_overall_app = supportOverallApp;
      translation.language_configuration = supportOverallApp
        ? configuration
        : [];
      delete translation.translation_language_title;
      return { ...value, translation };
    }

    return value;
  });
}

const createFormSchema = withTranslationRules(
  Joi.object({
    tenant: Joi.string().required(),
    submission_type: Joi.string().when("form_type", {
      is: "submission",
      then: Joi.valid("FOUND", "NOT_FOUND").required(),
      otherwise: Joi.valid("").default(""),
    }),
    form_type: Joi.string()
      .valid("submission", "new_poi", "additional")
      .required(),
    translation: translationSchema,
    is_confirmation_popup: Joi.boolean().default(false),
    confirmation_popup: Joi.when("is_confirmation_popup", {
      is: true,
      then: popDataSchema,
      otherwise: Joi.valid(null).default(null),
    }),
    questions: Joi.when("is_confirmation_popup", {
      is: true,
      then: Joi.array().max(0).default([]),
      otherwise: Joi.array().items(questionSchema).min(1).required(),
    }),
  }),
);

const updateFormSchema = withTranslationRules(
  Joi.object({
    tenant: Joi.string(),
    submission_type: Joi.string().when("form_type", {
      is: "submission",
      then: Joi.valid("FOUND", "NOT_FOUND").optional(),
      otherwise: Joi.valid("").default(""),
    }),
    form_type: Joi.string().valid("submission", "new_poi", "additional"),
    translation: translationSchema,
    is_confirmation_popup: Joi.boolean(),
    confirmation_popup: Joi.when("is_confirmation_popup", {
      is: true,
      then: popDataSchema,
      otherwise: Joi.valid(null).optional(),
    }),
    questions: Joi.when("is_confirmation_popup", {
      is: true,
      then: Joi.array().max(0).default([]),
      otherwise: Joi.array().items(questionSchema).min(1),
    }),
  }),
);

module.exports = {
  createFormSchema,
  updateFormSchema,
};

/**
 * Single source of truth for simple question-level fields.
 *
 * To add a new scalar field (string/boolean/number):
 *  1. Add it here with a default value
 *  2. Add the input in QuestionEditor (if it needs UI)
 *
 * Load / create / save all pick from this registry automatically.
 * Structural fields (options, images, validations, parents, ids) stay special-cased.
 */

export const QUESTION_TYPES = [
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
];

export const EDITABLE_FLAG_TYPES = ["text", "textarea", "number", "date"];
export const OPTION_TYPES = ["radio", "checkbox", "dropdown"];
export const IMAGE_TYPES = ["image", "dynamic_images"];
export const PLACEHOLDER_TYPES = [
  "dropdown",
  "text",
  "textarea",
  "number",
  "phone_number",
];

/** Scalar fields persisted on each question */
export const QUESTION_SCALAR_FIELDS = {
  description: { default: "" },
  placeholder_text: { default: "" },
  type: { default: "text" },
  answer_key: { default: "" },
  is_external_source: { default: false },
  external_source: { default: "" },
};

const CLIENT_ONLY_KEYS = new Set([
  "is_independent",
  "_stashedDependencies",
  "_original",
  "_resetVersion",
]);

export function getQuestionScalarDefaults() {
  const defaults = {};
  for (const [key, config] of Object.entries(QUESTION_SCALAR_FIELDS)) {
    defaults[key] = config.default;
  }
  return defaults;
}

/** Normalize scalar fields from API/load into consistent client values */
export function applyQuestionScalars(source = {}) {
  const out = {};
  for (const [key, config] of Object.entries(QUESTION_SCALAR_FIELDS)) {
    const value = source[key];
    if (typeof config.default === "boolean") {
      out[key] = value === undefined ? config.default : Boolean(value);
    } else if (typeof config.default === "number") {
      out[key] =
        value === undefined || value === null || value === ""
          ? config.default
          : Number(value);
    } else {
      out[key] = value == null ? config.default : String(value);
    }
  }
  return out;
}

/**
 * Copy scalar fields for API save.
 * Also forwards any extra unknown scalar keys (future-proof) except
 * structural / client-only keys.
 */
export function pickQuestionScalarsForSave(source = {}) {
  const out = applyQuestionScalars(source);

  const reserved = new Set([
    ...Object.keys(QUESTION_SCALAR_FIELDS),
    ...CLIENT_ONLY_KEYS,
    "_id",
    "order",
    "validations",
    "options",
    "images",
    "dynamic_images",
    "parent_question_ids",
    "parent_option_ids",
    "createdAt",
    "updatedAt",
    "__v",
  ]);

  for (const [key, value] of Object.entries(source)) {
    if (reserved.has(key)) continue;
    if (value !== undefined) out[key] = value;
  }

  // External source clears type-specific content; keep scalar consistent
  if (!out.is_external_source) {
    out.external_source = "";
  } else {
    out.external_source = String(out.external_source || "").trim();
  }

  return out;
}

export function supportsEditableFlag(type) {
  return EDITABLE_FLAG_TYPES.includes(type);
}

export function isImageQuestionType(type) {
  return IMAGE_TYPES.includes(type);
}

export function isOptionQuestionType(type) {
  return OPTION_TYPES.includes(type);
}

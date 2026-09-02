/** Shared validation helpers for questions and image slots */

export const defaultValidations = () => ({ required: false });

export const defaultImageValidation = () => ({ required: false });

export const IMAGE_VALIDATIONS_KEY = 'image_validations';
export const DYNAMIC_IMAGE_VALIDATIONS_KEY = 'dynamic_image_validations';

export function getImageValidationsFieldName(dynamic = false) {
  return dynamic ? DYNAMIC_IMAGE_VALIDATIONS_KEY : IMAGE_VALIDATIONS_KEY;
}

export function errorKeyForRule(ruleKey) {
  return `${ruleKey}_error`;
}

const LEGACY_MESSAGE_CONTAINER_KEYS = ['error_messages', 'messages'];

const LEGACY_IMAGE_VALIDATION_KEYS = [
  'image_validation',
  'validations',
  IMAGE_VALIDATIONS_KEY,
  DYNAMIC_IMAGE_VALIDATIONS_KEY,
];

function migrateLegacyMessageFields(out) {
  for (const containerKey of LEGACY_MESSAGE_CONTAINER_KEYS) {
    const legacy = out[containerKey];
    if (!legacy || typeof legacy !== 'object') continue;

    for (const [ruleKey, value] of Object.entries(legacy)) {
      const errorKey = errorKeyForRule(ruleKey);
      if (value && !out[errorKey]) out[errorKey] = value;
    }
    delete out[containerKey];
  }

  for (const key of Object.keys(out)) {
    if (!key.endsWith('_message')) continue;
    const ruleKey = key.slice(0, -'_message'.length);
    const errorKey = errorKeyForRule(ruleKey);
    if (!out[errorKey]) out[errorKey] = out[key];
    delete out[key];
  }

  return out;
}

/** Migrate legacy nested messages → flat `{rule}_error` fields */
export function migrateValidationsOnLoad(validations = {}) {
  return migrateLegacyMessageFields({ ...(validations || {}) });
}

const POSITIVE_VALIDATION_KEYS = [
  'min_length',
  'max_length',
  'min_selections',
  'max_selections',
  'min_images',
  'max_images',
];

/** Trim custom `{rule}_error` fields before persisting */
export function normalizeValidationsForSave(validations = {}) {
  const out = migrateValidationsOnLoad(validations);

  for (const key of POSITIVE_VALIDATION_KEYS) {
    if (out[key] != null && Number(out[key]) < 1) delete out[key];
  }

  for (const key of Object.keys(out)) {
    if (!key.endsWith('_error')) continue;
    const trimmed = String(out[key] ?? '').trim();
    if (trimmed) out[key] = trimmed;
    else delete out[key];
  }

  for (const key of Object.keys(out)) {
    if (key.endsWith('_message')) delete out[key];
  }

  for (const containerKey of LEGACY_MESSAGE_CONTAINER_KEYS) {
    delete out[containerKey];
  }

  return out;
}

/** Image slot on `image` questions — required only */
export function normalizeImageValidationForSave(imageValidation = {}) {
  const out = normalizeValidationsForSave(imageValidation);

  delete out.min_images;
  delete out.max_images;
  delete out.min_images_error;
  delete out.max_images_error;
  delete out.min_images_message;
  delete out.max_images_message;

  if (out.required == null) out.required = false;

  return out;
}

/** Image slot on `dynamic_images` questions */
export function normalizeDynamicImageValidationForSave(imageValidation = {}) {
  const out = normalizeValidationsForSave(imageValidation);
  if (out.required == null) out.required = false;

  if (out.min_images != null && out.min_images < 1) delete out.min_images;
  if (out.max_images != null && out.max_images < 1) delete out.max_images;

  return out;
}

function readLegacyImageValidations(img = {}, dynamic = false) {
  const primaryKey = getImageValidationsFieldName(dynamic);

  for (const key of [
    primaryKey,
    'image_validation',
    'validations',
    dynamic ? IMAGE_VALIDATIONS_KEY : DYNAMIC_IMAGE_VALIDATIONS_KEY,
  ]) {
    if (img[key] != null) return img[key];
  }

  return defaultImageValidation();
}

/** Migrate legacy image slot shape → `image_validations` / `dynamic_image_validations` */
export function migrateImageOnLoad(img = {}, { dynamic = false } = {}) {
  const out = { ...img };
  const validationKey = getImageValidationsFieldName(dynamic);

  let validations = migrateValidationsOnLoad(readLegacyImageValidations(out, dynamic));

  if (out.required !== undefined || out.required_message || out.required_error) {
    const requiredError = out.required_error || out.required_message;
    validations = {
      ...validations,
      required: Boolean(out.required ?? validations.required),
      ...(requiredError && !validations.required_error
        ? { required_error: requiredError }
        : {}),
    };
  }

  out[validationKey] = validations;

  for (const legacyKey of LEGACY_IMAGE_VALIDATION_KEYS) {
    delete out[legacyKey];
  }
  delete out.required;
  delete out.required_message;
  delete out.required_error;

  return out;
}

export function getImageValidationsFromSlot(img = {}, { dynamic = false } = {}) {
  const validationKey = getImageValidationsFieldName(dynamic);
  return img[validationKey] || readLegacyImageValidations(img, dynamic);
}

export function normalizeImageForSave(img, { dynamic = false } = {}) {
  const validationKey = getImageValidationsFieldName(dynamic);
  const normalizeValidation = dynamic
    ? normalizeDynamicImageValidationForSave
    : normalizeImageValidationForSave;

  return {
    _id: img._id,
    key: img.key,
    title: img.title || '',
    order: img.order,
    [validationKey]: normalizeValidation(
      getImageValidationsFromSlot(img, { dynamic }),
    ),
  };
}

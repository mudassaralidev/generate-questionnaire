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

export const EMPTY_POP_DATA = {
  confirmation_text: "",
  confirm_button_text: "",
  cancel_button_text: "",
};

export function requiresSubmissionType(formType) {
  return formType === SUBMISSION_FORM_TYPE;
}

export function normalizePopData(popData) {
  return {
    confirmation_text: popData?.confirmation_text ?? "",
    confirm_button_text: popData?.confirm_button_text ?? "",
    cancel_button_text: popData?.cancel_button_text ?? "",
  };
}

export function normalizeMetaForStorage(meta = {}) {
  const out = {
    tenant: meta.tenant,
    form_type: meta.form_type,
    submission_type: requiresSubmissionType(meta.form_type)
      ? meta.submission_type
      : "",
  };
  return out;
}

export function buildConfigPayloadForSave(
  meta,
  questions,
  { is_confirmation_popup = false, confirmation_popup = null } = {},
) {
  const isPopup = Boolean(is_confirmation_popup);
  return {
    ...normalizeMetaForStorage(meta),
    is_confirmation_popup: isPopup,
    confirmation_popup: isPopup ? normalizePopData(confirmation_popup) : null,
    questions: isPopup ? [] : questions,
  };
}

const SUBMISSION_TYPE_VALUES = SUBMISSION_TYPES.map((item) => item.value);

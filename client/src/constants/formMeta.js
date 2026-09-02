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

export function requiresSubmissionType(formType) {
  return formType === SUBMISSION_FORM_TYPE;
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

export function buildConfigPayloadForSave(meta, questions) {
  return {
    ...normalizeMetaForStorage(meta),
    questions,
  };
}

const SUBMISSION_TYPE_VALUES = SUBMISSION_TYPES.map((item) => item.value);

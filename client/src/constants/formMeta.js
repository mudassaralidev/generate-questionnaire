export const SUBMISSION_TYPES = [
  { value: "FOUND", label: "Found" },
  { value: "NOT_FOUND", label: "Not Found" },
];

export const FORM_TYPES = [
  { value: "submission", label: "Submission" },
  { value: "new_poi", label: "New POI" },
  { value: "additional", label: "Additional" },
];

export const SUBMISSION_TYPE_VALUES = SUBMISSION_TYPES.map((item) => item.value);
export const FORM_TYPE_VALUES = FORM_TYPES.map((item) => item.value);

/** Map legacy config meta (questions_type + old form_type) → new shape */
export function normalizeFormMeta(meta = {}) {
  const out = { ...meta };

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
  return out;
}

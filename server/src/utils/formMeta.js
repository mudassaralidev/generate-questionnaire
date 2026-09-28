const SUBMISSION_TYPE_VALUES = ["FOUND", "NOT_FOUND"];
const SUBMISSION_FORM_TYPE = "submission";

function requiresSubmissionType(formType) {
  return formType === SUBMISSION_FORM_TYPE;
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
  return out;
}

module.exports = {
  normalizeConfigMeta,
  stripLegacyMetaFields,
  requiresSubmissionType,
};

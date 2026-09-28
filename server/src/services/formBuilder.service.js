const TenantConfiguration = require("../models/TenantConfiguration");
const ApiError = require("../utils/ApiError");
const {
  validateFormIntegrity,
} = require("../validations/formIntegrity.validator");
const {
  normalizeConfigMeta,
  stripLegacyMetaFields,
  requiresSubmissionType,
} = require("../utils/formMeta");

const list = async ({ tenant, submission_type, form_type } = {}) => {
  const filter = { type: "form_questions" };
  if (tenant) filter.tenant = tenant;
  if (submission_type) filter.submission_type = submission_type;
  if (form_type) filter.form_type = form_type;
  const docs = await TenantConfiguration.find(filter).lean();
  return docs.map(normalizeConfigMeta);
};

const getById = async (id) => {
  const doc = await TenantConfiguration.findById(id).lean();
  if (!doc) throw new ApiError(404, "Form configuration not found");
  return normalizeConfigMeta(doc);
};

const resolve = async ({ tenant, submission_type, form_type }) => {
  const type = "form_questions";
  const filter = { tenant, form_type, type };

  if (requiresSubmissionType(form_type)) {
    filter.submission_type = submission_type;
  } else {
    filter.submission_type = "";
  }

  let doc = await TenantConfiguration.findOne(filter).lean();

  const stub = {
    tenant,
    form_type,
    submission_type: requiresSubmissionType(form_type) ? submission_type : "",
    is_confirmation_popup: false,
    confirmation_popup: null,
    questions: [],
  };

  return {
    mode: doc ? "edit" : "create",
    config: normalizeConfigMeta(doc || stub),
  };
};

const create = async (data) => {
  const isConfirmationPopup = Boolean(data.is_confirmation_popup);
  const questions = isConfirmationPopup ? [] : data.questions || [];
  const confirmation_popup = isConfirmationPopup
    ? data.confirmation_popup
    : null;

  const integrityErrors = validateFormIntegrity(questions, {
    is_confirmation_popup: isConfirmationPopup,
    confirmation_popup,
  });
  if (integrityErrors.length)
    throw new ApiError(
      422,
      "Form integrity validation failed",
      integrityErrors,
    );

  const doc = await TenantConfiguration.create({
    ...stripLegacyMetaFields(data),
    type: "form_questions",
    is_confirmation_popup: isConfirmationPopup,
    confirmation_popup,
    questions,
  });
  return normalizeConfigMeta(doc.toObject());
};

const update = async (id, data) => {
  const existing = await TenantConfiguration.findById(id);
  if (!existing) throw new ApiError(404, "Form configuration not found");

  const isConfirmationPopup =
    data.is_confirmation_popup !== undefined
      ? Boolean(data.is_confirmation_popup)
      : Boolean(existing.is_confirmation_popup);

  const questions = isConfirmationPopup
    ? []
    : data.questions !== undefined
      ? data.questions
      : existing.questions || [];

  const confirmation_popup = isConfirmationPopup
    ? data.confirmation_popup !== undefined
      ? data.confirmation_popup
      : existing.confirmation_popup
    : null;

  const integrityErrors = validateFormIntegrity(questions, {
    is_confirmation_popup: isConfirmationPopup,
    confirmation_popup,
  });
  if (integrityErrors.length)
    throw new ApiError(
      422,
      "Form integrity validation failed",
      integrityErrors,
    );

  Object.assign(existing, stripLegacyMetaFields(data), {
    is_confirmation_popup: isConfirmationPopup,
    confirmation_popup,
    questions,
  });
  await existing.save();
  return normalizeConfigMeta(existing.toObject());
};

const remove = async (id) => {
  const doc = await TenantConfiguration.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, "Form configuration not found");
};

module.exports = { list, getById, resolve, create, update, remove };

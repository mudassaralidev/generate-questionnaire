import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchableSelect from "../common/SearchableSelect";
import Spinner from "../common/Spinner";
import ErrorAlert from "../common/ErrorAlert";
import { useTenants } from "../../hooks/useTenants";
import { useBuilder } from "../../context/BuilderContext";
import { resolveFormConfig } from "../../api/formBuilder.api";
import {
  FORM_TYPES,
  SUBMISSION_TYPES,
  ENGLISH_LANGUAGE,
  normalizeTranslationMeta,
  requiresSubmissionType,
} from "../../constants/formMeta";

export default function StepOneLoader() {
  const navigate = useNavigate();
  const { loadConfig } = useBuilder();
  const {
    tenants = [],
    loading: tenantsLoading,
    error,
    setError,
  } = useTenants();

  const [form, setForm] = useState({
    tenant: "",
    submission_type: "",
    form_type: "",
    requires_translation: false,
    translation_language: "",
    default_language: ENGLISH_LANGUAGE,
  });
  const [loading, setLoading] = useState(false);

  const tenantOptions = tenants.map((t) => ({ value: t, label: t }));
  const showSubmissionType = requiresSubmissionType(form.form_type);

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleFormTypeChange = (e) => {
    const form_type = e.target.value;
    setForm((f) => ({
      ...f,
      form_type,
      submission_type: requiresSubmissionType(form_type)
        ? f.submission_type
        : "",
    }));
  };

  const handleLoad = async (isConfirmationPopup) => {
    const missingSubmissionType = showSubmissionType && !form.submission_type;

    if (!form.tenant || !form.form_type || missingSubmissionType) {
      setError({ message: "Please fill all fields before loading." });
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const params = {
        tenant: form.tenant,
        form_type: form.form_type,
      };

      if (showSubmissionType) {
        params.submission_type = form.submission_type;
      }

      const res = await resolveFormConfig(params);

      let translation = normalizeTranslationMeta({
        requires_translation: form.requires_translation,
        translation_language: form.translation_language,
        default_language: form.default_language,
      });

      // On edit, keep stored translation settings if setup left translation off
      if (
        res.mode === "edit" &&
        !form.requires_translation &&
        res.config?.requires_translation
      ) {
        translation = normalizeTranslationMeta(res.config);
      }

      loadConfig(res.config, res.mode, {
        is_confirmation_popup: isConfirmationPopup,
        ...translation,
      });
      navigate("/builder");
    } catch (err) {
      setError({ message: err.message, errors: err.errors });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-6">
      <div className="card w-full max-w-lg p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
          <p className="mt-1 text-sm text-gray-500">
            Please select the following require fields in order to CREATE/UPDATE
            the tenant&apos;s questionnaire
          </p>
        </div>

        <div className="space-y-4">
          {tenantsLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : (
            <SearchableSelect
              label="Tenant"
              value={form.tenant}
              onChange={handleChange("tenant")}
              options={tenantOptions}
              placeholder="Search tenant..."
            />
          )}

          <SearchableSelect
            label="Form Type"
            value={form.form_type}
            onChange={handleFormTypeChange}
            options={FORM_TYPES}
            placeholder="Search form type..."
          />

          {showSubmissionType && (
            <SearchableSelect
              label="Submission Type"
              value={form.submission_type}
              onChange={handleChange("submission_type")}
              options={SUBMISSION_TYPES}
              placeholder="Search submission type..."
            />
          )}

          {error && (
            <ErrorAlert message={error.message} errors={error.errors} />
          )}

          <div className="pt-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              What do you want to create?
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleLoad(false)}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? <Spinner size="sm" /> : null}
                Create Questions
              </button>
              <button
                type="button"
                onClick={() => handleLoad(true)}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary-600 bg-white px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Spinner size="sm" /> : null}
                Create Confirmation Pop Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

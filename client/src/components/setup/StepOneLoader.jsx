import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "../common/Select";
import Spinner from "../common/Spinner";
import ErrorAlert from "../common/ErrorAlert";
import { useTenants } from "../../hooks/useTenants";
import { useBuilder } from "../../context/BuilderContext";
import { resolveFormConfig } from "../../api/formBuilder.api";
import { FORM_TYPES, SUBMISSION_TYPES } from "../../constants/formMeta";

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
  });
  const [loading, setLoading] = useState(false);

  const tenantOptions = tenants.map((t) => ({ value: t, label: t }));

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleLoad = async () => {
    if (!form.tenant || !form.submission_type || !form.form_type) {
      setError({ message: "Please fill all fields before loading." });
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await resolveFormConfig(form);
      loadConfig(res.config, res.mode);
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
            the tenant's questionnaire
          </p>
        </div>

        <div className="space-y-4">
          {tenantsLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : (
            <Select
              label="Tenant"
              value={form.tenant}
              onChange={handleChange("tenant")}
              options={tenantOptions}
              placeholder="Select a tenant..."
            />
          )}

          <Select
            label="Submission Type"
            value={form.submission_type}
            onChange={handleChange("submission_type")}
            options={SUBMISSION_TYPES}
            placeholder="Select submission type..."
          />

          <Select
            label="Form Type"
            value={form.form_type}
            onChange={handleChange("form_type")}
            options={FORM_TYPES}
            placeholder="Select form type..."
          />

          {error && (
            <ErrorAlert message={error.message} errors={error.errors} />
          )}

          <button
            onClick={handleLoad}
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? <Spinner size="sm" /> : null}
            {loading ? "Loading..." : "Load Form Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}

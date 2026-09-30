import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBuilder } from "../context/BuilderContext";
import { requiresSubmissionType } from "../constants/formMeta";

function getAvailability(mode, config) {
  const exists = mode === "edit" && Boolean(config?._id);
  if (!exists) {
    return {
      hasExistingConfig: false,
      hasQuestions: false,
      hasPopup: false,
      canCreateQuestions: true,
      canCreatePopup: true,
    };
  }

  const hasPopup = Boolean(config.is_confirmation_popup);
  const hasQuestions = !hasPopup;

  return {
    hasExistingConfig: true,
    hasQuestions,
    hasPopup,
    canCreateQuestions: hasQuestions,
    canCreatePopup: hasPopup,
  };
}

export default function ModeSelectionPage() {
  const navigate = useNavigate();
  const { setupDraft, loadConfig, clearSetupDraft } = useBuilder();

  useEffect(() => {
    if (!setupDraft?.config) {
      navigate("/", { replace: true });
    }
  }, [setupDraft, navigate]);

  if (!setupDraft?.config) return null;

  const { mode, config, translation, form } = setupDraft;
  const availability = getAvailability(mode, config);

  const metaLabel = [
    form?.tenant || config.tenant,
    requiresSubmissionType(form?.form_type || config.form_type) &&
      (form?.submission_type || config.submission_type),
    form?.form_type || config.form_type,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleSelect = (isConfirmationPopup) => {
    if (isConfirmationPopup && !availability.canCreatePopup) return;
    if (!isConfirmationPopup && !availability.canCreateQuestions) return;

    loadConfig(config, mode, {
      is_confirmation_popup: isConfirmationPopup,
      translation,
    });
    clearSetupDraft();
    navigate("/builder");
  };

  const handleBack = () => {
    clearSetupDraft();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-6">
      <div className="card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Choose what to create</h1>
          <p className="mt-2 text-sm text-gray-500">{metaLabel}</p>
          <p className="mt-1 text-xs text-gray-400">
            {mode === "edit" ? "Existing configuration found" : "No configuration yet"}
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-4">
          <button
            type="button"
            onClick={() => handleSelect(false)}
            disabled={!availability.canCreateQuestions}
            className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create Questions
          </button>

          <button
            type="button"
            onClick={() => handleSelect(true)}
            disabled={!availability.canCreatePopup}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary-600 bg-white px-4 py-3 text-sm font-medium text-primary-700 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          >
            Create Confirmation Pop Up
          </button>
        </div>

        {availability.hasQuestions && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Questions already exist for the selected tenant. Confirmation pop up
            creation is disabled. If you need to create a confirmation pop up,
            delete the existing questionnaire first.
          </div>
        )}

        {availability.hasPopup && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Confirmation pop up data already exists for the selected tenant.
            Question creation is disabled. If you need to create questions,
            delete the existing confirmation pop up first.
          </div>
        )}

        {!availability.hasExistingConfig && (
          <p className="mt-5 text-center text-xs text-gray-500">
            No existing data found. You can create either questions or a
            confirmation pop up.
          </p>
        )}

        <button
          type="button"
          onClick={handleBack}
          className="btn-ghost mt-6 w-full text-sm"
        >
          Back
        </button>
      </div>
    </div>
  );
}

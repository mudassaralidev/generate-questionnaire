import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBuilder } from "../../context/BuilderContext";
import { useFormBuilder } from "../../hooks/useFormConfig";
import { validateFormIntegrity } from "../../utils/validation";
import { cleanQuestionsForSave } from "../../utils/helpers";
import { requiresSubmissionType, buildConfigPayloadForSave } from "../../constants/formMeta";
import ErrorAlert from "../common/ErrorAlert";
import Spinner from "../common/Spinner";
import FormFlowModal from "./FormFlowModal";
import DeleteQuestionnaireModal from "./DeleteQuestionnaireModal";

export default function BuilderHeader() {
  const navigate = useNavigate();
  const { meta, configId, mode, questions, reset } = useBuilder();
  const { createConfig, editConfig, removeConfig, loading: saving, deleting } =
    useFormBuilder();
  const [errors, setErrors] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canDelete = mode === "edit" && Boolean(configId);

  const handleSaveClick = () => {
    if (!questions.length) {
      setErrors([
        "At least one question is required. Empty form configurations cannot be saved.",
      ]);
      setErrorMessage("Please fix the following errors before saving:");
      setShowErrors(true);
      return;
    }

    const integrityErrors = validateFormIntegrity(questions);
    if (integrityErrors.length) {
      setErrors(integrityErrors);
      setErrorMessage("Please fix the following errors before saving:");
      setShowErrors(true);
      return;
    }

    setErrors([]);
    setShowErrors(false);
    setShowFlowModal(true);
  };

  const handleConfirmSave = async () => {
    const integrityErrors = validateFormIntegrity(questions);
    if (integrityErrors.length) {
      setErrors(integrityErrors);
      setErrorMessage("Please fix the following errors before saving:");
      setShowErrors(true);
      setShowFlowModal(false);
      return;
    }

    const payload = buildConfigPayloadForSave(
      meta,
      cleanQuestionsForSave(questions),
    );

    try {
      if (mode === "edit" && configId) {
        await editConfig(configId, payload);
      } else {
        await createConfig(payload);
      }
      setShowFlowModal(false);
      alert("Saved successfully!");
    } catch (err) {
      setShowFlowModal(false);
      setErrors(err.errors?.length ? err.errors : [err.message]);
      setErrorMessage("Unable to save the questionnaire:");
      setShowErrors(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!configId) return;

    try {
      await removeConfig(configId);
      setShowDeleteModal(false);
      reset();
      navigate("/");
    } catch (err) {
      setShowDeleteModal(false);
      setErrors(err.errors?.length ? err.errors : [err.message]);
      setErrorMessage("Unable to delete the questionnaire:");
      setShowErrors(true);
    }
  };

  return (
    <>
      <header className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                reset();
                navigate("/");
              }}
              className="btn-ghost px-2 py-1.5 text-xs"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>

            <div className="h-5 w-px bg-gray-200" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">
                  Form Builder
                </span>
                <span
                  className={`badge text-xs ${
                    mode === "edit"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {mode === "edit" ? "Edit Mode" : "Create Mode"}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {[meta.tenant, requiresSubmissionType(meta.form_type) && meta.submission_type, meta.form_type]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {questions.length} questions
            </span>

            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={saving || deleting}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            )}

            <button
              onClick={handleSaveClick}
              disabled={saving || deleting}
              className="btn-primary"
            >
              {saving ? (
                <Spinner size="sm" />
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
              )}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {showErrors && errors.length > 0 && (
          <div className="mt-3">
            <ErrorAlert
              message={errorMessage || "Please fix the following errors:"}
              errors={errors}
            />
            <button
              onClick={() => setShowErrors(false)}
              className="mt-1 text-xs text-gray-400 hover:text-gray-600"
            >
              Dismiss
            </button>
          </div>
        )}
      </header>

      <FormFlowModal
        open={showFlowModal}
        questions={questions}
        saving={saving}
        onCancel={() => setShowFlowModal(false)}
        onConfirm={handleConfirmSave}
      />

      <DeleteQuestionnaireModal
        open={showDeleteModal}
        meta={meta}
        questionCount={questions.length}
        deleting={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

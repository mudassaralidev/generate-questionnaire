import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBuilder } from "../../context/BuilderContext";
import { useFormBuilder } from "../../hooks/useFormConfig";
import { validateFormIntegrity } from "../../utils/validation";
import { cleanQuestionsForSave } from "../../utils/helpers";
import {
  ENGLISH_LANGUAGE,
  requiresSubmissionType,
  buildConfigPayloadForSave,
} from "../../constants/formMeta";
import ErrorAlert from "../common/ErrorAlert";
import Spinner from "../common/Spinner";
import FormFlowModal from "./FormFlowModal";
import DeleteQuestionnaireModal from "./DeleteQuestionnaireModal";
import TranslationSettingsModal from "./TranslationSettingsModal";

export default function BuilderHeader() {
  const navigate = useNavigate();
  const {
    meta,
    configId,
    mode,
    questions,
    is_confirmation_popup,
    confirmation_popup,
    translation,
    reset,
    commitSavedSnapshots,
    updateTranslationMeta,
    disableTranslation,
  } = useBuilder();
  const {
    createConfig,
    editConfig,
    removeConfig,
    loading: saving,
    deleting,
  } = useFormBuilder();
  const [errors, setErrors] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);

  const canDelete = mode === "edit" && Boolean(configId);
  const requires_translation = Boolean(translation?.requires_translation);
  const translation_language = translation?.translation_language || "";
  const default_language = translation?.default_language || ENGLISH_LANGUAGE;

  const runSave = async () => {
    const payload = buildConfigPayloadForSave(
      meta,
      is_confirmation_popup
        ? []
        : cleanQuestionsForSave(questions, {
            requiresTranslation: requires_translation,
          }),
      {
        is_confirmation_popup,
        confirmation_popup,
        translation,
      },
    );

    try {
      if (mode === "edit" && configId) {
        await editConfig(configId, payload);
        commitSavedSnapshots();
      } else {
        const result = await createConfig(payload);
        const savedId = result?.data?._id || result?._id;
        commitSavedSnapshots({
          mode: "edit",
          ...(savedId ? { configId: savedId } : {}),
        });
      }
      setShowFlowModal(false);
      alert("Saved successfully!");
    } catch (err) {
      setShowFlowModal(false);
      setErrors(err.errors?.length ? err.errors : [err.message]);
      setErrorMessage(
        is_confirmation_popup
          ? "Unable to save the confirmation pop up:"
          : "Unable to save the questionnaire:",
      );
      setShowErrors(true);
    }
  };

  const handleSaveClick = () => {
    const integrityErrors = validateFormIntegrity(questions, {
      is_confirmation_popup,
      confirmation_popup,
    });

    if (integrityErrors.length) {
      setErrors(integrityErrors);
      setErrorMessage("Please fix the following errors before saving:");
      setShowErrors(true);
      return;
    }

    if (requires_translation && !String(translation_language || "").trim()) {
      setErrors([
        "Translation language is required when translation is enabled.",
      ]);
      setErrorMessage("Please fix the following errors before saving:");
      setShowErrors(true);
      return;
    }

    if (
      requires_translation &&
      !String(translation?.verify_button_translation || "").trim()
    ) {
      setErrors([
        "Verify button translation is required when translation is enabled.",
      ]);
      setErrorMessage("Please fix the following errors before saving:");
      setShowErrors(true);
      return;
    }

    setErrors([]);
    setShowErrors(false);

    if (is_confirmation_popup) {
      runSave();
      return;
    }

    setShowFlowModal(true);
  };

  const handleConfirmSave = async () => {
    const integrityErrors = validateFormIntegrity(questions, {
      is_confirmation_popup: false,
    });
    if (integrityErrors.length) {
      setErrors(integrityErrors);
      setErrorMessage("Please fix the following errors before saving:");
      setShowErrors(true);
      setShowFlowModal(false);
      return;
    }

    await runSave();
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
      setErrorMessage(
        is_confirmation_popup
          ? "Unable to delete the confirmation pop up:"
          : "Unable to delete the questionnaire:",
      );
      setShowErrors(true);
    }
  };

  const handleTranslationToggle = (e) => {
    const enabled = e.target.checked;
    if (enabled) {
      setShowTranslationModal(true);
      return;
    }
    disableTranslation();
  };

  return (
    <>
      <header className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
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

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
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
                {is_confirmation_popup && (
                  <span className="badge bg-violet-100 text-violet-700 text-xs">
                    Confirmation Pop Up
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 truncate">
                {[
                  meta.tenant,
                  requiresSubmissionType(meta.form_type) &&
                    meta.submission_type,
                  meta.form_type,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requires_translation}
                  onChange={handleTranslationToggle}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-xs font-medium text-gray-700">
                  Translation
                </span>
              </label>
              <div className="h-4 w-px bg-gray-200" />
              <div className="text-xs text-gray-500 leading-tight">
                <div>
                  Lang:{" "}
                  <span className="font-medium text-gray-700">
                    {requires_translation ? translation_language || "—" : "—"}
                  </span>
                </div>
                <div>
                  Default:{" "}
                  <span className="font-medium text-gray-700">
                    {requires_translation ? default_language : ENGLISH_LANGUAGE}
                  </span>
                </div>
              </div>
              {requires_translation && (
                <button
                  type="button"
                  onClick={() => setShowTranslationModal(true)}
                  className="text-xs text-primary-600 hover:text-primary-800"
                >
                  Edit
                </button>
              )}
            </div>

            <span className="text-xs text-gray-400">
              {is_confirmation_popup
                ? "Confirmation pop up"
                : `${questions.length} questions`}
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

      <TranslationSettingsModal
        open={showTranslationModal}
        initialValues={{
          translation_language,
          default_language,
          verify_button_translation:
            translation?.verify_button_translation || "",
        }}
        onCancel={() => setShowTranslationModal(false)}
        onConfirm={(next) => {
          updateTranslationMeta(next);
          setShowTranslationModal(false);
        }}
      />

      {!is_confirmation_popup && (
        <FormFlowModal
          open={showFlowModal}
          questions={questions}
          saving={saving}
          onCancel={() => setShowFlowModal(false)}
          onConfirm={handleConfirmSave}
        />
      )}

      <DeleteQuestionnaireModal
        open={showDeleteModal}
        meta={meta}
        questionCount={questions.length}
        isConfirmationPopup={is_confirmation_popup}
        deleting={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

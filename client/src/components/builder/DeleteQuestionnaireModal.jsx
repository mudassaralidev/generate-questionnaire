import { useEffect, useState } from "react";
import Spinner from "../common/Spinner";
import { requiresSubmissionType } from "../../constants/formMeta";

export default function DeleteQuestionnaireModal({
  open,
  meta,
  questionCount,
  deleting,
  onCancel,
  onConfirm,
}) {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!open) setConfirmed(false);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const metaLabel = [
    meta?.tenant,
    requiresSubmissionType(meta?.form_type) && meta?.submission_type,
    meta?.form_type,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close delete confirmation"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        onClick={deleting ? undefined : onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-questionnaire-title"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-red-200 bg-white shadow-2xl shadow-slate-900/20"
      >
        <header className="border-b border-red-100 bg-red-50 px-5 py-4 sm:px-6">
          <h2
            id="delete-questionnaire-title"
            className="text-base font-semibold text-red-900 sm:text-lg"
          >
            Delete Questionnaire
          </h2>
          <p className="mt-1 text-sm text-red-700">
            This action cannot be undone.
          </p>
        </header>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-sm font-medium text-gray-900">{metaLabel}</p>
            <p className="mt-1 text-xs text-gray-500">
              {questionCount} question{questionCount === 1 ? "" : "s"} will be
              permanently removed.
            </p>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-3 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={deleting}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">
              I understand this will permanently delete this questionnaire and
              all of its questions.
            </span>
          </label>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-gray-200 bg-white px-5 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!confirmed || deleting}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Spinner size="sm" />
                Deleting...
              </>
            ) : (
              "Delete Questionnaire"
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import Spinner from "../common/Spinner";
import FormFlowPreview from "./FormFlowPreview";

function LegendItem({ colorClass, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-sm ${colorClass}`} />
      <span className="text-xs text-slate-600">{label}</span>
    </div>
  );
}

function IconButton({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn-ghost px-2 py-1.5 text-slate-500"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

export default function FormFlowModal({
  open,
  questions,
  saving,
  onCancel,
  onConfirm,
}) {
  const [expanded, setExpanded] = useState(false);
  const [graphStats, setGraphStats] = useState({ nodeCount: 0, edgeCount: 0 });

  useEffect(() => {
    if (!open) setExpanded(false);
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

  const shellClass = expanded
    ? "fixed inset-0 z-50 flex flex-col overflow-hidden bg-white"
    : "relative z-10 flex h-[min(92vh,860px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20";

  return (
    <div
      className={
        expanded
          ? "fixed inset-0 z-50"
          : "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      }
    >
      {!expanded && (
        <button
          type="button"
          aria-label="Close form flow preview"
          className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
          onClick={saving ? undefined : onCancel}
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-flow-title"
        className={shellClass}
      >
        <header className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id="form-flow-title"
              className="text-base font-semibold text-slate-900 sm:text-lg"
            >
              Form Flow Preview
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Top-down org chart — review question dependencies and option branches before saving.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {questions.length} question{questions.length === 1 ? "" : "s"} ·{" "}
              {graphStats.nodeCount} nodes · {graphStats.edgeCount} connections
            </p>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1">
            <IconButton
              label={expanded ? "Exit full screen" : "Expand to full screen"}
              onClick={() => setExpanded((value) => !value)}
              disabled={saving}
            >
              {expanded ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                  />
                </svg>
              )}
            </IconButton>

            <IconButton label="Close" onClick={onCancel} disabled={saving}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </IconButton>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 bg-slate-50">
          <FormFlowPreview questions={questions} onStatsChange={setGraphStats} />

          {questions.length > 8 && !expanded && (
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-3 py-1.5 text-xs text-slate-600 shadow-md ring-1 ring-slate-200">
              Large form — expand to full screen, then pan and zoom to review all branches
            </div>
          )}
        </div>

        <footer className="flex flex-shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-4">
            <LegendItem colorClass="bg-blue-400 ring-1 ring-blue-300" label="Question" />
            <LegendItem colorClass="bg-emerald-400 ring-1 ring-emerald-300" label="Option" />
            <LegendItem colorClass="bg-orange-400 ring-1 ring-orange-300" label="Image field" />
            <span className="hidden text-xs text-slate-400 sm:inline">
              Pan &amp; drag · scroll to zoom · use toolbar to fit
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onCancel} disabled={saving} className="btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={saving}
              className="btn-primary min-w-[140px]"
            >
              {saving ? (
                <>
                  <Spinner size="sm" />
                  Saving...
                </>
              ) : (
                "Confirm & Save"
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

import { memo } from "react";
import { Handle, Position } from "reactflow";
import { NODE_DIMENSIONS } from "../../utils/formFlowTree";

const hiddenHandleClass =
  "!h-1 !w-1 !min-h-0 !min-w-0 !border-0 !bg-transparent !opacity-0 !pointer-events-none";

function FlowQuestionNodeComponent({ data }) {
  const { width, height } = NODE_DIMENSIONS.question;

  return (
    <div
      style={{ width, height }}
      className="relative rounded-lg border border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/80 px-3 py-2.5 shadow-md shadow-blue-100/50"
    >
      <Handle type="target" position={Position.Top} className={hiddenHandleClass} />

      <div className="flex h-full flex-col justify-center gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white">
              {data.displayIndex}
            </span>
            <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-blue-700">
              Q{data.displayIndex}
            </span>
          </div>
          <span
            className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              data.required
                ? "bg-rose-100 text-rose-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {data.requiredLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium capitalize text-blue-700 ring-1 ring-blue-200">
            {data.typeLabel}
          </span>
          {data.answerKey ? (
            <span
              className="truncate rounded bg-white/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 ring-1 ring-slate-200"
              title={data.answerKey}
            >
              {data.answerKey}
            </span>
          ) : (
            <span className="text-[10px] italic text-slate-400">No key</span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className={hiddenHandleClass} />
    </div>
  );
}

function FlowOptionNodeComponent({ data }) {
  const { width, height } = NODE_DIMENSIONS.option;

  return (
    <div
      style={{ width, height }}
      className="relative flex items-center gap-2 rounded-md border border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100/90 px-2.5 py-1.5 shadow-sm shadow-emerald-100/60"
    >
      <Handle type="target" position={Position.Top} className={hiddenHandleClass} />

      <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-white">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </div>

      <p
        className="line-clamp-2 min-w-0 flex-1 text-[11px] font-semibold leading-tight text-emerald-900"
        title={data.label}
      >
        {data.label}
      </p>

      <Handle type="source" position={Position.Bottom} className={hiddenHandleClass} />
    </div>
  );
}

function FlowImageNodeComponent({ data }) {
  const { width, height } = NODE_DIMENSIONS.image;

  return (
    <div
      style={{ width, height }}
      className="relative rounded-md border border-orange-300 bg-gradient-to-br from-orange-50 to-amber-100/90 px-2.5 py-2 shadow-sm shadow-orange-100/60"
    >
      <Handle type="target" position={Position.Top} className={hiddenHandleClass} />

      <div className="flex h-full items-center gap-2">
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-orange-500 text-white">
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="truncate text-[11px] font-semibold text-orange-950"
            title={data.title}
          >
            {data.title}
          </p>
          <span
            className={`mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
              data.required
                ? "bg-orange-200/80 text-orange-900"
                : "bg-white/70 text-orange-700"
            }`}
          >
            {data.requiredLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export const FlowQuestionNode = memo(FlowQuestionNodeComponent);
export const FlowOptionNode = memo(FlowOptionNodeComponent);
export const FlowImageNode = memo(FlowImageNodeComponent);

export const formFlowNodeTypes = {
  flowQuestion: FlowQuestionNode,
  flowOption: FlowOptionNode,
  flowImage: FlowImageNode,
};

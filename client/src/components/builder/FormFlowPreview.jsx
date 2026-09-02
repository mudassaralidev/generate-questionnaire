import { useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";import { formFlowNodeTypes } from "./FormFlowNodes";
import {
  buildFormFlowPreviewTree,
  countFormFlowPreviewStats,
  flowChartTreeHelper,
} from "../../utils/formFlowTree";

/** DOM-based org chart: HTML node components + SVG step edges (no canvas for nodes/text). */

function FitViewOnLoad({ nodeCount }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (nodeCount === 0) return undefined;

    const timer = window.setTimeout(() => {
      fitView({ padding: 0.18, duration: 250 });
    }, 60);

    return () => window.clearTimeout(timer);
  }, [nodeCount, fitView]);

  return null;
}

function FlowZoomToolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <Panel position="top-right" className="!m-3">
      <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => zoomIn({ duration: 200 })}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => zoomOut({ duration: 200 })}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => fitView({ padding: 0.18, duration: 250 })}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Fit to view"
          title="Fit to view"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
            />
          </svg>
        </button>
      </div>
    </Panel>
  );
}

function FormFlowChart({ questions, onStatsChange }) {
  const { nodes, edges } = useMemo(
    () => flowChartTreeHelper(questions),
    [questions],
  );

  const stats = useMemo(() => {
    const tree = buildFormFlowPreviewTree(questions);
    return countFormFlowPreviewStats(tree);
  }, [questions]);

  useEffect(() => {
    onStatsChange?.(stats);
  }, [stats, onStatsChange]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={formFlowNodeTypes}
      nodeOrigin={[0, 0]}
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      elementsSelectable={false}
      onlyRenderVisibleElements
      panOnDrag
      panOnScroll
      zoomOnScroll
      zoomOnPinch
      zoomOnDoubleClick={false}
      preventScrolling={false}
      minZoom={0.08}
      maxZoom={1.75}
      defaultEdgeOptions={{ type: "step" }}
      proOptions={{ hideAttribution: true }}
      className="form-flow-chart"
    >
      <Background variant="dots" gap={20} size={1} color="#e2e8f0" />
      <FlowZoomToolbar />
      <FitViewOnLoad nodeCount={nodes.length} />    </ReactFlow>
  );
}

export default function FormFlowPreview({ questions, onStatsChange }) {
  if (!questions?.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm font-medium text-slate-500">No questions to preview</p>
        <p className="text-sm text-slate-400">
          Add questions in the builder before reviewing the form flow.
        </p>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="h-full w-full">
        <FormFlowChart questions={questions} onStatsChange={onStatsChange} />
      </div>
    </ReactFlowProvider>
  );
}

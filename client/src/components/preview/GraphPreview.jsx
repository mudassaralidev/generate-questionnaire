import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'reactflow';
import { useBuilder } from '../../context/BuilderContext';
import { getAutoLayout } from '../../utils/layout';

const TYPE_COLORS = {
  radio: '#3b82f6',
  checkbox: '#8b5cf6',
  dropdown: '#10b981',
  text: '#6b7280',
  textarea: '#6b7280',
  number: '#f59e0b',
  date: '#f59e0b',
  image: '#ef4444',
};

function QuestionNode({ data }) {
  return (
    <div
      style={{ borderColor: data.color }}
      className="rounded-lg border-2 bg-white px-4 py-2.5 shadow-sm min-w-[160px] max-w-[200px]"
    >
      <div className="flex items-center gap-2">
        <div style={{ backgroundColor: data.color }} className="h-2 w-2 rounded-full flex-shrink-0" />
        <p className="text-xs font-semibold text-gray-800 truncate">{data.label}</p>
      </div>
      <p className="mt-0.5 text-[10px] text-gray-400 capitalize">{data.type}</p>
    </div>
  );
}

const nodeTypes = { questionNode: QuestionNode };

function GraphInner({ questions }) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const rawNodes = useMemo(
    () =>
      questions.map((q) => ({
        id: String(q._id),
        type: 'questionNode',
        position: { x: 0, y: 0 },
        data: {
          label: q.answer_key || 'Untitled',
          type: q.type,
          color: TYPE_COLORS[q.type] || '#6b7280',
        },
      })),
    [questions]
  );

  const rawEdges = useMemo(
    () =>
      questions.flatMap((q) =>
        (q.parent_question_ids || []).map((pid) => ({
          id: `${pid}->${q._id}`,
          source: String(pid),
          target: String(q._id),
          animated: false,
          style: { stroke: '#94a3b8' },
          markerEnd: { type: 'arrowclosed', color: '#94a3b8' },
        }))
      ),
    [questions]
  );

  useEffect(() => {
    if (rawNodes.length === 0) return;
    const laidOut = getAutoLayout(rawNodes, rawEdges);
    setNodes(laidOut);
    setEdges(rawEdges);
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [rawNodes, rawEdges]);

  if (questions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400 text-sm">
        No questions to display
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="bottom-right"
    >
      <Background variant="dots" gap={16} size={1} color="#e2e8f0" />
      <Controls />
      <MiniMap
        nodeColor={(n) => n.data?.color || '#6b7280'}
        maskColor="rgba(241,245,249,0.7)"
      />
    </ReactFlow>
  );
}

export default function GraphPreview() {
  const { questions } = useBuilder();

  return (
    <ReactFlowProvider>
      <div className="h-full w-full">
        <GraphInner questions={questions} />
      </div>
    </ReactFlowProvider>
  );
}

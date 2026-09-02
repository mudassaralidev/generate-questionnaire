import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { reindexOrders } from "../../utils/helpers";
import QuestionListItem from "./QuestionListItem";

export default function QuestionSection({
  title,
  description,
  questions,
  allQuestions = [],
  selectedQuestionId,
  onAdd,
  onSelect,
  onDuplicate,
  onDelete,
  onReorder,
  emptyLabel,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = questions.findIndex((q) => q._id === active.id);
    const newIdx = questions.findIndex((q) => q._id === over.id);
    onReorder(reindexOrders(arrayMove(questions, oldIdx, newIdx)));
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-start justify-between gap-2 px-3 py-3 border-b border-gray-100 bg-gray-50">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            {title}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
        </div>
        <button
          onClick={onAdd}
          className="btn-primary py-1 text-xs flex-shrink-0"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add
        </button>
      </div>

      <div className="p-2 space-y-2 min-h-[80px]">
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-xs text-gray-400">{emptyLabel}</p>
            <button onClick={onAdd} className="mt-2 btn-secondary py-1 text-xs">
              Add Question
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map((q) => q._id)}
              strategy={verticalListSortingStrategy}
            >
              {questions.map((q) => (
                <QuestionListItem
                  key={q._id}
                  question={q}
                  allQuestions={allQuestions}
                  isSelected={q._id === selectedQuestionId}
                  onSelect={onSelect}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </section>
  );
}

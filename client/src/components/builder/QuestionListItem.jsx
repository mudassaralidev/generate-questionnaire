import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Badge from '../common/Badge';
import { isIndependentQuestion } from '../../utils/questionUtils';
import { getDependencyLabels } from '../../utils/dependencyUtils';

const TYPE_COLORS = {
  radio: 'blue',
  checkbox: 'purple',
  dropdown: 'green',
  text: 'gray',
  textarea: 'gray',
  number: 'yellow',
  date: 'yellow',
  image: 'red',
};

export default function QuestionListItem({
  question,
  allQuestions = [],
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const dependencyLabels = !isIndependentQuestion(question)
    ? getDependencyLabels(question, allQuestions)
    : [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(question._id)}
      className={`group flex items-start gap-2 rounded-lg border p-3 cursor-pointer transition-all ${
        isSelected
          ? 'border-primary-400 bg-primary-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="mt-0.5 flex-shrink-0 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        title="Drag to reorder"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 110 4 2 2 0 010-4zM13 2a2 2 0 110 4 2 2 0 010-4zM7 8a2 2 0 110 4 2 2 0 010-4zM13 8a2 2 0 110 4 2 2 0 010-4zM7 14a2 2 0 110 4 2 2 0 010-4zM13 14a2 2 0 110 4 2 2 0 010-4z" />
        </svg>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-800 truncate">
            {question.answer_key || <span className="italic text-gray-400">Untitled</span>}
          </p>
          <span className="text-[10px] text-gray-400 font-mono">#{question.order}</span>
        </div>
        {question.description && (
          <p className="text-xs text-gray-500 truncate">{question.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap gap-1">
          <Badge color={TYPE_COLORS[question.type] || 'gray'}>{question.type}</Badge>
          {!isIndependentQuestion(question) && <Badge color="purple">dependent</Badge>}
          {question.validations?.required && <Badge color="red">required</Badge>}
        </div>
        {dependencyLabels.length > 0 && (
          <div className="mt-1.5 space-y-0.5">
            {dependencyLabels.map((label) => (
              <p
                key={label}
                className="text-[11px] text-purple-700 font-mono truncate"
                title={`Depends on ${label}`}
              >
                depends on: {label}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(question._id);
          }}
          className="rounded p-1 text-gray-400 hover:bg-blue-100 hover:text-blue-600"
          title="Duplicate"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(question._id);
          }}
          className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
          title="Delete"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

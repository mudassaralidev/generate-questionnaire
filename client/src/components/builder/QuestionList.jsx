import { useBuilder } from '../../context/BuilderContext';
import { splitQuestionsByDependency } from '../../utils/questionUtils';
import QuestionSection from './QuestionSection';

export default function QuestionList() {
  const {
    questions,
    selectedQuestionId,
    addQuestion,
    duplicateQuestion,
    deleteQuestion,
    reorderSection,
    selectQuestion,
  } = useBuilder();

  const { independent, dependent } = splitQuestionsByDependency(questions);

  return (
    <aside className="flex h-full flex-col border-r border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">
          Questions
          <span className="ml-2 text-xs font-normal text-gray-400">({questions.length})</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <QuestionSection
          title="Independent Questions"
          description="Shown without parent dependencies"
          questions={independent}
          allQuestions={questions}
          selectedQuestionId={selectedQuestionId}
          onAdd={() => addQuestion({ is_independent: true })}
          onSelect={selectQuestion}
          onDuplicate={duplicateQuestion}
          onDelete={deleteQuestion}
          onReorder={(items) => reorderSection('independent', items)}
          emptyLabel="No independent questions yet"
        />

        <QuestionSection
          title="Dependent Questions"
          description="Shown based on selected parent options"
          questions={dependent}
          allQuestions={questions}
          selectedQuestionId={selectedQuestionId}
          onAdd={() => addQuestion({ is_independent: false })}
          onSelect={selectQuestion}
          onDuplicate={duplicateQuestion}
          onDelete={deleteQuestion}
          onReorder={(items) => reorderSection('dependent', items)}
          emptyLabel="No dependent questions yet"
        />
      </div>
    </aside>
  );
}

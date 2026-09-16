import { useBuilder } from "../../context/BuilderContext";
import { isExternalSourceQuestion } from "../../utils/questionUtils";

const OPTION_TYPES = ["radio", "checkbox", "dropdown"];

export default function DependencyBuilder({ question, onChange }) {
  const { questions } = useBuilder();

  const optionParentQuestions = questions.filter(
    (q) =>
      q._id !== question._id &&
      !isExternalSourceQuestion(q) &&
      OPTION_TYPES.includes(q.type) &&
      (q.options || []).length > 0,
  );

  const externalParentQuestions = questions.filter(
    (q) =>
      q._id !== question._id &&
      isExternalSourceQuestion(q),
  );

  const selectedOptionIds = (question.parent_option_ids || []).map(String);
  const selectedQuestionIds = (question.parent_question_ids || []).map(String);

  const rebuildParentQuestionIds = (nextOptionIds, nextExternalQuestionIds) => {
    const optionToQuestion = new Map();
    for (const pq of optionParentQuestions) {
      for (const opt of pq.options || []) {
        optionToQuestion.set(String(opt._id), String(pq._id));
      }
    }

    const fromOptions = nextOptionIds
      .map((oid) => optionToQuestion.get(oid))
      .filter(Boolean);

    return [...new Set([...fromOptions, ...nextExternalQuestionIds])];
  };

  const getSelectedExternalParentIds = () =>
    selectedQuestionIds.filter((id) =>
      externalParentQuestions.some((pq) => String(pq._id) === id),
    );

  const toggleParentOption = (optionId) => {
    const isSelected = selectedOptionIds.includes(String(optionId));
    const nextOptionIds = isSelected
      ? selectedOptionIds.filter((id) => id !== String(optionId))
      : [...selectedOptionIds, String(optionId)];

    onChange({
      parent_option_ids: nextOptionIds,
      parent_question_ids: rebuildParentQuestionIds(
        nextOptionIds,
        getSelectedExternalParentIds(),
      ),
    });
  };

  const toggleExternalParent = (parentId) => {
    const id = String(parentId);
    const isSelected = selectedQuestionIds.includes(id);
    const nextExternalIds = isSelected
      ? getSelectedExternalParentIds().filter((qid) => qid !== id)
      : [...getSelectedExternalParentIds(), id];

    onChange({
      parent_option_ids: selectedOptionIds,
      parent_question_ids: rebuildParentQuestionIds(
        selectedOptionIds,
        nextExternalIds,
      ),
    });
  };

  const hasAnyParents =
    optionParentQuestions.length > 0 || externalParentQuestions.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Parent Options</label>
        <p className="text-xs text-gray-500 mb-2">
          Select the options on which this question will appear.
        </p>

        {optionParentQuestions.length === 0 ? (
          <p className="text-xs text-gray-400 italic">
            No parent options available. Add radio, checkbox, or dropdown
            questions with options first.
          </p>
        ) : (
          <div className="space-y-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 p-2 bg-gray-50">
            {optionParentQuestions.map((pq) => (
              <div key={pq._id}>
                <p className="text-xs font-semibold text-gray-500 px-1.5 py-1">
                  {pq.answer_key || "Untitled"}
                </p>
                {(pq.options || []).map((opt) => (
                  <label
                    key={opt._id}
                    className="flex items-center gap-2.5 px-2 py-1 rounded cursor-pointer hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOptionIds.includes(String(opt._id))}
                      onChange={() => toggleParentOption(opt._id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      {opt.label || (
                        <span className="italic text-gray-400">Untitled</span>
                      )}
                    </span>
                    <span className="ml-auto text-xs text-gray-400 font-mono">
                      {opt.value}
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="label">External Source Parents</label>
        <p className="text-xs text-gray-500 mb-2">
          External source questions can also act as parents for dependents.
        </p>

        {externalParentQuestions.length === 0 ? (
          <p className="text-xs text-gray-400 italic">
            No external source questions available yet.
          </p>
        ) : (
          <div className="space-y-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 p-2 bg-gray-50">
            {externalParentQuestions.map((pq) => (
              <label
                key={pq._id}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer hover:bg-white"
              >
                <input
                  type="checkbox"
                  checked={selectedQuestionIds.includes(String(pq._id))}
                  onChange={() => toggleExternalParent(pq._id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  {pq.answer_key || (
                    <span className="italic text-gray-400">Untitled</span>
                  )}
                </span>
                {pq.external_source && (
                  <span className="ml-auto text-xs text-gray-400 font-mono">
                    {pq.external_source}
                  </span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      {!hasAnyParents && (
        <p className="text-xs text-amber-600">
          Add option-based or external source questions before configuring
          dependencies.
        </p>
      )}
    </div>
  );
}

import { useBuilder } from "../../context/BuilderContext";

const OPTION_TYPES = ["radio", "checkbox", "dropdown"];

export default function DependencyBuilder({ question, onChange }) {
  const { questions } = useBuilder();

  const parentQuestions = questions.filter(
    (q) =>
      q._id !== question._id &&
      OPTION_TYPES.includes(q.type) &&
      (q.options || []).length > 0,
  );

  const selectedOptionIds = (question.parent_option_ids || []).map(String);

  const toggleParentOption = (optionId) => {
    const currentOptions = (question.parent_option_ids || []).map(String);
    const isSelected = currentOptions.includes(String(optionId));

    const nextOptionIds = isSelected
      ? currentOptions.filter((id) => id !== String(optionId))
      : [...currentOptions, String(optionId)];

    const optionToQuestion = new Map();
    for (const pq of parentQuestions) {
      for (const opt of pq.options || []) {
        optionToQuestion.set(String(opt._id), String(pq._id));
      }
    }

    const nextQuestionIds = [
      ...new Set(
        nextOptionIds.map((oid) => optionToQuestion.get(oid)).filter(Boolean),
      ),
    ];

    onChange({
      parent_option_ids: nextOptionIds,
      parent_question_ids: nextQuestionIds,
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Parent Options</label>
        <p className="text-xs text-gray-500 mb-2">
          Select the options on which this question will appear.
        </p>

        {parentQuestions.length === 0 ? (
          <p className="text-xs text-gray-400 italic">
            No parent options available. Add radio, checkbox, or dropdown
            questions with options first.
          </p>
        ) : (
          <div className="space-y-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 p-2 bg-gray-50">
            {parentQuestions.map((pq) => (
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
    </div>
  );
}

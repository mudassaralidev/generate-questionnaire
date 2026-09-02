/**
 * Build human-readable dependency labels for a dependent question.
 */
export function getDependencyLabels(question, allQuestions = []) {
  const parentOptionIds = (question.parent_option_ids || []).map(String);
  if (!parentOptionIds.length) return [];

  const questionById = new Map(allQuestions.map((q) => [String(q._id), q]));
  const labels = [];

  for (const optionId of parentOptionIds) {
    for (const parent of allQuestions) {
      const option = (parent.options || []).find(
        (o) => String(o._id) === optionId,
      );
      if (!option) continue;

      const optionKey = option.value || option.label || optionId;
      labels.push(optionKey);
      break;
    }
  }

  // Fallback: parent questions without resolved options
  for (const parentId of question.parent_question_ids || []) {
    const parent = questionById.get(String(parentId));
    if (!parent) continue;

    const hasOptionFromParent = (parent.options || []).some((o) =>
      parentOptionIds.includes(String(o._id)),
    );
    if (!hasOptionFromParent) {
      labels.push(parent.answer_key || "Untitled");
    }
  }

  return [...new Set(labels)];
}

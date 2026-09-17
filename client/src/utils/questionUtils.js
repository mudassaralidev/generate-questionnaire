export const isIndependentQuestion = (q) => q.is_independent === true;

export const isExternalSourceQuestion = (q) => q.is_external_source === true;

/** True when this question depends on at least one external-source parent */
export const hasExternalSourceParent = (question, allQuestions = []) => {
  const parentIds = (question?.parent_question_ids || []).map(String);
  if (!parentIds.length) return false;

  const byId = new Map(allQuestions.map((q) => [String(q._id), q]));
  return parentIds.some((id) => isExternalSourceQuestion(byId.get(id)));
};

export const splitQuestionsByDependency = (questions) => {
  const independent = [];
  const dependent = [];

  for (const q of questions) {
    if (isIndependentQuestion(q)) independent.push(q);
    else dependent.push(q);
  }

  return {
    independent: [...independent].sort((a, b) => a.order - b.order),
    dependent: [...dependent].sort((a, b) => a.order - b.order),
  };
};

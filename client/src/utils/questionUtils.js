export const isIndependentQuestion = (q) => q.is_independent === true;

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

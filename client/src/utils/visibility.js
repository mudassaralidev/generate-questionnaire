/**
 * Determines whether a question should be visible given current form answers.
 * A question is visible when for EVERY parent question, at least one of
 * the currently selected options on that parent is in parent_option_ids.
 */
export function isQuestionVisible(question, answers, questionsById) {
  const { parent_question_ids, parent_option_ids } = question;
  if (!parent_question_ids || parent_question_ids.length === 0) return true;

  return parent_question_ids.every((pqId) => {
    const pq = questionsById[String(pqId)];
    if (!pq) return false;
    const selectedValues = [].concat(answers[pq.answer_key] ?? []);
    const matchingOptionIds = (pq.options || [])
      .filter((o) => selectedValues.includes(o.value))
      .map((o) => String(o._id));
    return matchingOptionIds.some((oid) =>
      (parent_option_ids || []).map(String).includes(oid)
    );
  });
}

export function buildQuestionsById(questions) {
  return Object.fromEntries(questions.map((q) => [String(q._id), q]));
}

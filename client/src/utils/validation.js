/**
 * Mirror of the server-side integrity validator — used for real-time feedback in the UI.
 */
export function validateFormIntegrity(questions) {
  const errors = [];

  if (!questions || questions.length === 0) {
    errors.push('At least one question is required. Empty form configurations cannot be saved.');
    return errors;
  }

  const answerKeys = new Set();
  const questionOrders = new Set();
  const questionIds = new Set(questions.map((q) => String(q._id)));

  for (const q of questions) {
    const qLabel = q.answer_key || String(q._id);

    if (!q.answer_key?.trim()) {
      errors.push('Every question must have an answer_key');
    }

    // Image / dynamic_images questions may share the same answer_key across multiple entries
    if (!['image', 'dynamic_images'].includes(q.type) && q.answer_key && answerKeys.has(q.answer_key)) {
      errors.push(`Duplicate answer_key: "${q.answer_key}"`);
    }
    if (!['image', 'dynamic_images'].includes(q.type) && q.answer_key) {
      answerKeys.add(q.answer_key);
    }

    if (questionOrders.has(q.order)) errors.push(`Duplicate question order: ${q.order} (${qLabel})`);
    questionOrders.add(q.order);

    if (['radio', 'checkbox', 'dropdown'].includes(q.type)) {
      const optValues = new Set();
      const optOrders = new Set();
      for (const o of q.options || []) {
        if (!o.label?.trim()) errors.push(`Missing label in options of "${qLabel}"`);
        if (!o.value?.trim()) errors.push(`Missing value in options of "${qLabel}"`);
        if (optValues.has(o.value)) errors.push(`Duplicate option value "${o.value}" in "${qLabel}"`);
        if (optOrders.has(o.order)) errors.push(`Duplicate option order ${o.order} in "${qLabel}"`);
        optValues.add(o.value);
        optOrders.add(o.order);
      }
    }

    if (q.type === 'image') {
      const imgKeys = new Set();
      const imgOrders = new Set();
      for (const img of q.images || []) {
        if (!img.key?.trim()) errors.push(`Missing image key in "${qLabel}"`);
        if (imgKeys.has(img.key)) errors.push(`Duplicate image key "${img.key}" in "${qLabel}"`);
        if (imgOrders.has(img.order)) errors.push(`Duplicate image order ${img.order} in "${qLabel}"`);
        imgKeys.add(img.key);
        imgOrders.add(img.order);
      }
    }

    if (q.type === 'dynamic_images') {
      const imgKeys = new Set();
      const imgOrders = new Set();
      for (const img of q.dynamic_images || []) {
        if (!img.key?.trim()) errors.push(`Missing dynamic image key in "${qLabel}"`);
        if (imgKeys.has(img.key)) errors.push(`Duplicate dynamic image key "${img.key}" in "${qLabel}"`);
        if (imgOrders.has(img.order)) errors.push(`Duplicate dynamic image order ${img.order} in "${qLabel}"`);
        imgKeys.add(img.key);
        imgOrders.add(img.order);
      }
    }

    if (!q.is_independent) {
      const hasPQ = q.parent_question_ids?.length > 0;
      const hasPO = q.parent_option_ids?.length > 0;
      if (hasPQ && !hasPO) errors.push(`"${qLabel}" has parent questions but no parent options`);
      if (hasPO && !hasPQ) errors.push(`"${qLabel}" has parent options but no parent questions`);

      if (hasPQ) {
        for (const pqId of q.parent_question_ids) {
          if (!questionIds.has(String(pqId))) {
            errors.push(`"${qLabel}" references missing parent question`);
          }
        }
      }
    }
  }

  const dependentQuestions = questions.filter((q) => !q.is_independent);
  const parentMap = new Map(
    dependentQuestions.map((q) => [String(q._id), (q.parent_question_ids || []).map(String)])
  );
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map([...parentMap.keys()].map((id) => [id, WHITE]));
  const hasCycle = (node) => {
    if (color.get(node) === GRAY) return true;
    if (color.get(node) === BLACK) return false;
    color.set(node, GRAY);
    for (const p of parentMap.get(node) || []) if (hasCycle(p)) return true;
    color.set(node, BLACK);
    return false;
  };
  for (const id of parentMap.keys()) {
    if (color.get(id) === WHITE && hasCycle(id)) {
      errors.push('Circular dependency detected');
      break;
    }
  }

  return errors;
}

/**
 * Domain-level integrity checks run before every save.
 * Returns an array of error strings (empty = valid).
 */
function validateFormIntegrity(questions) {
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

    if (!q.answer_key || !String(q.answer_key).trim()) {
      errors.push('Every question must have an answer_key');
    }

    // duplicate answer_key (image / dynamic_images questions may reuse the same key)
    if (!['image', 'dynamic_images'].includes(q.type) && q.answer_key) {
      if (answerKeys.has(q.answer_key)) {
        errors.push(`Duplicate answer_key: "${q.answer_key}"`);
      }
      answerKeys.add(q.answer_key);
    }

    // duplicate question order
    if (questionOrders.has(q.order)) {
      errors.push(`Duplicate question order: ${q.order} (answer_key: ${qLabel})`);
    }
    questionOrders.add(q.order);

    // options checks
    if (['radio', 'checkbox', 'dropdown'].includes(q.type)) {
      const optValues = new Set();
      const optOrders = new Set();

      for (const o of q.options || []) {
        if (!o.label || !o.label.trim()) {
          errors.push(`Missing label in options of "${qLabel}"`);
        }
        if (!o.value || !o.value.trim()) {
          errors.push(`Missing value in options of "${qLabel}"`);
        }
        if (optValues.has(o.value)) {
          errors.push(`Duplicate option value "${o.value}" in "${qLabel}"`);
        }
        if (optOrders.has(o.order)) {
          errors.push(`Duplicate option order ${o.order} in "${qLabel}"`);
        }
        optValues.add(o.value);
        optOrders.add(o.order);
      }
    }

    // images checks
    if (q.type === 'image') {
      const imgKeys = new Set();
      const imgOrders = new Set();

      for (const img of q.images || []) {
        if (!img.key || !img.key.trim()) {
          errors.push(`Missing image key in "${qLabel}"`);
        }
        if (imgKeys.has(img.key)) {
          errors.push(`Duplicate image key "${img.key}" in "${qLabel}"`);
        }
        if (imgOrders.has(img.order)) {
          errors.push(`Duplicate image order ${img.order} in "${qLabel}"`);
        }
        imgKeys.add(img.key);
        imgOrders.add(img.order);
      }
    }

    if (q.type === 'dynamic_images') {
      const imgKeys = new Set();
      const imgOrders = new Set();

      for (const img of q.dynamic_images || []) {
        if (!img.key || !img.key.trim()) {
          errors.push(`Missing dynamic image key in "${qLabel}"`);
        }
        if (imgKeys.has(img.key)) {
          errors.push(`Duplicate dynamic image key "${img.key}" in "${qLabel}"`);
        }
        if (imgOrders.has(img.order)) {
          errors.push(`Duplicate dynamic image order ${img.order} in "${qLabel}"`);
        }
        imgKeys.add(img.key);
        imgOrders.add(img.order);
      }
    }

    // dependency completeness
    const hasPQ = q.parent_question_ids && q.parent_question_ids.length > 0;
    const hasPO = q.parent_option_ids && q.parent_option_ids.length > 0;

    if (hasPQ && !hasPO) {
      errors.push(`"${qLabel}" has parent question(s) but no parent option(s)`);
    }
    if (hasPO && !hasPQ) {
      errors.push(`"${qLabel}" has parent option(s) but no parent question(s)`);
    }

    // parent question existence
    if (hasPQ) {
      for (const pqId of q.parent_question_ids) {
        if (!questionIds.has(String(pqId))) {
          errors.push(`"${qLabel}" references non-existent parent question ${pqId}`);
        }
      }
    }
  }

  // circular dependency detection — DFS on parent graph
  // Build child → parents adjacency
  const parentMap = new Map();
  for (const q of questions) {
    parentMap.set(String(q._id), (q.parent_question_ids || []).map(String));
  }

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map([...parentMap.keys()].map((id) => [id, WHITE]));

  const hasCycle = (node) => {
    if (color.get(node) === GRAY) return true;
    if (color.get(node) === BLACK) return false;
    color.set(node, GRAY);
    for (const parent of parentMap.get(node) || []) {
      if (hasCycle(parent)) return true;
    }
    color.set(node, BLACK);
    return false;
  };

  for (const id of parentMap.keys()) {
    if (color.get(id) === WHITE && hasCycle(id)) {
      errors.push('Circular dependency detected in question dependencies');
      break;
    }
  }

  return errors;
}

module.exports = { validateFormIntegrity };

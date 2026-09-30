import { IMAGE_TYPES } from "./questionFields";

export const isIndependentQuestion = (q) => q.is_independent === true;

export const isExternalSourceQuestion = (q) => q.is_external_source === true;

/** Independent input types that sort after other non-image questions */
export const LATE_INDEPENDENT_TYPES = [
  "text",
  "textarea",
  "number",
  "phone_number",
];

const IMAGE_TYPE_SET = new Set(IMAGE_TYPES);
const LATE_INDEPENDENT_TYPE_SET = new Set(LATE_INDEPENDENT_TYPES);

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

/** True when this question depends on at least one external-source parent */
export const hasExternalSourceParent = (question, allQuestions = []) => {
  const parentIds = (question?.parent_question_ids || []).map(String);
  if (!parentIds.length) return false;

  const byId = new Map(allQuestions.map((q) => [String(q._id), q]));
  return parentIds.some((id) => isExternalSourceQuestion(byId.get(id)));
};

export function isImageQuestion(question) {
  return IMAGE_TYPE_SET.has(question?.type);
}

export function isLateIndependentType(question) {
  return LATE_INDEPENDENT_TYPE_SET.has(question?.type);
}

/**
 * Sort priority within a section (lower = earlier):
 * 0 — normal questions (creation/drag order preserved among themselves)
 * 1 — independent text / textarea / number / phone_number (before images)
 * 2 — image / dynamic_images (always last in the section)
 */
export function getQuestionSortTier(
  question,
  { independentSection = false } = {},
) {
  if (isImageQuestion(question)) return 2;
  if (independentSection && isLateIndependentType(question)) return 1;
  return 0;
}

/**
 * Stable type-priority sort within a section, preserving relative order
 * (by `order`) inside each tier.
 */
export function sortQuestionsInSection(
  questions = [],
  { independentSection = false } = {},
) {
  return [...questions].sort((a, b) => {
    const tierDiff =
      getQuestionSortTier(a, { independentSection }) -
      getQuestionSortTier(b, { independentSection });
    if (tierDiff !== 0) return tierDiff;
    return byOrder(a, b);
  });
}

/** Split independent questions into normal / late-input / image buckets */
export function partitionIndependentQuestions(independent = []) {
  const normal = [];
  const late = [];
  const images = [];

  for (const q of independent) {
    if (isImageQuestion(q)) images.push(q);
    else if (isLateIndependentType(q)) late.push(q);
    else normal.push(q);
  }

  return {
    normal: [...normal].sort(byOrder),
    late: [...late].sort(byOrder),
    images: [...images].sort(byOrder),
  };
}

/**
 * Global merge order:
 * - No dependents:
 *   independent normal → independent late → independent images
 * - With dependents:
 *   independent normal → all dependents → independent late → independent images
 *
 * Dependent images stay at the end of the dependent block.
 */
export function mergeQuestionsByTypePriority(
  independent = [],
  dependent = [],
) {
  const { normal, late, images } = partitionIndependentQuestions(independent);
  const dependents = sortQuestionsInSection(dependent, {
    independentSection: false,
  });

  if (dependents.length > 0) {
    return [...normal, ...dependents, ...late, ...images];
  }

  return [...normal, ...late, ...images];
}

export const splitQuestionsByDependency = (questions) => {
  const independent = [];
  const dependent = [];

  for (const q of questions) {
    if (isIndependentQuestion(q)) independent.push(q);
    else dependent.push(q);
  }

  return {
    independent: sortQuestionsInSection(independent, {
      independentSection: true,
    }),
    dependent: sortQuestionsInSection(dependent, {
      independentSection: false,
    }),
  };
};

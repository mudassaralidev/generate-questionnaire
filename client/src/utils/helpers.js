import { splitQuestionsByDependency } from "./questionUtils";
import {
  migrateValidationsOnLoad,
  migrateImageOnLoad,
  normalizeValidationsForSave,
  normalizeImageForSave,
  defaultValidations,
} from "./validationUtils";
import {
  applyQuestionScalars,
  getQuestionScalarDefaults,
  pickQuestionScalarsForSave,
  supportsEditableFlag,
  isImageQuestionType,
} from "./questionFields";

let counter = 0;

/**
 * Generate a MongoDB-compatible 24-char hex ObjectId.
 * Uses Math.random (not crypto) so it works in all browser + Node contexts.
 */
export const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, "0");
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
  counter = (counter + 1) % 0xffffff;
  const suffix = counter.toString(16).padStart(6, "0");
  return (timestamp + random).slice(0, 18) + suffix;
};

export const isObjectId = (id) => /^[a-f\d]{24}$/i.test(String(id || ""));

/** Reassign order fields starting from 1 */
export const reindexOrders = (items) =>
  items.map((item, i) => ({ ...item, order: i + 1 }));

const hasDependencies = (q) =>
  q.parent_question_ids?.length > 0 || q.parent_option_ids?.length > 0;

export const deepClone = (value) => JSON.parse(JSON.stringify(value));

/** Snapshot used by Reset Question — excludes order so drag position can be preserved */
export const createQuestionSnapshot = (q) => {
  const clone = deepClone(q);
  delete clone.order;
  delete clone._original;
  delete clone._resetVersion;
  return clone;
};

/** True when the question differs from its last saved/loaded snapshot */
export const isQuestionDirty = (question) => {
  if (!question?._original) return false;
  return (
    JSON.stringify(createQuestionSnapshot(question)) !==
    JSON.stringify(question._original)
  );
};

const ensureNestedIds = (items = []) =>
  reindexOrders(
    items.map((item) => ({
      ...item,
      _id: isObjectId(item._id) ? String(item._id) : generateId(),
    })),
  );

function normalizeValidationsForQuestion(type, validations = {}, { isExternalSource = false } = {}) {
  let next =
    isImageQuestionType(type) && !isExternalSource
      ? defaultValidations()
      : normalizeValidationsForSave(validations || { required: false });

  if (supportsEditableFlag(type)) {
    next = {
      ...next,
      is_editable:
        next.is_editable !== undefined ? Boolean(next.is_editable) : true,
    };
  } else {
    delete next.is_editable;
  }

  return next;
}

/**
 * Build a new question object. Scalar defaults come from QUESTION_SCALAR_FIELDS.
 */
export const createEmptyQuestion = (overrides = {}) => {
  const type = overrides.type || getQuestionScalarDefaults().type;
  const isIndependent = overrides.is_independent !== false;

  return {
    _id: generateId(),
    ...getQuestionScalarDefaults(),
    parent_question_ids: [],
    parent_option_ids: [],
    order: 1,
    is_independent: isIndependent,
    _stashedDependencies: { parent_question_ids: [], parent_option_ids: [] },
    validations: normalizeValidationsForQuestion(type, {
      required: false,
      ...(supportsEditableFlag(type) ? { is_editable: true } : {}),
    }),
    options: [],
    images: [],
    dynamic_images: [],
    _resetVersion: 0,
    ...overrides,
  };
};

/**
 * Clone a question with brand-new ids for the question, options, and images.
 * Parent dependency refs are kept so a duplicated dependent question still
 * points at the same parents (not at itself).
 */
export const duplicateQuestionWithNewIds = (src) => {
  const dup = {
    ...deepClone(src),
    _id: generateId(),
    answer_key: `${src.answer_key || "question"}_copy`,
    options: reindexOrders(
      (src.options || []).map((o) => ({
        ...deepClone(o),
        _id: generateId(),
      })),
    ),
    images: reindexOrders(
      (src.images || []).map((img) => ({
        ...deepClone(img),
        _id: generateId(),
      })),
    ),
    dynamic_images: reindexOrders(
      (src.dynamic_images || []).map((img) => ({
        ...deepClone(img),
        _id: generateId(),
      })),
    ),
    _resetVersion: 0,
  };

  if (dup.is_independent) {
    dup.parent_question_ids = [];
    dup.parent_option_ids = [];
    dup._stashedDependencies = {
      parent_question_ids: [],
      parent_option_ids: [],
    };
  } else {
    dup.parent_question_ids = [...(src.parent_question_ids || [])].map(String);
    dup.parent_option_ids = [...(src.parent_option_ids || [])].map(String);
    dup._stashedDependencies = {
      parent_question_ids: [...dup.parent_question_ids],
      parent_option_ids: [...dup.parent_option_ids],
    };
  }

  dup._original = createQuestionSnapshot(dup);
  return dup;
};

/** Normalize a question loaded from API for client-side editing */
const normalizeQuestionOnLoad = (q) => {
  const independent = !hasDependencies(q);
  const scalars = applyQuestionScalars(q);
  const isExternalSource = Boolean(scalars.is_external_source);

  const normalized = {
    ...q,
    ...scalars,
    _id: isObjectId(q._id) ? String(q._id) : generateId(),
    is_independent: independent,
    external_source: isExternalSource ? scalars.external_source : "",
    parent_question_ids: (q.parent_question_ids || []).map(String),
    parent_option_ids: (q.parent_option_ids || []).map(String),
    _stashedDependencies: independent
      ? { parent_question_ids: [], parent_option_ids: [] }
      : {
          parent_question_ids: (q.parent_question_ids || []).map(String),
          parent_option_ids: (q.parent_option_ids || []).map(String),
        },
    options: isExternalSource ? [] : ensureNestedIds(q.options || []),
    images: isExternalSource
      ? []
      : reindexOrders(
          (q.images || []).map((img) =>
            migrateImageOnLoad(
              {
                ...img,
                _id: isObjectId(img._id) ? String(img._id) : generateId(),
              },
              { dynamic: false },
            ),
          ),
        ),
    dynamic_images: isExternalSource
      ? []
      : reindexOrders(
          (q.dynamic_images || []).map((img) =>
            migrateImageOnLoad(
              {
                ...img,
                _id: isObjectId(img._id) ? String(img._id) : generateId(),
              },
              { dynamic: true },
            ),
          ),
        ),
    validations: normalizeValidationsForQuestion(
      scalars.type,
      migrateValidationsOnLoad(q.validations || { required: false }),
      { isExternalSource },
    ),
    _resetVersion: 0,
  };

  return {
    ...normalized,
    _original: createQuestionSnapshot(normalized),
  };
};

export const normalizeQuestionsOnLoad = (questions) => {
  const normalized = (questions || []).map(normalizeQuestionOnLoad);
  const { independent, dependent } = splitQuestionsByDependency(normalized);
  return mergeAndReindexQuestions(independent, dependent);
};

/** Merge independent + dependent lists and assign global order 1..n */
export const mergeAndReindexQuestions = (independent, dependent) =>
  reindexOrders([...independent, ...dependent]);

/**
 * Prepare questions for API create/update.
 * Scalar fields come from QUESTION_SCALAR_FIELDS (+ any extra unknown scalars).
 */
export const cleanQuestionsForSave = (questions) => {
  const { independent, dependent } = splitQuestionsByDependency(questions);
  const ordered = mergeAndReindexQuestions(independent, dependent);

  const idMap = new Map();

  const ensureObjectId = (id) => {
    if (id == null || id === "") return generateId();
    const key = String(id);
    if (isObjectId(key)) return key;
    if (!idMap.has(key)) idMap.set(key, generateId());
    return idMap.get(key);
  };

  for (const q of ordered) {
    ensureObjectId(q._id);
    for (const o of q.options || []) ensureObjectId(o._id);
    for (const img of q.images || []) ensureObjectId(img._id);
    for (const img of q.dynamic_images || []) ensureObjectId(img._id);
  }

  return ordered.map((q) => {
    const isExternalSource = Boolean(q.is_external_source);
    const scalars = pickQuestionScalarsForSave(q);

    const out = {
      _id: ensureObjectId(q._id),
      ...scalars,
      order: q.order,
      validations: normalizeValidationsForQuestion(
        scalars.type,
        q.validations || { required: false },
        { isExternalSource },
      ),
      parent_question_ids: [],
      parent_option_ids: [],
      options: [],
      images: [],
      dynamic_images: [],
    };

    if (!q.is_independent) {
      out.parent_question_ids = (q.parent_question_ids || []).map(
        ensureObjectId,
      );
      out.parent_option_ids = (q.parent_option_ids || []).map(ensureObjectId);
    }

    if (!isExternalSource) {
      out.options = reindexOrders(
        (q.options || []).map((o) => ({
          _id: ensureObjectId(o._id),
          label: o.label,
          value: o.value,
          order: o.order,
        })),
      );

      out.images = reindexOrders(
        (q.images || []).map((img) => ({
          ...normalizeImageForSave({
            ...img,
            _id: ensureObjectId(img._id),
          }),
        })),
      );

      out.dynamic_images = reindexOrders(
        (q.dynamic_images || []).map((img) => ({
          ...normalizeImageForSave(
            {
              ...img,
              _id: ensureObjectId(img._id),
            },
            { dynamic: true },
          ),
        })),
      );
    }

    return out;
  });
};

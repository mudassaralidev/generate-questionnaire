import { createContext, useContext, useReducer, useCallback } from 'react';
import {
  generateId,
  reindexOrders,
  normalizeQuestionsOnLoad,
  mergeAndReindexQuestions,
  createQuestionSnapshot,
  deepClone,
  duplicateQuestionWithNewIds,
} from '../utils/helpers';
import { splitQuestionsByDependency } from '../utils/questionUtils';
import { normalizeFormMeta } from '../constants/formMeta';

const BuilderContext = createContext(null);

const initialState = {
  meta: { tenant: '', submission_type: '', form_type: '' },
  configId: null,
  mode: 'create',
  questions: [],
  selectedQuestionId: null,
};

function createQuestionPayload(state, overrides = {}) {
  const isIndependent = overrides.is_independent !== false;
  const newQ = {
    _id: generateId(),
    description: '',
    type: 'text',
    answer_key: '',
    parent_question_ids: [],
    parent_option_ids: [],
    order: state.questions.length + 1,
    is_independent: isIndependent,
    _stashedDependencies: { parent_question_ids: [], parent_option_ids: [] },
    validations: { required: false },
    options: [],
    images: [],
    _resetVersion: 0,
    ...overrides,
  };

  return {
    ...newQ,
    _original: createQuestionSnapshot(newQ),
  };
}

function placeQuestionInSections(updated, remaining) {
  const { independent, dependent } = splitQuestionsByDependency(remaining);

  const insertByOrder = (list, item) =>
    [...list, item].sort((a, b) => a.order - b.order);

  const nextIndependent = updated.is_independent
    ? insertByOrder(independent, updated)
    : independent;
  const nextDependent = updated.is_independent
    ? dependent
    : insertByOrder(dependent, updated);

  return mergeAndReindexQuestions(nextIndependent, nextDependent);
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_CONFIG': {
      const { config, mode } = action.payload;
      return {
        ...state,
        configId: config?._id || null,
        mode,
        meta: config
          ? normalizeFormMeta({
              tenant: config.tenant,
              submission_type: config.submission_type,
              form_type: config.form_type,
              questions_type: config.questions_type,
            })
          : state.meta,
        questions: normalizeQuestionsOnLoad(config?.questions || []),
        selectedQuestionId: null,
      };
    }

    case 'SET_META':
      return { ...state, meta: { ...state.meta, ...action.payload } };

    case 'ADD_QUESTION': {
      const newQ = createQuestionPayload(state, action.payload);
      return {
        ...state,
        questions: reindexOrders([...state.questions, newQ]),
        selectedQuestionId: newQ._id,
      };
    }

    case 'DUPLICATE_QUESTION': {
      const src = state.questions.find((q) => q._id === action.payload);
      if (!src) return state;

      // Fresh question/option/image ObjectIds — never reuse source ids
      const dup = duplicateQuestionWithNewIds(src);

      return {
        ...state,
        questions: reindexOrders([...state.questions, dup]),
        selectedQuestionId: dup._id,
      };
    }

    case 'DELETE_QUESTION': {
      const remaining = state.questions.filter((q) => q._id !== action.payload);
      const cleaned = remaining.map((q) => ({
        ...q,
        parent_question_ids: (q.parent_question_ids || []).filter(
          (id) => String(id) !== String(action.payload)
        ),
        parent_option_ids: (q.parent_option_ids || []).filter((oid) => {
          const deletedQ = state.questions.find((x) => x._id === action.payload);
          const deletedOptionIds = (deletedQ?.options || []).map((o) => String(o._id));
          return !deletedOptionIds.includes(String(oid));
        }),
        _stashedDependencies: q._stashedDependencies
          ? {
              parent_question_ids: (q._stashedDependencies.parent_question_ids || []).filter(
                (id) => String(id) !== String(action.payload)
              ),
              parent_option_ids: (q._stashedDependencies.parent_option_ids || []).filter((oid) => {
                const deletedQ = state.questions.find((x) => x._id === action.payload);
                const deletedOptionIds = (deletedQ?.options || []).map((o) => String(o._id));
                return !deletedOptionIds.includes(String(oid));
              }),
            }
          : q._stashedDependencies,
      }));

      return {
        ...state,
        questions: reindexOrders(cleaned),
        selectedQuestionId:
          state.selectedQuestionId === action.payload ? null : state.selectedQuestionId,
      };
    }

    case 'REORDER_SECTION': {
      const { section, items } = action.payload;
      const { independent, dependent } = splitQuestionsByDependency(state.questions);

      const nextIndependent = section === 'independent' ? items : independent;
      const nextDependent = section === 'dependent' ? items : dependent;

      return {
        ...state,
        questions: mergeAndReindexQuestions(nextIndependent, nextDependent),
      };
    }

    case 'UPDATE_QUESTION': {
      const payload = action.payload;
      const current = state.questions.find((q) => q._id === payload._id);
      if (!current) return state;

      // Only run stash/restore + section move when independence actually toggles.
      // Field updates (including dependency checkbox toggles) spread the full
      // question object, so is_independent is often present even when unchanged.
      const independenceChanged =
        payload.is_independent !== undefined &&
        Boolean(payload.is_independent) !== Boolean(current.is_independent);

      if (independenceChanged) {
        let updated;
        if (payload.is_independent) {
          updated = {
            ...current,
            ...payload,
            is_independent: true,
            _stashedDependencies: {
              parent_question_ids: [...(current.parent_question_ids || [])],
              parent_option_ids: [...(current.parent_option_ids || [])],
            },
            parent_question_ids: [],
            parent_option_ids: [],
          };
        } else {
          const stash = current._stashedDependencies || {
            parent_question_ids: [],
            parent_option_ids: [],
          };
          updated = {
            ...current,
            ...payload,
            is_independent: false,
            parent_question_ids: [...stash.parent_question_ids],
            parent_option_ids: [...stash.parent_option_ids],
          };
        }

        const remaining = state.questions.filter((q) => q._id !== updated._id);
        return {
          ...state,
          questions: placeQuestionInSections(updated, remaining),
        };
      }

      return {
        ...state,
        questions: state.questions.map((q) => {
          if (q._id !== payload._id) return q;
          const merged = { ...q, ...payload };

          if (payload.parent_option_ids || payload.parent_question_ids) {
            merged._stashedDependencies = {
              parent_question_ids: [...(merged.parent_question_ids || [])],
              parent_option_ids: [...(merged.parent_option_ids || [])],
            };
          }

          return merged;
        }),
      };
    }

    case 'RESET_QUESTION': {
      const id = action.payload;
      const current = state.questions.find((q) => q._id === id);
      if (!current?._original) return state;

      const snapshot = deepClone(current._original);
      const restored = {
        ...snapshot,
        _id: current._id,
        // Preserve current drag order / position
        order: current.order,
        _original: current._original,
        _resetVersion: (current._resetVersion || 0) + 1,
        _stashedDependencies: snapshot.is_independent
          ? { parent_question_ids: [], parent_option_ids: [] }
          : {
              parent_question_ids: [...(snapshot.parent_question_ids || [])],
              parent_option_ids: [...(snapshot.parent_option_ids || [])],
            },
      };

      // Independent flag changed — place into the correct section while keeping order
      if (Boolean(current.is_independent) !== Boolean(restored.is_independent)) {
        const remaining = state.questions.filter((q) => q._id !== id);
        return {
          ...state,
          questions: placeQuestionInSections(restored, remaining),
        };
      }

      // Same section — replace in place and keep relative order within the section
      const updatedList = state.questions.map((q) => (q._id === id ? restored : q));
      const { independent, dependent } = splitQuestionsByDependency(updatedList);
      return {
        ...state,
        questions: mergeAndReindexQuestions(independent, dependent),
      };
    }

    case 'SELECT_QUESTION':
      return { ...state, selectedQuestionId: action.payload };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

export function BuilderProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadConfig = useCallback(
    (config, mode) => dispatch({ type: 'LOAD_CONFIG', payload: { config, mode } }),
    []
  );
  const setMeta = useCallback((meta) => dispatch({ type: 'SET_META', payload: meta }), []);
  const addQuestion = useCallback(
    (data) => dispatch({ type: 'ADD_QUESTION', payload: data }),
    []
  );
  const duplicateQuestion = useCallback(
    (id) => dispatch({ type: 'DUPLICATE_QUESTION', payload: id }),
    []
  );
  const deleteQuestion = useCallback(
    (id) => dispatch({ type: 'DELETE_QUESTION', payload: id }),
    []
  );
  const reorderSection = useCallback(
    (section, items) => dispatch({ type: 'REORDER_SECTION', payload: { section, items } }),
    []
  );
  const updateQuestion = useCallback(
    (q) => dispatch({ type: 'UPDATE_QUESTION', payload: q }),
    []
  );
  const resetQuestion = useCallback(
    (id) => dispatch({ type: 'RESET_QUESTION', payload: id }),
    []
  );
  const selectQuestion = useCallback(
    (id) => dispatch({ type: 'SELECT_QUESTION', payload: id }),
    []
  );
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return (
    <BuilderContext.Provider
      value={{
        ...state,
        loadConfig,
        setMeta,
        addQuestion,
        duplicateQuestion,
        deleteQuestion,
        reorderSection,
        updateQuestion,
        resetQuestion,
        selectQuestion,
        reset,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export const useBuilder = () => {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error('useBuilder must be inside BuilderProvider');
  return ctx;
};

import dagre from 'dagre';

const OPTION_TYPES = new Set(['radio', 'checkbox', 'dropdown']);

export const FLOW_NODE_TYPES = {
  question: 'flowQuestion',
  option: 'flowOption',
  image: 'flowImage',
};

export const NODE_DIMENSIONS = {
  question: { width: 208, height: 72 },
  option: { width: 148, height: 44 },
  image: { width: 168, height: 56 },
};

const TYPE_LABELS = {
  radio: 'Radio',
  checkbox: 'Checkbox',
  dropdown: 'Dropdown',
  text: 'Text',
  textarea: 'Textarea',
  number: 'Number',
  date: 'Date',
  image: 'Image',
  dynamic_images: 'Dynamic Images',
  phoneNumber: 'Phone',
  comment: 'Comment',
};

const VALIDATION_LABELS = {
  min_length: 'Min length',
  max_length: 'Max length',
  pattern: 'Pattern',
  contains: 'Contains',
  not_contains: 'Not contains',
  min: 'Min',
  max: 'Max',
  integer_only: 'Integer only',
  min_date: 'Min date',
  max_date: 'Max date',
  must_match_option: 'Must match option',
  min_selections: 'Min selections',
  max_selections: 'Max selections',
  min_images: 'Min images',
  max_images: 'Max images',
};

const sortByOrder = (items = []) =>
  [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const getQuestionTitle = (question) => {
  const description = String(question?.description || '').trim();
  if (description) return description;
  const key = String(question?.answer_key || '').trim();
  return key || 'Untitled question';
};

export const getTypeLabel = (type) => TYPE_LABELS[type] || type || 'Unknown';

export const formatValidationSummary = (validations = {}) => {
  const parts = [];

  if (validations.required) {
    parts.push('Required');
  }

  for (const [key, value] of Object.entries(validations)) {
    if (key === 'required' || key.endsWith('_error') || key.endsWith('_message')) continue;
    if (key === 'error_messages' || key === 'messages') continue;
    if (value === false || value === '' || value == null) continue;
    if (typeof value === 'object') continue;

    const label = VALIDATION_LABELS[key] || key.replace(/_/g, ' ');
    if (value === true) parts.push(label);
    else parts.push(`${label}: ${value}`);
  }

  return parts;
};

/** Custom error text stored as `{rule}_error` fields */
export const formatValidationErrorMessages = (validations = {}) => {
  const results = [];

  for (const [key, value] of Object.entries(validations)) {
    if (!key.endsWith('_error')) continue;
    const text = String(value || '').trim();
    if (!text) continue;

    const rule = key.slice(0, -'_error'.length);
    results.push({
      rule: VALIDATION_LABELS[rule] || rule.replace(/_/g, ' '),
      text,
    });
  }

  for (const [key, value] of Object.entries(validations)) {
    if (!key.endsWith('_message')) continue;
    const text = String(value || '').trim();
    if (!text) continue;

    const rule = key.slice(0, -'_message'.length);
    if (results.some((entry) => entry.rule === (VALIDATION_LABELS[rule] || rule))) continue;
    results.push({
      rule: VALIDATION_LABELS[rule] || rule.replace(/_/g, ' '),
      text,
    });
  }

  const legacy = validations.error_messages || validations.messages;
  if (legacy && typeof legacy === 'object') {
    for (const [rule, text] of Object.entries(legacy)) {
      const trimmed = String(text || '').trim();
      if (!trimmed) continue;
      if (results.some((entry) => entry.rule === (VALIDATION_LABELS[rule] || rule))) continue;
      results.push({
        rule: VALIDATION_LABELS[rule] || rule.replace(/_/g, ' '),
        text: trimmed,
      });
    }
  }

  return results;
};

function getQuestionImageSlots(question) {
  if (question.type === 'dynamic_images') return question.dynamic_images || [];
  if (question.type === 'image') return question.images || [];
  return [];
}

function getImageValidation(image, dynamic = false) {
  if (dynamic) {
    return (
      image.dynamic_image_validations
      || image.image_validation
      || image.image_validations
      || image.validations
      || {}
    );
  }

  return (
    image.image_validations
    || image.image_validation
    || image.validations
    || {}
  );
}

/** Map each option id → dependent questions that list it in parent_option_ids */
function buildChildrenByOptionId(questions) {
  const map = new Map();

  for (const question of sortByOrder(questions)) {
    for (const optionId of question.parent_option_ids || []) {
      const key = String(optionId);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(question);
    }
  }

  return map;
}

function getRootQuestions(questions) {
  return sortByOrder(questions).filter((q) => {
    if (q.is_independent) return true;
    return !(q.parent_option_ids && q.parent_option_ids.length);
  });
}

function createQuestionData(question, displayIndex) {
  const validationsObj = question.validations || {};
  const required = Boolean(validationsObj.required);
  return {
    kind: 'question',
    questionId: String(question._id),
    displayIndex,
    title: getQuestionTitle(question),
    answerKey: question.answer_key || '',
    type: question.type,
    typeLabel: getTypeLabel(question.type),
    required,
    requiredLabel: required ? 'Required' : 'Optional',
    validations: formatValidationSummary(validationsObj),
    errorMessages: formatValidationErrorMessages(validationsObj),
  };
}

/** Build nested preview tree (same branching rules as buildFormFlowGraph) */
export function buildFormFlowPreviewTree(questions = []) {
  const childrenByOptionId = buildChildrenByOptionId(questions);
  const questionNumberById = new Map();

  sortByOrder(questions).forEach((q, idx) => {
    questionNumberById.set(String(q._id), idx + 1);
  });

  const visitQuestion = (question, ancestry) => {
    const qid = String(question._id);
    if (ancestry.has(qid)) return null;

    const displayIndex = questionNumberById.get(qid) || 1;
    const nextAncestry = new Set(ancestry);
    nextAncestry.add(qid);

    const node = {
      data: createQuestionData(question, displayIndex),
      options: [],
      images: [],
    };

    if (OPTION_TYPES.has(question.type)) {
      for (const option of sortByOrder(question.options || [])) {
        const optionId = String(option._id);
        const children = (childrenByOptionId.get(optionId) || [])
          .map((child) => visitQuestion(child, nextAncestry))
          .filter(Boolean);

        node.options.push({
          label: String(option.label || '').trim() || option.value || 'Untitled',
          value: option.value || '',
          children,
        });
      }
    }

    if (question.type === 'image' || question.type === 'dynamic_images') {
      for (const image of sortByOrder(getQuestionImageSlots(question))) {
        const imageValidations = getImageValidation(image, question.type === 'dynamic_images');
        const required = Boolean(imageValidations.required);
        node.images.push({
          title: String(image.title || '').trim() || image.key || 'Untitled image',
          key: image.key || '',
          required,
          requiredLabel: required ? 'Mandatory' : 'Optional',
          validations: formatValidationSummary(imageValidations),
          errorMessages: formatValidationErrorMessages(imageValidations),
        });
      }
    }

    return node;
  };

  return getRootQuestions(questions)
    .map((q) => visitQuestion(q, new Set()))
    .filter(Boolean);
}

export function countFormFlowPreviewStats(tree = []) {
  let nodeCount = 0;
  let edgeCount = 0;

  const walk = (questionNode) => {
    nodeCount += 1;

    for (const image of questionNode.images || []) {
      nodeCount += 1;
      edgeCount += 1;
    }

    for (const option of questionNode.options || []) {
      nodeCount += 1;
      edgeCount += 1;

      for (const child of option.children || []) {
        edgeCount += 1;
        walk(child);
      }
    }
  };

  tree.forEach(walk);
  return { nodeCount, edgeCount };
}

/**
 * Expand questions into a flat graph for legacy React Flow previews.
 * Questions with multiple parent options are duplicated under each branch.
 */
export function buildFormFlowGraph(questions = []) {
  const nodes = [];
  const edges = [];
  const childrenByOptionId = buildChildrenByOptionId(questions);
  const questionNumberById = new Map();

  sortByOrder(questions).forEach((q, idx) => {
    questionNumberById.set(String(q._id), idx + 1);
  });

  let edgeSeq = 0;
  const nextEdgeId = (prefix) => {
    edgeSeq += 1;
    return `${prefix}-${edgeSeq}`;
  };

  const visitQuestion = (question, parentOptionNodeId, ancestry) => {
    const qid = String(question._id);
    if (ancestry.has(qid)) return;

    const questionNodeId = parentOptionNodeId
      ? `q:${qid}<${parentOptionNodeId}`
      : `q:${qid}#root`;

    const displayIndex = questionNumberById.get(qid) || 1;

    nodes.push({
      id: questionNodeId,
      type: FLOW_NODE_TYPES.question,
      position: { x: 0, y: 0 },
      data: createQuestionData(question, displayIndex),
      draggable: false,
      selectable: false,
      connectable: false,
    });

    if (parentOptionNodeId) {
      edges.push({
        id: nextEdgeId(`dep-${parentOptionNodeId}-${questionNodeId}`),
        source: parentOptionNodeId,
        target: questionNodeId,
        type: 'step',
        style: {
          stroke: '#64748b',
          strokeWidth: 1.5,
        },
      });
    }

    const nextAncestry = new Set(ancestry);
    nextAncestry.add(qid);

    if (OPTION_TYPES.has(question.type)) {
      for (const option of sortByOrder(question.options || [])) {
        const optionId = String(option._id);
        const optionNodeId = `o:${optionId}<${questionNodeId}`;

        nodes.push({
          id: optionNodeId,
          type: FLOW_NODE_TYPES.option,
          position: { x: 0, y: 0 },
          data: {
            kind: 'option',
            optionId,
            label: String(option.label || '').trim() || option.value || 'Untitled',
            value: option.value || '',
          },
          draggable: false,
          selectable: false,
          connectable: false,
        });

        edges.push({
          id: nextEdgeId(`opt-${questionNodeId}-${optionNodeId}`),
          source: questionNodeId,
          target: optionNodeId,
          type: 'step',
          style: { stroke: '#94a3b8', strokeWidth: 1.5 },
        });

        const dependents = childrenByOptionId.get(optionId) || [];
        for (const child of dependents) {
          visitQuestion(child, optionNodeId, nextAncestry);
        }
      }
    }

    if (question.type === 'image' || question.type === 'dynamic_images') {
      for (const image of sortByOrder(getQuestionImageSlots(question))) {
        const imageId = String(image._id || image.key || Math.random());
        const imageNodeId = `i:${imageId}<${questionNodeId}`;
        const imageValidations = getImageValidation(image, question.type === 'dynamic_images');
        const required = Boolean(imageValidations.required);

        nodes.push({
          id: imageNodeId,
          type: FLOW_NODE_TYPES.image,
          position: { x: 0, y: 0 },
          data: {
            kind: 'image',
            imageId,
            title: String(image.title || '').trim() || image.key || 'Untitled image',
            required,
            requiredLabel: required ? 'Mandatory' : 'Optional',
          },
          draggable: false,
          selectable: false,
          connectable: false,
        });

        edges.push({
          id: nextEdgeId(`img-${questionNodeId}-${imageNodeId}`),
          source: questionNodeId,
          target: imageNodeId,
          type: 'step',
          style: { stroke: '#fdba74', strokeWidth: 1.5 },
        });
      }
    }
  };

  for (const root of getRootQuestions(questions)) {
    visitQuestion(root, null, new Set());
  }

  return { nodes, edges };
}

export function layoutFormFlowGraph(nodes, edges, direction = 'TB') {
  if (!nodes.length) return nodes;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    ranksep: direction === 'TB' ? 72 : 64,
    nodesep: direction === 'TB' ? 48 : 40,
    edgesep: 16,
    marginx: 56,
    marginy: 56,
    align: undefined,
    acyclicer: 'greedy',
  });

  for (const node of nodes) {
    const kind =
      node.type === FLOW_NODE_TYPES.option
        ? 'option'
        : node.type === FLOW_NODE_TYPES.image
          ? 'image'
          : 'question';
    const { width, height } = NODE_DIMENSIONS[kind];
    g.setNode(node.id, { width, height });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const kind =
      node.type === FLOW_NODE_TYPES.option
        ? 'option'
        : node.type === FLOW_NODE_TYPES.image
          ? 'image'
          : 'question';
    const { width, height } = NODE_DIMENSIONS[kind];
    const pos = g.node(node.id);

    return {
      ...node,
      position: {
        x: Math.round(pos.x - width / 2),
        y: Math.round(pos.y - height / 2),
      },
      style: { width, height },
    };
  });
}

/** Build + layout graph ready for React Flow (always top-to-bottom) */
export function flowChartTreeHelper(questions = []) {
  const { nodes, edges } = buildFormFlowGraph(questions);
  return {
    nodes: layoutFormFlowGraph(nodes, edges, 'TB'),
    edges,
  };
}

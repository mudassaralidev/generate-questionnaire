import { errorKeyForRule } from "../../utils/validationUtils";

const TEXT_TYPES = ["text", "textarea"];
const NUMBER_TYPES = ["number"];
const DATE_TYPES = ["date"];

const POSITIVE_NUMBER_RULE_KEYS = new Set([
  "min_length",
  "max_length",
  "min_selections",
  "max_selections",
  "min_images",
  "max_images",
]);

function parseRuleNumberValue(ruleKey, rawValue) {
  if (rawValue === "") return "";

  const num = Number(rawValue);
  if (!Number.isFinite(num)) return "";

  if (POSITIVE_NUMBER_RULE_KEYS.has(ruleKey) && num < 1) {
    return null;
  }

  return num;
}

const VALIDATION_RULES = {
  text: [
    {
      key: "min_length",
      label: "Minimum length",
      type: "number",
      placeholder: "e.g. 2",
      positiveOnly: true,
    },
    {
      key: "max_length",
      label: "Maximum length",
      type: "number",
      placeholder: "e.g. 100",
      positiveOnly: true,
    },
    {
      key: "pattern",
      label: "Regular expression",
      type: "text",
      placeholder: "e.g. ^[A-Za-z]+$",
    },
    {
      key: "contains",
      label: "Text contains",
      type: "text",
      placeholder: "e.g. @gmail.com",
    },
    {
      key: "not_contains",
      label: "Text does not contain",
      type: "text",
      placeholder: "e.g. spam",
    },
  ],
  textarea: [
    {
      key: "min_length",
      label: "Minimum length",
      type: "number",
      placeholder: "e.g. 10",
      positiveOnly: true,
    },
    {
      key: "max_length",
      label: "Maximum length",
      type: "number",
      placeholder: "e.g. 500",
      positiveOnly: true,
    },
    {
      key: "pattern",
      label: "Regular expression",
      type: "text",
      placeholder: "e.g. ^[\\s\\S]+$",
    },
  ],
  number: [
    {
      key: "min",
      label: "Minimum value",
      type: "number",
      placeholder: "e.g. 0",
    },
    {
      key: "max",
      label: "Maximum value",
      type: "number",
      placeholder: "e.g. 100",
    },
    { key: "integer_only", label: "Integer only", type: "checkbox" },
  ],
  date: [
    { key: "min_date", label: "Minimum date", type: "date" },
    { key: "max_date", label: "Maximum date", type: "date" },
  ],
  dropdown: [
    {
      key: "must_match_option",
      label: "Must match one option",
      type: "checkbox",
    },
  ],
  radio: [],
  checkbox: [
    {
      key: "min_selections",
      label: "Minimum selections",
      type: "number",
      placeholder: "e.g. 1",
      positiveOnly: true,
    },
    {
      key: "max_selections",
      label: "Maximum selections",
      type: "number",
      placeholder: "e.g. 3",
      positiveOnly: true,
    },
  ],
  image_slot: [],
  dynamic_images: [
    {
      key: "min_images",
      label: "Minimum images",
      type: "number",
      placeholder: "e.g. 1",
      positiveOnly: true,
    },
    {
      key: "max_images",
      label: "Maximum images",
      type: "number",
      placeholder: "e.g. 5",
      positiveOnly: true,
    },
  ],
};

function getRulesForType(type) {
  if (TEXT_TYPES.includes(type)) return VALIDATION_RULES.text;
  if (NUMBER_TYPES.includes(type)) return VALIDATION_RULES.number;
  if (DATE_TYPES.includes(type)) return VALIDATION_RULES.date;
  return VALIDATION_RULES[type] || [];
}

function isRuleActive(rule, validations) {
  if (rule.key === "required") return Boolean(validations.required);
  const value = validations[rule.key];
  if (rule.type === "checkbox") return Boolean(value);
  return value !== "" && value !== null && value !== undefined;
}

function ValidationMessageInput({ message, onChange }) {
  return (
    <div className="mt-1.5">
      <label className="text-xs text-gray-500">Custom error message</label>
      <input
        className="input mt-1 text-sm"
        type="text"
        placeholder="Optional message shown when validation fails"
        value={message}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default function ValidationsEditor({
  questionType,
  validations = {},
  onChange,
  requiredLabel = "Required field",
  requiredHelp,
}) {
  const rules = getRulesForType(questionType);

  const updateValidation = (key, value) => {
    const next = { ...validations, [key]: value };

    if (
      value === "" ||
      value === null ||
      value === undefined ||
      value === false
    ) {
      delete next[key];
      delete next[errorKeyForRule(key)];
    }

    onChange(next);
  };

  const updateRuleMessage = (ruleKey, message) => {
    const errorKey = errorKeyForRule(ruleKey);
    const next = { ...validations };

    if (message == null || message === "") {
      delete next[errorKey];
    } else {
      next[errorKey] = message;
    }

    onChange(next);
  };

  const renderRule = (rule) => {
    const active = isRuleActive(rule, validations);
    const message = validations[errorKeyForRule(rule.key)] || "";

    return (
      <div
        key={rule.key}
        className="rounded-md border border-gray-200 bg-white p-3"
      >
        {rule.type === "checkbox" ? (
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={validations[rule.key] || false}
              onChange={(e) => updateValidation(rule.key, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">{rule.label}</span>
          </label>
        ) : (
          <>
            <label className="label">{rule.label}</label>
            <input
              className="input"
              type={rule.type}
              placeholder={rule.placeholder}
              min={rule.positiveOnly ? 1 : undefined}
              step={rule.positiveOnly ? 1 : undefined}
              value={validations[rule.key] ?? ""}
              onChange={(e) => {
                if (rule.type !== "number") {
                  updateValidation(rule.key, e.target.value);
                  return;
                }

                const parsed = parseRuleNumberValue(rule.key, e.target.value);
                if (parsed === null) return;
                updateValidation(rule.key, parsed);
              }}
            />
          </>
        )}

        {active && (
          <ValidationMessageInput
            message={message}
            onChange={(value) => updateRuleMessage(rule.key, value)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-gray-200 bg-white p-3">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={validations.required || false}
            onChange={(e) => updateValidation("required", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">
            {requiredLabel}
          </span>
        </label>
        {requiredHelp && (
          <p className="mt-1.5 text-xs text-gray-500">{requiredHelp}</p>
        )}

        {validations.required && (
          <ValidationMessageInput
            message={validations.required_error || ""}
            onChange={(value) => updateRuleMessage("required", value)}
          />
        )}
      </div>

      {rules.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Response validation
          </p>
          {rules.map(renderRule)}
        </div>
      )}
    </div>
  );
}

import { errorKeyForRule } from "../../utils/validationUtils";
import SearchableSelect from "../common/SearchableSelect";
import { COUNTRY_OPTIONS } from "../../constants/countries";
import TranslatableField from "../common/TranslatableField";
import { translationKeyFor } from "../../constants/formMeta";

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
      key: "is_readonly",
      label: "Read Only?",
      type: "checkbox",
      skipErrorMessage: true,
    },
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
      key: "is_readonly",
      label: "Read Only",
      type: "checkbox",
      skipErrorMessage: true,
    },
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
    {
      key: "is_readonly",
      label: "Read Only?",
      type: "checkbox",
      skipErrorMessage: true,
    },
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

  phone_number: [
    {
      key: "region_code",
      label: "Country",
      type: "country_select",
      placeholder: "Search country...",
      skipErrorMessage: false,
    },
  ],
};

const EXTERNAL_SOURCE_CHILD_RULES = [
  {
    key: "is_autofill",
    label: "Is autofill",
    type: "checkbox",
    skipErrorMessage: true,
  },
  {
    key: "fill_from",
    label: "Fill from",
    type: "text",
    placeholder: "e.g. parent_field_key",
    skipErrorMessage: true,
  },
];

function getRulesForType(type) {
  if (TEXT_TYPES.includes(type)) return VALIDATION_RULES.text;
  if (NUMBER_TYPES.includes(type)) return VALIDATION_RULES.number;
  if (DATE_TYPES.includes(type)) return VALIDATION_RULES.date;
  return VALIDATION_RULES[type] || [];
}

function isRuleActive(rule, validations) {
  if (rule.key === "required") return Boolean(validations.required);
  if (rule.key === "is_readonly") return Boolean(validations.is_readonly);
  if (rule.key === "is_autofill") return Boolean(validations.is_autofill);
  const value = validations[rule.key];
  if (rule.type === "checkbox") return Boolean(value);
  return value !== "" && value !== null && value !== undefined;
}

function ValidationMessageInput({
  id,
  message,
  translationMessage,
  onChange,
  onTranslationChange,
}) {
  return (
    <div className="mt-1.5">
      <TranslatableField
        id={id}
        label="Custom error message"
        value={message}
        translationValue={translationMessage}
        placeholder="Optional message shown when validation fails"
        inputClassName="input mt-1 text-sm"
        onChange={onChange}
        onTranslationChange={onTranslationChange}
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
  isExternalSourceChild = false,
}) {
  const rules = getRulesForType(questionType);

  const updateValidation = (key, value) => {
    const next = { ...validations, [key]: value };

    // Boolean flags that must persist false
    if (key === "is_readonly" || key === "is_autofill") {
      next[key] = Boolean(value);
      onChange(next);
      return;
    }

    if (
      value === "" ||
      value === null ||
      value === undefined ||
      value === false
    ) {
      delete next[key];
      const errorKey = errorKeyForRule(key);
      delete next[errorKey];
      delete next[translationKeyFor(errorKey)];
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

  const updateRuleMessageTranslation = (ruleKey, message) => {
    const errorKey = errorKeyForRule(ruleKey);
    const translationKey = translationKeyFor(errorKey);
    const next = { ...validations };

    if (message == null || message === "") {
      delete next[translationKey];
    } else {
      next[translationKey] = message;
    }

    onChange(next);
  };

  const renderRule = (rule) => {
    const active = isRuleActive(rule, validations);
    const errorKey = errorKeyForRule(rule.key);
    const message = validations[errorKey] || "";
    const translationMessage =
      validations[translationKeyFor(errorKey)] || "";

    return (
      <div
        key={rule.key}
        className="rounded-md border border-gray-200 bg-white p-3"
      >
        {rule.type === "checkbox" ? (
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(validations[rule.key])}
              onChange={(e) => updateValidation(rule.key, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">{rule.label}</span>
          </label>
        ) : rule.type === "country_select" ? (
          <SearchableSelect
            label={rule.label}
            options={COUNTRY_OPTIONS}
            value={validations[rule.key] || ""}
            onChange={(e) => updateValidation(rule.key, e.target.value)}
            placeholder={rule.placeholder || "Search country..."}
          />
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

        {active && !rule.skipErrorMessage && (
          <ValidationMessageInput
            id={`rule-msg-${rule.key}`}
            message={message}
            translationMessage={translationMessage}
            onChange={(value) => updateRuleMessage(rule.key, value)}
            onTranslationChange={(value) =>
              updateRuleMessageTranslation(rule.key, value)
            }
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
            id="rule-msg-required"
            message={validations.required_error || ""}
            translationMessage={
              validations[translationKeyFor("required_error")] || ""
            }
            onChange={(value) => updateRuleMessage("required", value)}
            onTranslationChange={(value) =>
              updateRuleMessageTranslation("required", value)
            }
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

      {isExternalSourceChild && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Parent Autofill Dependency
          </p>
          {EXTERNAL_SOURCE_CHILD_RULES.map(renderRule)}
        </div>
      )}
    </div>
  );
}

import { useBuilder } from "../../context/BuilderContext";
import { translationKeyFor } from "../../constants/formMeta";

/**
 * Renders a primary string input plus an optional translation sibling
 * when `requires_translation` is enabled on the questionnaire.
 */
export default function TranslatableField({
  id,
  label,
  value = "",
  translationValue = "",
  onChange,
  onTranslationChange,
  placeholder = "",
  translationPlaceholder,
  required = false,
  multiline = false,
  className = "",
  inputClassName = "input",
  useBlur = false,
}) {
  const { translation } = useBuilder();
  const requires_translation = Boolean(translation?.requires_translation);
  const translation_language = translation?.translation_language || "";
  const showTranslation = requires_translation;
  const translationLabel = translation_language
    ? `${label ? `${label} ` : ""}(${translation_language})`
    : label
      ? `${label} translation`
      : "Translation";

  const InputTag = multiline ? "textarea" : "input";
  const sharedProps = {
    className: `${inputClassName}${multiline ? " min-h-[100px]" : ""}`,
    placeholder,
  };

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <div>
        {label && (
          <label className="label" htmlFor={id}>
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <InputTag
          id={id}
          {...sharedProps}
          {...(useBlur
            ? {
                defaultValue: value,
                onBlur: (e) => onChange?.(e.target.value),
              }
            : {
                value: value ?? "",
                onChange: (e) => onChange?.(e.target.value),
              })}
          {...(!multiline ? { type: "text" } : {})}
        />
      </div>

      {showTranslation && (
        <div>
          <label className="label text-xs text-primary-700" htmlFor={`${id}_translation`}>
            {translationLabel}
          </label>
          <InputTag
            id={`${id}_translation`}
            {...sharedProps}
            className={`${sharedProps.className} border-primary-200 bg-primary-50/40`}
            placeholder={
              translationPlaceholder ||
              (translation_language
                ? `Translation in ${translation_language}`
                : "Translation")
            }
            {...(useBlur
              ? {
                  defaultValue: translationValue,
                  onBlur: (e) => onTranslationChange?.(e.target.value),
                }
              : {
                  value: translationValue ?? "",
                  onChange: (e) => onTranslationChange?.(e.target.value),
                })}
            {...(!multiline ? { type: "text" } : {})}
          />
        </div>
      )}
    </div>
  );
}

export { translationKeyFor };

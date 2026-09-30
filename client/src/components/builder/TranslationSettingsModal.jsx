import { useEffect, useState } from "react";
import SearchableSelect from "../common/SearchableSelect";
import {
  ENGLISH_LANGUAGE,
  getDefaultLanguageOptions,
  normalizeTranslationMeta,
} from "../../constants/formMeta";

export default function TranslationSettingsModal({
  open,
  initialValues = {},
  onCancel,
  onConfirm,
}) {
  const [translationLanguage, setTranslationLanguage] = useState("");
  const [defaultLanguage, setDefaultLanguage] = useState(ENGLISH_LANGUAGE);
  const [verifyButtonTranslation, setVerifyButtonTranslation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const normalized = normalizeTranslationMeta({
      translation: {
        ...initialValues,
        requires_translation: true,
      },
    });
    setTranslationLanguage(normalized.translation_language || "");
    setDefaultLanguage(normalized.default_language || ENGLISH_LANGUAGE);
    setVerifyButtonTranslation(normalized.verify_button_translation || "");
    setError("");
  }, [open, initialValues]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const options = getDefaultLanguageOptions(translationLanguage);

  const handleConfirm = () => {
    const trimmed = String(translationLanguage || "").trim();
    const verifyTrimmed = String(verifyButtonTranslation || "").trim();

    if (!trimmed) {
      setError("Translation language is required.");
      return;
    }
    if (!verifyTrimmed) {
      setError("Verify button translation is required.");
      return;
    }

    const next = normalizeTranslationMeta({
      translation: {
        requires_translation: true,
        translation_language: trimmed,
        default_language:
          defaultLanguage === ENGLISH_LANGUAGE ? ENGLISH_LANGUAGE : trimmed,
        verify_button_translation: verifyTrimmed,
      },
    });

    onConfirm?.(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close translation settings"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="translation-settings-title"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        <header className="border-b border-gray-100 bg-gray-50 px-5 py-4 sm:px-6">
          <h2
            id="translation-settings-title"
            className="text-base font-semibold text-gray-900 sm:text-lg"
          >
            Enable Translation
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter the translation language, default language, and verify button
            translation for this questionnaire.
          </p>
        </header>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div>
            <label className="label" htmlFor="modal_translation_language">
              Translation language
              <span className="ml-0.5 text-red-500">*</span>
            </label>
            <input
              id="modal_translation_language"
              className="input"
              type="text"
              placeholder="e.g العربية (al-ʿArabiyya) for Saudia, limba română for Romania etc..."
              value={translationLanguage}
              onChange={(e) => {
                const value = e.target.value;
                setTranslationLanguage(value);
                if (defaultLanguage !== ENGLISH_LANGUAGE) {
                  setDefaultLanguage(value.trim() || ENGLISH_LANGUAGE);
                }
              }}
            />
          </div>

          <SearchableSelect
            label="Default language"
            value={
              defaultLanguage === ENGLISH_LANGUAGE
                ? ENGLISH_LANGUAGE
                : translationLanguage || defaultLanguage
            }
            onChange={(e) => {
              const selected = e.target.value;
              setDefaultLanguage(
                selected === ENGLISH_LANGUAGE
                  ? ENGLISH_LANGUAGE
                  : String(translationLanguage || "").trim() || selected,
              );
            }}
            options={options}
            placeholder="Select default language..."
          />

          <div>
            <label className="label" htmlFor="modal_verify_button_translation">
              Verify Button Translation
              <span className="ml-0.5 text-red-500">*</span>
            </label>
            <input
              id="modal_verify_button_translation"
              className="input"
              type="text"
              placeholder="e.g. Verify / تحقق"
              value={verifyButtonTranslation}
              onChange={(e) => setVerifyButtonTranslation(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-gray-200 bg-white px-5 py-3.5 sm:px-6">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className="btn-primary">
            Enable
          </button>
        </footer>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import SearchableSelect from "../common/SearchableSelect";
import { COUNTRY_OPTIONS } from "../../constants/countries";
import {
  ENGLISH_LANGUAGE,
  getDefaultLanguageOptions,
  isEnglishDefaultLanguage,
  normalizeTranslationMeta,
} from "../../constants/formMeta";

export default function TranslationSettingsModal({
  open,
  initialValues = {},
  onCancel,
  onConfirm,
}) {
  const [translationLanguageCode, setTranslationLanguageCode] = useState("");
  const [translationLanguage, setTranslationLanguage] = useState("");
  const [defaultLanguage, setDefaultLanguage] = useState(ENGLISH_LANGUAGE);
  const [verifyButtonTranslation, setVerifyButtonTranslation] = useState("");
  const [supportOverallApp, setSupportOverallApp] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const normalized = normalizeTranslationMeta({
      translation: {
        ...initialValues,
        requires_translation: true,
      },
    });
    setTranslationLanguageCode(normalized.translation_language_code || "");
    setTranslationLanguage(normalized.translation_language_title || "");
    setDefaultLanguage(normalized.default_language || ENGLISH_LANGUAGE);
    setVerifyButtonTranslation(normalized.verify_button_translation || "");
    setSupportOverallApp(
      Boolean(normalized.translation_support_to_overall_app),
    );
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

  const options = getDefaultLanguageOptions({
    translationLanguage,
    translationLanguageCode,
  });

  const handleCountryChange = (e) => {
    const code = String(e.target.value || "")
      .trim()
      .toUpperCase();
    setTranslationLanguageCode(code);
    if (!isEnglishDefaultLanguage(defaultLanguage)) {
      setDefaultLanguage(code || ENGLISH_LANGUAGE);
    }
  };

  const handleConfirm = () => {
    const code = String(translationLanguageCode || "")
      .trim()
      .toUpperCase();
    const title = String(translationLanguage || "").trim();
    const verifyTrimmed = String(verifyButtonTranslation || "").trim();

    if (!code) {
      setError("Please select a translation country.");
      return;
    }
    if (!title) {
      setError("Translation language title is required.");
      return;
    }
    if (!verifyTrimmed) {
      setError("Verify button translation is required.");
      return;
    }

    const next = normalizeTranslationMeta({
      translation: {
        requires_translation: true,
        translation_language_code: code,
        translation_language_title: title,
        default_language: isEnglishDefaultLanguage(defaultLanguage)
          ? ENGLISH_LANGUAGE
          : code,
        verify_button_translation: verifyTrimmed,
        translation_support_to_overall_app: supportOverallApp,
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
            Select the country, language title, default language, and verify
            button translation for this questionnaire.
          </p>
        </header>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <SearchableSelect
            label="Translation country"
            value={translationLanguageCode}
            onChange={handleCountryChange}
            options={COUNTRY_OPTIONS.filter((opt) => opt.value)}
            placeholder="Search country..."
          />

          {Boolean(translationLanguageCode) && (
            <div>
              <label className="label" htmlFor="modal_translation_language">
                Translation Language Title
                <span className="ml-0.5 text-red-500">*</span>
              </label>
              <input
                id="modal_translation_language"
                className="input"
                type="text"
                placeholder="e.g. العربية (al-ʿArabiyya), limba română..."
                value={translationLanguage}
                onChange={(e) => setTranslationLanguage(e.target.value)}
              />
            </div>
          )}

          {Boolean(translationLanguageCode) && (
            <SearchableSelect
              label="Default language"
              value={
                isEnglishDefaultLanguage(defaultLanguage)
                  ? ENGLISH_LANGUAGE
                  : translationLanguageCode || defaultLanguage
              }
              onChange={(e) => {
                const selected = e.target.value;
                setDefaultLanguage(
                  isEnglishDefaultLanguage(selected)
                    ? ENGLISH_LANGUAGE
                    : translationLanguageCode || selected,
                );
              }}
              options={options}
              placeholder="Select default language..."
            />
          )}

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

          <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
            <input
              type="checkbox"
              checked={supportOverallApp}
              onChange={(e) => setSupportOverallApp(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>
              <span className="block text-sm font-medium text-gray-700">
                Translation Support To Overall app
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Sync language options to FIELD users for this tenant on save.
              </span>
            </span>
          </label>

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

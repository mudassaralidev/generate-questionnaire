import { useBuilder } from "../../context/BuilderContext";
import { defaultValidations } from "../../utils/validationUtils";
import OptionsEditor from "./OptionsEditor";
import ImagesEditor from "./ImagesEditor";
import DependencyBuilder from "./DependencyBuilder";
import ValidationsEditor from "./ValidationsEditor";

const QUESTION_TYPES = [
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "dropdown", label: "Dropdown" },
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "image", label: "Image" },
  { value: "dynamic_images", label: "Dynamic Images" },
];

const OPTION_TYPES = ["radio", "checkbox", "dropdown"];
const IMAGE_TYPES = ["image", "dynamic_images"];

const isImageType = (type) => IMAGE_TYPES.includes(type);

export default function QuestionEditor() {
  const { questions, selectedQuestionId, updateQuestion, resetQuestion, mode } =
    useBuilder();
  const question = questions.find((q) => q._id === selectedQuestionId);

  if (!question) {
    return (
      <div className="flex h-full items-center justify-center text-center p-8">
        <div>
          <div className="mx-auto mb-4 text-gray-300">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-400">Select a question to edit</p>
        </div>
      </div>
    );
  }

  const editorKey = `${question._id}-${question._resetVersion || 0}`;
  const canReset = mode === "edit" && Boolean(question._original);

  const handleFieldChange = (field) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    updateQuestion({ ...question, [field]: val });
  };

  const handleIndependentToggle = (e) => {
    updateQuestion({ ...question, is_independent: e.target.checked });
  };

  const handleValidationsChange = (validations) => {
    updateQuestion({ ...question, validations });
  };

  const handleOptionsChange = (opts) =>
    updateQuestion({ ...question, options: opts });
  const handleImagesChange = (imgs) =>
    updateQuestion({ ...question, images: imgs });
  const handleDynamicImagesChange = (imgs) =>
    updateQuestion({ ...question, dynamic_images: imgs });
  const handleDependencyChange = (dep) =>
    updateQuestion({ ...question, ...dep });

  const handleReset = () => {
    if (!canReset) return;
    resetQuestion(question._id);
  };

  const handleTypeChange = (e) => {
    const nextType = e.target.value;
    updateQuestion({
      ...question,
      type: nextType,
      options: [],
      images: [],
      dynamic_images: [],
      validations: isImageType(nextType)
        ? defaultValidations()
        : {
            required: question.validations?.required || false,
            ...(question.validations?.required_error
              ? { required_error: question.validations.required_error }
              : {}),
          },
    });
  };

  return (
    <div className="h-full overflow-y-auto" key={editorKey}>
      <div className="p-5 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Question Editor
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono">
              Order #{question.order}
            </span>
            {canReset && (
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary py-1.5 text-xs"
                title="Reset this question to its previous values (keeps current order)"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset Question
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg border border-gray-200 p-3 bg-gray-50 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={question.is_independent}
                onChange={handleIndependentToggle}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Independent question?
              </span>
            </label>
            <p className="text-xs text-gray-500">
              Independent questions are shown without parent dependencies.
              Uncheck to configure dependencies.
            </p>
          </div>

          <div>
            <label className="label">
              Answer Key <span className="text-red-500">*</span>
            </label>
            <input
              className="input font-mono"
              placeholder="e.g. first_name"
              defaultValue={question.answer_key}
              onBlur={handleFieldChange("answer_key")}
            />
          </div>

          <div>
            <label className="label">Type</label>
            <select
              className="input bg-white"
              value={question.type}
              onChange={handleTypeChange}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {OPTION_TYPES.includes(question.type) && (
          <div className="rounded-lg border border-gray-200 p-4">
            <OptionsEditor
              options={question.options || []}
              onChange={handleOptionsChange}
            />
          </div>
        )}

        <div>
          <label className="label">Description</label>
          <input
            className="input"
            placeholder="Question text displayed to the user"
            defaultValue={question.description}
            onBlur={handleFieldChange("description")}
          />
        </div>

        {!isImageType(question.type) ? (
          <div className="rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Validations
            </h4>
            <ValidationsEditor
              questionType={question.type}
              validations={question.validations || {}}
              onChange={handleValidationsChange}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-sm text-gray-600">
              Question-level validations are disabled for image questions.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Configure validation rules on each image slot below.
            </p>
          </div>
        )}

        {question.type === "image" && (
          <div className="rounded-lg border border-gray-200 p-4">
            <ImagesEditor
              images={question.images || []}
              onChange={handleImagesChange}
              validationEditorType="image_slot"
            />
          </div>
        )}

        {question.type === "dynamic_images" && (
          <div className="rounded-lg border border-gray-200 p-4">
            <ImagesEditor
              images={question.dynamic_images || []}
              onChange={handleDynamicImagesChange}
              listLabel="Dynamic Images"
              addLabel="+ Add Dynamic Image"
              emptyLabel="No dynamic images yet. Add at least one."
              validationEditorType="dynamic_images"
            />
          </div>
        )}

        {!question.is_independent && (
          <div className="rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Dependencies
            </h4>
            <DependencyBuilder
              question={question}
              onChange={handleDependencyChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

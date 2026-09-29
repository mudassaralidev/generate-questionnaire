import { useBuilder } from "../../context/BuilderContext";
import { EMPTY_POP_DATA, translationKeyFor } from "../../constants/formMeta";
import TranslatableField from "../common/TranslatableField";

const FIELDS = [
  {
    key: "confirmation_text",
    label: "Confirmation text",
    placeholder: "e.g. Are you sure you want to submit?",
    multiline: true,
  },
  {
    key: "confirm_button_text",
    label: "Confirm button text",
    placeholder: "e.g. Confirm",
  },
  {
    key: "cancel_button_text",
    label: "Cancel button text",
    placeholder: "e.g. Cancel",
  },
];

export default function ConfirmationPopupEditor() {
  const { confirmation_popup, updatePopData } = useBuilder();
  const data = confirmation_popup || EMPTY_POP_DATA;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Confirmation Pop Up
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure the confirmation dialog shown to users. All fields are
            required.
          </p>
        </div>

        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          {FIELDS.map((field) => (
            <TranslatableField
              key={field.key}
              id={field.key}
              label={field.label}
              required
              multiline={field.multiline}
              placeholder={field.placeholder}
              value={data[field.key] || ""}
              translationValue={data[translationKeyFor(field.key)] || ""}
              onChange={(value) => updatePopData({ [field.key]: value })}
              onTranslationChange={(value) =>
                updatePopData({ [translationKeyFor(field.key)]: value })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

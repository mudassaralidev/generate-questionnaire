import { useBuilder } from "../../context/BuilderContext";
import { EMPTY_POP_DATA } from "../../constants/formMeta";

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
            <div key={field.key}>
              <label className="label" htmlFor={field.key}>
                {field.label}
                <span className="ml-0.5 text-red-500">*</span>
              </label>
              {field.multiline ? (
                <textarea
                  id={field.key}
                  className="input min-h-[100px]"
                  placeholder={field.placeholder}
                  value={data[field.key] || ""}
                  onChange={(e) =>
                    updatePopData({ [field.key]: e.target.value })
                  }
                />
              ) : (
                <input
                  id={field.key}
                  className="input"
                  type="text"
                  placeholder={field.placeholder}
                  value={data[field.key] || ""}
                  onChange={(e) =>
                    updatePopData({ [field.key]: e.target.value })
                  }
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

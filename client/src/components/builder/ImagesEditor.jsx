import { generateId, reindexOrders } from "../../utils/helpers";
import {
  defaultImageValidation,
  getImageValidationsFieldName,
  getImageValidationsFromSlot,
} from "../../utils/validationUtils";
import SortableList from "../common/SortableList";
import ValidationsEditor from "./ValidationsEditor";

function ImageSlotCard({
  img,
  index,
  onUpdate,
  onRemove,
  validationEditorType,
  validationField,
}) {
  const displayName =
    img.title?.trim() || img.key?.trim() || `Image ${index + 1}`;
  const imageValidations =
    getImageValidationsFromSlot(img, {
      dynamic: validationEditorType === "dynamic_images",
    }) || defaultImageValidation();
  const isRequired = Boolean(imageValidations.required);

  const updateField = (field, value) => {
    onUpdate({ ...img, [field]: value });
  };

  return (
    <article className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {displayName}
          </p>
          <p className="text-xs text-gray-400">Slot #{index + 1}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isRequired && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
              Required
            </span>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Remove image slot"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label text-sm">Key</label>
            <input
              className="input font-mono"
              placeholder="e.g. not_potential_shop_inside"
              value={img.key}
              onChange={(e) => updateField("key", e.target.value)}
            />
          </div>
          <div>
            <label className="label text-sm">Display title</label>
            <input
              className="input"
              placeholder="e.g. Inside Image"
              value={img.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-900/80 mb-3">
            Image validation
          </h4>
          <ValidationsEditor
            questionType={validationEditorType}
            validations={imageValidations}
            onChange={(next) => updateField(validationField, next)}
            requiredLabel="Required upload"
            requiredHelp="This image must be uploaded before the form can be submitted."
          />
        </div>
      </div>
    </article>
  );
}

export default function ImagesEditor({
  images = [],
  onChange,
  listLabel = "Images",
  addLabel = "+ Add Image",
  emptyLabel = "No images yet. Add at least one.",
  validationEditorType = "image_slot",
}) {
  const isDynamic = validationEditorType === "dynamic_images";
  const validationField = getImageValidationsFieldName(isDynamic);

  const add = () => {
    onChange([
      ...images,
      {
        _id: generateId(),
        key: "",
        title: "",
        [validationField]: defaultImageValidation(),
        order: images.length + 1,
      },
    ]);
  };

  const updateAt = (idx, nextImage) => {
    onChange(images.map((img, i) => (i === idx ? nextImage : img)));
  };

  const remove = (idx) =>
    onChange(reindexOrders(images.filter((_, i) => i !== idx)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="label mb-0">{listLabel}</span>
        <button type="button" onClick={add} className="btn-secondary py-1 text-xs">
          {addLabel}
        </button>
      </div>

      {images.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">{emptyLabel}</p>
      ) : (
        <SortableList
          items={images}
          onReorder={onChange}
          getItemId={(img, idx) => img._id || `img-${idx}`}
          className="space-y-4"
          renderItem={(img, idx) => (
            <ImageSlotCard
              img={img}
              index={idx}
              validationEditorType={validationEditorType}
              validationField={validationField}
              onUpdate={(next) => updateAt(idx, next)}
              onRemove={() => remove(idx)}
            />
          )}
        />
      )}
    </div>
  );
}

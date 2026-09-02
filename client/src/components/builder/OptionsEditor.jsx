import { generateId, reindexOrders } from '../../utils/helpers';
import SortableList from '../common/SortableList';

export default function OptionsEditor({ options = [], onChange }) {
  const add = () => {
    onChange([
      ...options,
      { _id: generateId(), label: '', value: '', order: options.length + 1 },
    ]);
  };

  const update = (idx, field, value) => {
    onChange(options.map((o, i) => (i === idx ? { ...o, [field]: value } : o)));
  };

  const remove = (idx) => onChange(reindexOrders(options.filter((_, i) => i !== idx)));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="label mb-0">Options</span>
        <button type="button" onClick={add} className="btn-secondary py-1 text-xs">
          + Add Option
        </button>
      </div>

      {options.length === 0 && (
        <p className="text-xs text-gray-400 py-2">No options yet. Add at least one.</p>
      )}

      <SortableList
        items={options}
        onReorder={onChange}
        getItemId={(opt, idx) => opt._id || `opt-${idx}`}
        renderItem={(opt, idx) => (
          <div className="flex flex-1 gap-2 items-center">
            <input
              className="input flex-1"
              placeholder="Label"
              value={opt.label}
              onChange={(e) => update(idx, 'label', e.target.value)}
            />
            <input
              className="input flex-1"
              placeholder="Value"
              value={opt.value}
              onChange={(e) => update(idx, 'value', e.target.value)}
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="btn-ghost p-2 text-red-400 hover:text-red-600 hover:bg-red-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      />
    </div>
  );
}

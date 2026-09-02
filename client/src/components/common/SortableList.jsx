import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { reindexOrders } from '../../utils/helpers';

function SortableRow({ id, children, className = '' }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        title="Drag to reorder"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 110 4 2 2 0 010-4zM13 2a2 2 0 110 4 2 2 0 010-4zM7 8a2 2 0 110 4 2 2 0 010-4zM13 8a2 2 0 110 4 2 2 0 010-4zM7 14a2 2 0 110 4 2 2 0 010-4zM13 14a2 2 0 110 4 2 2 0 010-4z" />
        </svg>
      </button>
      {children}
    </div>
  );
}

export default function SortableList({ items, onReorder, getItemId, renderItem, className = '' }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = items.map(getItemId);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((item) => getItemId(item) === active.id);
    const newIdx = items.findIndex((item) => getItemId(item) === over.id);
    onReorder(reindexOrders(arrayMove(items, oldIdx, newIdx)));
  };

  if (items.length === 0) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={`space-y-2 ${className}`}>
          {items.map((item, idx) => (
            <SortableRow
              key={getItemId(item)}
              id={getItemId(item)}
              className="flex items-start gap-2"
            >
              {renderItem(item, idx)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

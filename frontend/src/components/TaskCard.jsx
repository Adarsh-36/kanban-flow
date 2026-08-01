import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, GripVertical } from 'lucide-react';

export const TaskCard = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'COMPLETED';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-slate-800 text-sm">{task.title}</h4>
        <button
          {...attributes}
          {...listeners}
          className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-0.5 rounded"
          aria-label="Drag task"
        >
          <GripVertical size={16} />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      {task.dueDate && (
        <div
          className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${
            isOverdue ? 'text-red-600' : 'text-slate-500'
          }`}
        >
          <Clock size={12} />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
};
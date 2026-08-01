import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';

export const Column = ({ id, title, tasks }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col bg-slate-100 rounded-xl p-4 w-80 shrink-0 border border-slate-200/80">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-slate-700 text-sm tracking-wide uppercase">
          {title}
        </h3>
        <span className="bg-slate-200 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex flex-col gap-3 min-h-[500px]">
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
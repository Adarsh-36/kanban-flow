import React, { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import axios from 'axios';
import { Column } from './Column';
import { TaskCard } from './TaskCard';

const COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'IN_REVIEW', title: 'In Review' },
  { id: 'COMPLETED', title: 'Completed' },
];

export const KanbanBoard = ({ initialTasks, boardId }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState(null);

  // Configure sensors to allow subtle clicks without accidentally triggering drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const currentTask = tasks.find((t) => t._id === activeId);
    if (!currentTask) return;

    // Determine target column and new index
    let destinationStatus;
    let overTask = tasks.find((t) => t._id === overId);

    if (overTask) {
      destinationStatus = overTask.status;
    } else {
      // Over a column container directly
      destinationStatus = overId;
    }

    const sourceStatus = currentTask.status;
    const previousSnapshot = [...tasks]; // Snapshot for optimistic rollback

    // Calculate new position
    const columnTasks = tasks.filter((t) => t.status === destinationStatus);
    const newPosition = overTask
      ? columnTasks.findIndex((t) => t._id === overId)
      : columnTasks.length;

    // 1. OPTIMISTIC UI UPDATE
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((t) =>
        t._id === activeId ? { ...t, status: destinationStatus } : t
      );

      // Reorder items in state array
      const oldIndex = updatedTasks.findIndex((t) => t._id === activeId);
      const targetIndex = updatedTasks.findIndex((t) => t._id === overId);

      if (targetIndex !== -1 && oldIndex !== targetIndex) {
        return arrayMove(updatedTasks, oldIndex, targetIndex);
      }
      return updatedTasks;
    });

    // 2. BACKEND API CALL WITH ROLLBACK
    try {
      await axios.patch(
        `http://localhost:5000/api/tasks/${activeId}/move`,
        {
          destinationStatus,
          newPosition,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Failed to persist task movement:', error);
      // Rollback to original state snapshot on API failure
      setTasks(previousSnapshot);
      alert('Could not move task. Rolling back changes.');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto p-6 min-h-[calc(100vh-80px)] items-start">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={tasks
              .filter((t) => t.status === col.id)
              .sort((a, b) => a.position - b.position)}
          />
        ))}
      </div>

      {/* Render overlay while dragging for smooth visual feedback */}
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
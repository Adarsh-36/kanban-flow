import React, { useState } from 'react';
import { KanbanBoard } from '../components/KanbanBoard';
import { ActivityFeed } from '../components/ActivityFeed';
import { AnalyticsModal } from '../components/AnalyticsModal';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { useBoardState } from '../hooks/useBoardState';
import { Activity, BarChart2, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Dashboard = ({ boardId = 'DEFAULT_BOARD_ID' }) => {
  const { tasks, setTasks, loading } = useBoardState(boardId);
  const { logout, user } = useAuth();

  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-slate-800 text-lg">Project Board</h1>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
            MERN Workflow
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> New Task
          </button>
          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <BarChart2 size={16} /> Analytics
          </button>
          <button
            onClick={() => setIsActivityOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Activity size={16} /> Activity
          </button>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg ml-2"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Board View */}
      <main className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-400 text-sm">
            Loading board state...
          </div>
        ) : (
          <KanbanBoard initialTasks={tasks} boardId={boardId} />
        )}
      </main>

      {/* Modals & Drawers */}
      <ActivityFeed isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} boardId={boardId} />
      <AnalyticsModal isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} boardId={boardId} />
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        boardId={boardId}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};
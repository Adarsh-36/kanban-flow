import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Activity, ArrowRight, UserCheck, Clock, AlertCircle } from 'lucide-react';

export const ActivityFeed = ({ isOpen, onClose, boardId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !boardId) return;

    const fetchActivityLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/boards/${boardId}/activity`,
          { withCredentials: true }
        );
        setLogs(response.data.data || []);
      } catch (err) {
        console.error('Error fetching activity logs:', err);
        setError('Failed to load audit history.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, [isOpen, boardId]);

  if (!isOpen) return null;

  // Helper to format action descriptions clearly
  const renderLogDetails = (log) => {
    switch (log.action) {
      case 'TASK_MOVED':
        return (
          <p className="text-xs text-slate-600 mt-1">
            Moved task from{' '}
            <span className="font-semibold text-slate-800">{log.details?.fromStatus}</span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">{log.details?.toStatus}</span>
          </p>
        );
      case 'TASK_CREATED':
        return <p className="text-xs text-slate-600 mt-1">Created this task</p>;
      case 'TASK_UPDATED':
        return <p className="text-xs text-slate-600 mt-1">Updated task details</p>;
      case 'TASK_DELETED':
        return <p className="text-xs text-red-500 mt-1">Deleted task</p>;
      default:
        return <p className="text-xs text-slate-500 mt-1">Performed an action</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
              <Activity size={18} className="text-indigo-600" />
              <span>Activity Log & Audit Trail</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              aria-label="Close activity feed"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                <Clock className="animate-spin" size={24} />
                <span className="text-xs">Fetching audit logs...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No activity recorded yet on this board.
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                {logs.map((log) => (
                  <div key={log._id} className="relative pl-6 group">
                    {/* Timeline Node Dot */}
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-50 border-2 border-indigo-600 group-hover:scale-110 transition-transform" />

                    <div className="flex flex-col">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">
                          {log.performedBy?.name || 'System User'}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(log.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {renderLogDetails(log)}

                      {log.taskId?.title && (
                        <div className="mt-2 text-xs bg-slate-50 border border-slate-200/80 p-2 rounded text-slate-700 font-medium truncate">
                          Task: {log.taskId.title}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 text-center">
            Auditing powered by MongoDB Change Logging
          </div>

        </div>
      </div>
    </div>
  );
};
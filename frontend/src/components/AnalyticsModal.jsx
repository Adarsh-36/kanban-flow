import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  X,
  BarChart3,
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

export const AnalyticsModal = ({ isOpen, onClose, boardId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !boardId) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/boards/${boardId}/analytics`,
          { withCredentials: true }
        );
        setData(response.data.data);
      } catch (err) {
        console.error('Failed to load board analytics:', err);
        setError('Could not fetch board metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isOpen, boardId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-base">
            <BarChart3 className="text-indigo-600" size={20} />
            <span>Board Performance & Workload Analytics</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Clock className="animate-spin" size={24} />
              <span className="text-xs font-medium">Running MongoDB Aggregation Pipeline...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          ) : data ? (
            <>
              {/* Summary Cards Row */}
              <div className="grid grid-cols-3 gap-4">
                
                {/* Completion Rate */}
                <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-indigo-600 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Completion Rate
                    </span>
                    <TrendingUp size={16} />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">
                    {Math.round(data.summary?.completionPercentage || 0)}%
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {data.summary?.completedTasks || 0} of {data.summary?.totalTasks || 0} tasks done
                  </p>
                </div>

                {/* Total Tasks */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-600 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Total Tasks
                    </span>
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">
                    {data.summary?.totalTasks || 0}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Across all workflow columns</p>
                </div>

                {/* Overdue Tasks */}
                <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-rose-600 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Overdue
                    </span>
                    <AlertTriangle size={16} />
                  </div>
                  <div className="text-2xl font-bold text-rose-700">
                    {data.overdueCount || 0}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Pending past due date</p>
                </div>

              </div>

              {/* Status Distribution Progress Bar */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-500 mb-3 tracking-wider">
                  Status Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'].map((status) => {
                    const item = data.statusBreakdown?.find((s) => s.status === status);
                    const count = item ? item.count : 0;
                    const total = data.summary?.totalTasks || 1;
                    const percentage = Math.round((count / total) * 100);

                    return (
                      <div key={status} className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                        <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
                          <span>{status.replace('_', ' ')}</span>
                          <span className="text-slate-500">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Team Workload Breakdown */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-500 mb-3 tracking-wider flex items-center gap-1.5">
                  <Users size={14} />
                  <span>Team Member Workload</span>
                </h4>

                {data.workloadPerUser?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No tasks assigned to team members yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                    {data.workloadPerUser?.map((user) => (
                      <div key={user.userId} className="p-3 bg-white flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">{user.userName}</p>
                          <p className="text-[11px] text-slate-400">{user.userEmail}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="block font-medium text-slate-700">
                              {user.pendingTasks} Pending
                            </span>
                            <span className="text-[10px] text-emerald-600">
                              {user.completedTasks} Completed
                            </span>
                          </div>
                          <span className="bg-slate-100 px-2.5 py-1 rounded-full font-semibold text-slate-600 text-[11px]">
                            {user.totalAssigned} Total
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
          <span>Aggregated on MongoDB via single <code>$facet</code> pipeline</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
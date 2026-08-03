import React, { useState } from 'react';
import api from '../api/axiosInstance';
import { X, PlusCircle, AlertCircle } from 'lucide-react';

const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  status: 'TODO',
  dueDate: '',
  assignedTo: '',
};

export const CreateTaskModal = ({ isOpen, onClose, boardId, onTaskCreated, teamMembers = [] }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required.';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }

    if (formData.dueDate) {
      const [year, month, day] = formData.dueDate.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past.';
      }
    }

    if (!boardId || boardId === 'DEFAULT_BOARD_ID') {
      newErrors.submit = 'No active board found. Please select or create a board first.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        boardId,
        assignedTo: formData.assignedTo || null,
        dueDate: formData.dueDate ? formData.dueDate : null,
      };

      const response = await api.post('/tasks', payload);

      onTaskCreated(response.data.data);
      setFormData(INITIAL_FORM_STATE);
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
      setErrors({
        submit: err.response?.data?.message || 'Failed to create task. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-base">
            <PlusCircle className="text-indigo-600" size={20} />
            <span>Create New Task</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs">
              <AlertCircle size={16} />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Implement OAuth Auth Middleware"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-500'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Add key technical details or acceptance criteria..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Status & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Column Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white ${
                  errors.dueDate
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-500'
                }`}
              />
              {errors.dueDate && (
                <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign To
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
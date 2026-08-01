import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export const useBoardState = (boardId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    if (!boardId) return;
    try {
      setLoading(true);
      const res = await api.get(`/boards/${boardId}/tasks`);
      setTasks(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [boardId]);

  return { tasks, setTasks, loading, error, refetch: fetchTasks };
};
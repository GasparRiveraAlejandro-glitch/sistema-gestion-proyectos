import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

const getToken = () => localStorage.getItem('token');

const getTasksByProject = async (projectId) => {
  const response = await axios.get(`${API_URL}/project/${projectId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

const createTask = async (taskData) => {
  const response = await axios.post(API_URL, taskData, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

const updateTask = async (id, taskData) => {
  const response = await axios.put(`${API_URL}/${id}`, taskData, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

const deleteTask = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

const taskService = {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask
};

export default taskService;
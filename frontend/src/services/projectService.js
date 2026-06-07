import axios from 'axios';

const API_URL = 'http://localhost:5000/api/projects';

const getToken = () => localStorage.getItem('token');

const getProjects = async () => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

const getProject = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

const createProject = async (projectData) => {
  const response = await axios.post(API_URL, projectData, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

const updateProject = async (id, projectData) => {
  const response = await axios.put(`${API_URL}/${id}`, projectData, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

const deleteProject = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

const projectService = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
};

export default projectService;
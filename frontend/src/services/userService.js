import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

const getToken = () => localStorage.getItem('token');

const searchUsers = async (query) => {
  const response = await axios.get(`${API_URL}/search?q=${query}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

const getProjectMembers = async (projectId) => {
  const response = await axios.get(`${API_URL}/project/${projectId}/members`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

const addMember = async (projectId, userId) => {
  const response = await axios.post(`${API_URL}/project/${projectId}/members`, { userId }, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

const removeMember = async (projectId, userId) => {
  const response = await axios.delete(`${API_URL}/project/${projectId}/members/${userId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

const userService = {
  searchUsers,
  getProjectMembers,
  addMember,
  removeMember
};

export default userService;
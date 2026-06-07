import axios from 'axios';

const API_URL = 'http://localhost:5000/api/stats';

const getToken = () => localStorage.getItem('token');

const getDashboardStats = async () => {
  const response = await axios.get(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

export default { getDashboardStats };
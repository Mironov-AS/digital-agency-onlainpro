import axios from 'axios';

const API = axios.create({ baseURL: '/api', withCredentials: true });

// Store access token in localStorage and add to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      window.location.href = '/client-portal/';
    }
    return Promise.reject(err);
  }
);

export const login = (email, password) =>
  API.post('/auth/login', { email, password });

export const logout = () =>
  API.post('/auth/logout');

export const getMe = () =>
  API.get('/auth/me');

export const getProducts = () =>
  API.get('/product-shelf/subscriptions');

export const getProductConfig = (code) =>
  API.get(`/product-shelf/products/${code}`);

export default API;
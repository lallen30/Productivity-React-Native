import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For iOS simulator, we need to use localhost:3000
// For Android emulator, we need to use 10.0.2.2:3000
const API_URL = Platform.select({
  ios: 'http://localhost:3000/api',
  android: 'http://10.0.2.2:3000/api',
  default: 'http://localhost:3000/api',
});

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name, email, password) => {
    const response = await apiClient.post('/auth/register', { name, email, password });
    return response.data;
  },
};

export const todosAPI = {
  getAll: async () => {
    const response = await apiClient.get('/todos');
    return response.data;
  },
  create: async (todo) => {
    const response = await apiClient.post('/todos', todo);
    return response.data;
  },
  update: async (id, todo) => {
    const response = await apiClient.put(`/todos/${id}`, todo);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/todos/${id}`);
    return response.data;
  },
};

export const notesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/notes');
    return response.data;
  },
  create: async (note) => {
    const response = await apiClient.post('/notes', note);
    return response.data;
  },
  update: async (id, note) => {
    const response = await apiClient.put(`/notes/${id}`, note);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/notes/${id}`);
    return response.data;
  },
};

export const eventsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/events');
    return response.data;
  },
  create: async (event) => {
    const response = await apiClient.post('/events', event);
    return response.data;
  },
  update: async (id, event) => {
    const response = await apiClient.put(`/events/${id}`, event);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },
};

export const remindersAPI = {
  getAll: async () => {
    const response = await apiClient.get('/reminders');
    return response.data;
  },
  create: async (reminder) => {
    const response = await apiClient.post('/reminders', reminder);
    return response.data;
  },
  update: async (id, reminder) => {
    const response = await apiClient.put(`/reminders/${id}`, reminder);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/reminders/${id}`);
    return response.data;
  },
};

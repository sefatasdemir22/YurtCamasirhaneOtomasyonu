import axios from 'axios';

// Backend adresimiz (Docker veya Local fark etmez, 3000 portu)
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Her isteğe otomatik Token ekle (Eğer giriş yapılmışsa)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
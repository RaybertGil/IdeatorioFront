// src/api/axiosClient.js
import axios from 'axios';
// Configurar la URL base usando la variable de entorno
const apiUrl = import.meta.env.VITE_BACKEND_URL;

const axiosClient = axios.create({
  baseURL: 'https://fearless-heart-production.up.railway.app/api', // Cambia esta URL si despliegas en producción
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;

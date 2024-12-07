// src/api/socketClient.js
import { io } from 'socket.io-client';

const socket = io('https://fearless-heart-production.up.railway.app', {
    transports: ['websocket'], // Forzar el uso de WebSocket
    withCredentials: true, // Permite enviar cookies y encabezados CORS si es necesario
  });

export default socket;

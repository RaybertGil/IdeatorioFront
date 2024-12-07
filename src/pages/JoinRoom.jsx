import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, GraduationCap } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import socket from '../api/socketClient';

const JoinRoom = () => {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook para redirigir

  const joinSession = async (e) => {
    e.preventDefault();
    try {
      // Hacer la solicitud al backend para unirse a la sesión
      const response = await axiosClient.post('/sessions/join-session', {
        pin,
        name,
      });

      const participantId = response.data.participant.id; // Obtener el ID del participante
      setMessage(`¡Te has unido exitosamente! Bienvenido, ${response.data.participant.name}.`);

      // Emitir evento `join-room` al servidor con el PIN y el ID del participante
      socket.emit('join-room', pin, participantId);
      console.log(`Evento join-room emitido con PIN: ${pin} y participantId: ${participantId}`);

      // Redirigir al usuario a la vista de estudiante (StudentView)
      navigate(`/session/${pin}`, {
        state: { pin, participantId },
      });
    } catch (error) {
      console.error('Error al unirse a la sesión:', error);
      setMessage('Error: No se pudo unir a la sesión. Por favor, verifica el PIN.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white mb-4">
          <GraduationCap className="w-12 h-12 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-white">IDEATORIO</h1>
      </div>

      <form onSubmit={joinSession} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 text-center text-xl tracking-widest w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="INGRESE SU NOMBRE"
          type="text"
          required
        />
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="mb-4 text-center text-xl tracking-widest w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="INGRESE PIN"
          type="text"
          maxLength={6}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200 ease-in-out flex items-center justify-center"
        >
          Ingresar
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
        <p className="mt-4 text-center text-sm text-gray-600">
          Si es docente ingrese{' '}
          <Link to="/" className="text-blue-500 hover:text-blue-600 hover:underline">
            aquí
          </Link>
        </p>
      </form>

      {message && (
        <div className="mt-4 bg-white rounded-lg shadow-lg p-4 w-full max-w-md text-center">
          <p className="text-gray-700">{message}</p>
        </div>
      )}
    </div>
  );
};

export default JoinRoom;

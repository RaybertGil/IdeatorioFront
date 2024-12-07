import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import socket from '../api/socketClient';

// Simple Button component
const Button = ({ children, className, ...props }) => (
  <button
    className={`px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default function StudentBrainstorm() {
  const [idea, setIdea] = useState('');
  const [confirmation, setConfirmation] = useState(''); // Para mostrar confirmación visual
  const navigate = useNavigate();
  const { state } = useLocation(); // Obtener datos pasados desde la navegación
  const { pin, participantId } = state || {}; // Extraer `pin` y `participantId` desde el estado

  // Redirigir si no hay datos válidos
  useEffect(() => {
    if (!pin || !participantId) {
      console.error('Datos de sesión faltantes. Redirigiendo al inicio...');
      navigate('/join'); // Redirigir si faltan los datos necesarios
    }
  }, [pin, participantId, navigate]);

  // Manejar envío de ideas
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!idea.trim()) return;

    // Emitir la idea al backend usando WebSocket
    socket.emit('send-idea', { pin, idea, participantId }, (response) => {
      if (response?.status === 'success') {
        console.log('Idea enviada correctamente:', idea);
        setConfirmation('Idea enviada correctamente.');
        setIdea(''); // Limpiar el campo
      } else {
        console.error('Error al enviar la idea:', response?.error || 'Error desconocido');
        setConfirmation('Error al enviar la idea.');
      }
    });
  };

  useEffect(() => {
    // Escuchar eventos de confirmación del servidor
    socket.on('idea-received', (data) => {
      console.log('Idea confirmada por el servidor:', data);
    });

    // Limpiar listeners al desmontar el componente
    return () => {
      socket.off('idea-received');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-blue-500 text-white p-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-center text-lg">Presentación Activa</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto mt-8 px-4">
        {/* PIN Display */}
        <div className="absolute left-8 top-20">
          <div className="bg-blue-900 text-white px-4 py-2 rounded-md">
            <span className="text-sm">#{pin || '000000'} (PIN)</span>
          </div>
        </div>

        {/* Question Area */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-medium">¿Cuál es tu tema?</h2>
            </div>
            <span className="text-gray-500">1</span>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Escribe aquí..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />

            <div className="flex justify-center mt-6">
              <Button
                type="submit"
                className="bg-blue-900 text-white hover:bg-blue-800 px-8"
                disabled={!idea.trim()}
              >
                Enviar
              </Button>
            </div>
          </form>

          {confirmation && (
            <p
              className={`mt-4 text-center text-sm ${
                confirmation.includes('Error') ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {confirmation}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

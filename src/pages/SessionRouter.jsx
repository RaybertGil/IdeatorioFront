import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../api/socketClient'; // Conexión a Socket.IO
import StudentVoting from './StudentVoting';
import StudentVotingWord from './StudentVotingWord';
import StudentBrainstorm from './StudentBrainstorm';
import StudentVotingClose from './StudentVotingClose';
import StudentVotingMultipleChoice from './StudentVotingMultipleChoice';

const SessionRouter = () => {
  const { pin } = useParams(); // Extraer el PIN desde la URL
  const navigate = useNavigate();
  const [slideContent, setSlideContent] = useState(null); // Contenido del slide actual
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(''); // Manejo de errores

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Unirse a la sala del socket
        socket.emit('join-room', pin);

        // Escuchar actualizaciones del contenido del slide
        socket.on('slide-update', (updatedSlideContent) => {
          setSlideContent(updatedSlideContent); // Actualizar el contenido del slide
        });

        // Solicitar el contenido inicial del slide
        socket.emit('request-slide-content', pin, (response) => {
          if (response.status === 'success') {
            setSlideContent(response.currentSlideContent); // Guardar el contenido inicial
          } else {
            setError(response.error || 'Error al obtener el contenido del slide.');
          }
          setLoading(false);
        });
      } catch (err) {
        console.error('Error inicializando la sesión:', err);
        setError('No se pudo conectar a la sesión. Verifica el PIN.');
        setLoading(false);
      }
    };

    initializeSession();

    // Limpiar eventos al desmontar el componente
    return () => {
      socket.off('slide-update');
      socket.emit('leave-room', pin); // Abandonar la sala
    };
  }, [pin]);

  if (loading) {
    return <p className="text-center text-gray-500">Cargando sesión...</p>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
        <button
          onClick={() => navigate('/join')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  // Renderizar el componente correspondiente según el contenido del slide
  if (slideContent?.type === 'Brainstorm') {
    return <StudentBrainstorm content={slideContent} />;
  } else if (slideContent?.type === 'Ranking') {
    return <StudentVoting content={slideContent} />;
  } else if (slideContent?.type === 'Wordcloud') {
    return <StudentVotingWord content={slideContent} />;
  } else if (slideContent?.type === 'CloseQuestion') {
    return <StudentVotingClose content={slideContent} />;
  } else if (slideContent?.type === 'MultipleChoice') {
    return <StudentVotingMultipleChoice content={slideContent} />;
  } else {
    return (
      <div className="text-center text-gray-500">
        <p>Tipo de contenido desconocido o vacío.</p>
        <button
          onClick={() => navigate('/join')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Volver al inicio
        </button>
      </div>
    );
  }
};

export default SessionRouter;

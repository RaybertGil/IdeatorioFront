import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  List,
  ArrowLeft,
  Check,
  Square,
} from 'lucide-react';
import axios from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

// Botón reutilizable
const Button = ({ children, className, ...props }) => (
  <button
    className={`px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default function TeacherTopic() {
  const [topic, setTopic] = useState('');
  const [view, setView] = useState('form');
  const [selectedSubtopics, setSelectedSubtopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // React Router hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const response = await axios.post('/generate-ideas', { topic });
  
      // Verifica que la respuesta contiene un array de subtemas
      if (response.data.subtopics && Array.isArray(response.data.subtopics)) {
        setSubtopics(
          response.data.subtopics.map((subtopic) => ({
            id: subtopic.id,
            title: subtopic.title,
          }))
        );
        setView('subtopics');
      } else {
        console.error('Formato inesperado de respuesta:', response.data);
        setError('El servidor no devolvió los subtemas esperados.');
      }
    } catch (err) {
      console.error('Error al generar subtemas:', err.response?.data || err);
      setError('Hubo un problema al generar los subtemas. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleAdd = () => {
    // Navegar a la siguiente página con los subtemas seleccionados
    const selectedSubtopicsData = subtopics.filter((subtopic) =>
      selectedSubtopics.includes(subtopic.id)
    );
    navigate('/question', { state: { selectedSubtopics: selectedSubtopicsData } });
  };

  const handleSelectSubtopic = (id) => {
    setSelectedSubtopics((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((subtopicId) => subtopicId !== id)
        : [...prevSelected, id]
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Barra lateral */}
      <div className="w-64 bg-white border-r">
        <div className="p-6">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <GraduationCap className="w-12 h-12 text-black" />
              <div className="absolute inset-0 border-4 border-black rounded-full transform scale-125" />
            </div>
          </div>
          <div className="text-center font-bold text-xl mb-8">IDEATORIO</div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 bg-gray-50 p-8">
        {view === 'form' ? (
          // Formulario de temática
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-medium text-gray-900">Temática:</h1>
            </div>

            <div className="mb-6">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Escribe aquí..."
                className="w-full h-40 p-4 bg-white rounded-lg shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                className="bg-blue-500 text-white hover:bg-blue-600 px-8"
                disabled={!topic.trim() || loading}
              >
                {loading ? 'Generando...' : 'GENERAR'}
              </Button>
            </div>

            {error && <p className="text-red-500 mt-4">{error}</p>}
          </form>
        ) : (
          // Subtemas generados
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-medium text-gray-900">Subtemas Generados:</h1>
              <Button
                onClick={handleAdd}
                className={`bg-blue-500 text-white hover:bg-blue-600 ${
                  selectedSubtopics.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={selectedSubtopics.length === 0}
              >
                AGREGAR
              </Button>
            </div>

            <div className="space-y-3">
              {subtopics.map((subtopic) => (
                <div
                  key={subtopic.id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedSubtopics.includes(subtopic.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectSubtopic(subtopic.id)}
                >
                  <div className="flex items-center gap-3">
                    {selectedSubtopics.includes(subtopic.id) ? <Check /> : <Square />}
                    <span>{subtopic.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

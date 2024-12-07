import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, ChevronDown, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import axios from '../api/axiosClient'; // Usa Axios para solicitudes al backend
import socket from '../api/socketClient'; // Conexión a Socket.IO
import WordCloud from 'react-d3-cloud'; // Para WordCloud

// Componente reutilizable para botones
const Button = ({ children, className, ...props }) => (
  <button
    className={`px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Componente reutilizable para selects
const Select = ({ value, onChange, options, placeholder, className }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className={`appearance-none w-full px-4 py-2 bg-white border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
  </div>
);

export default function QuestionGenerator() {
  const location = useLocation();
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [selectedDialectic, setSelectedDialectic] = useState('');
  const [questions, setQuestions] = useState([]); // Preguntas generadas
  const [questionsMultipleChoice, setQuestionsMultipleChoice] = useState([]);
  const [questionsClosed, setQuestionsClosed] = useState([]);
  const [words, setWords] = useState([]); // Palabras generadas para WordCloud
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState([{ id: 1, content: '' }]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false); // Estado para el modo presentación
  const [pin, setPin] = useState(''); // Almacenar PIN generado


  const subtopicOptions =
    location.state?.selectedSubtopics?.map((subtopic) => ({
      value: subtopic.id,
      label: subtopic.title,
    })) || [];

  const dialecticOptions = [
    { value: 'ranking', label: 'Ranking' },
    { value: 'wordcloud', label: 'Wordcloud' },
    { value: 'close-question', label: 'Pregunta opcion unica' },
    { value: 'multiple-choice', label: 'Pregunta opcion multiple' },
  ];

  const selectedSubtopicName =
    subtopicOptions.find((option) => option.value.toString() === selectedSubtopic)?.label || '';

  // Función para generar preguntas usando el backend
  const generateQuestions = async () => {
    if (!selectedSubtopicName) {
      alert('Por favor selecciona un subtema para generar preguntas.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/generate-questions', {
        subtopic: selectedSubtopicName,
      });

      if (response.data.questions && Array.isArray(response.data.questions)) {
        const generatedQuestions = response.data.questions.map((question) => ({
          id: question.id,
          text: question.text,
          progress: 0, // Inicializar en 0 para los votos
        }));

        setQuestions(generatedQuestions);

        // Emitir las preguntas iniciales a los estudiantes mediante Socket.IO
        socket.emit('initialize-ideas', { pin, questions: generatedQuestions });
      } else {
        console.error('Formato inesperado de respuesta:', response.data);
        alert('El servidor devolvió un formato inesperado. Inténtalo nuevamente.');
      }
    } catch (error) {
      console.error('Error generando preguntas:', error.message);
      alert('Ocurrió un error al generar las preguntas.');
    } finally {
      setLoading(false);
    }
  };

  const castVote = (wordText) => {
    socket.emit('cast-vote-wordcloud', { pin, wordText }, (response) => {
      if (response.status !== 'success') {
        alert('Error al votar por la palabra.');
      }
    });
  };

  const navigateSlide = (direction) => {
    if (direction === 'next' && currentSlide < slides.length - 1) {
      const newSlideIndex = currentSlide + 1;
      setCurrentSlide(newSlideIndex);
  
      // Emitir el evento con el contenido y tipo del nuevo slide
      socket.emit('slide-update', {
        pin,
        currentSlideContent: slides[newSlideIndex]?.content || '',
        type: slides[newSlideIndex]?.type || selectedDialectic, // Incluye el tipo de dinámica
      });
    } else if (direction === 'prev' && currentSlide > 0) {
      const newSlideIndex = currentSlide - 1;
      setCurrentSlide(newSlideIndex);
  
      // Emitir el evento con el contenido y tipo del nuevo slide
      socket.emit('slide-update', {
        pin,
        currentSlideContent: slides[newSlideIndex]?.content || '',
        type: slides[newSlideIndex]?.type || selectedDialectic, // Incluye el tipo de dinámica
      });
    }
  };
  
  
  

  const generateClosedQuestions = async () => {
    if (!selectedSubtopicName) {
      alert('Por favor selecciona un subtema para generar preguntas.');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post('/generate-closed-questions', { subtopic: selectedSubtopicName });
  
      if (response.data.questions && Array.isArray(response.data.questions)) {
        setQuestionsClosed(response.data.questions);
  
        // Emitir preguntas cerradas a los estudiantes
        socket.emit('update-dynamic-data', { pin, data: { type: 'close-question', questions: response.data.questions } });
      } else {
        console.error('Formato inesperado de respuesta:', response.data);
        alert('El servidor devolvió un formato inesperado. Inténtalo nuevamente.');
      }
    } catch (error) {
      console.error('Error generando preguntas cerradas:', error.message);
      alert('Ocurrió un error al generar las preguntas cerradas.');
    } finally {
      setLoading(false);
    }
  };
  
  const generateMultipleChoicesQuestions = async () => {
    if (!selectedSubtopicName) {
      alert('Por favor selecciona un subtema para generar preguntas.');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post('/generate-multiple-correct-questions', { subtopic: selectedSubtopicName });
  
      if (response.data.questions && Array.isArray(response.data.questions)) {
        setQuestionsMultipleChoice(response.data.questions);
  
        // Emitir preguntas de opción múltiple a los estudiantes
        socket.emit('update-dynamic-data', {
          pin,
          data: { type: 'multiple-choice', questions: response.data.questions },
        });
      } else {
        console.error('Formato inesperado de respuesta:', response.data);
        alert('El servidor devolvió un formato inesperado. Inténtalo nuevamente.');
      }
    } catch (error) {
      console.error('Error generando preguntas de opción múltiple:', error.message);
      alert('Ocurrió un error al generar las preguntas.');
    } finally {
      setLoading(false);
    }
  };
  
  const generateWordCloud = async () => {  
    try {
      // Emitir el evento para inicializar la dinámica WordCloud
      socket.emit('change-dynamic', { pin, dynamicType: 'wordcloud' });
  
      // Configurar el slide actual con contenido vacío
      const updatedSlides = slides.map((slide, index) =>
        index === currentSlide ? { ...slide, content: { type: 'wordcloud', data: [] } } : slide
      );
      setSlides(updatedSlides);
  
      // Emitir un evento para sincronizar con estudiantes
      socket.emit('update-dynamic-data', {
        pin,
        data: { type: 'wordcloud', words: [] }, // Palabras iniciales vacías
      });
    } catch (error) {
      console.error('Error al iniciar la dinámica de WordCloud:', error);
      alert('Hubo un problema al iniciar la dinámica de WordCloud.');
    }
  };
  
  const updateSlideContent = (content) => {
    // Actualiza el contenido únicamente del slide actual
    const updatedSlides = slides.map((slide, index) =>
      index === currentSlide ? { ...slide, content } : slide
    );
    setSlides(updatedSlides);
  
    // Emitir evento para actualizar el contenido del slide a todos los estudiantes
    socket.emit('slide-update', { pin, currentSlideContent: content });
  };
  
  

  useEffect(() => {
    // Escuchar actualizaciones del WordCloud
    socket.on('wordcloud-update', (updatedWords) => {
      setWords(
        updatedWords.map((word) => ({
          id: word.id,
          text: word.text,
          value: word.votes || 1, // Tamaño basado en los votos
        }))
      );
    });
  
    // Limpieza para evitar múltiples escuchas
    return () => {
      socket.off('wordcloud-update');
    };
  }, []);
  


  // Generar dinámicas y asignarlas al slide actual
  const generateContentForSlide = async () => {
    if (!selectedDialectic) {
      alert('Por favor selecciona una dinámica.');
      return;
    }
    setLoading(true);
  
    try {
      // Emitir cambio de dinámica a los estudiantes
      socket.emit('change-dynamic', { pin, dynamicType: selectedDialectic });
  
      let content = '';
      if (selectedDialectic === 'ranking') {
        const response = await axios.post('/generate-questions', { subtopic: selectedSubtopic });
        const generatedQuestions = response.data.questions || [];
        setQuestions(generatedQuestions);
  
        content = (
          <div className="flex space-x-8 items-end justify-center h-64 bg-gray-100 rounded-lg">
            {generatedQuestions.map((question, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className="bg-purple-500 rounded-t w-8 transition-all duration-300"
                  style={{ height: `${question.progress * 10}px` }}
                />
                <span className="text-sm text-gray-600">{question.text}</span>
              </div>
            ))}
          </div>
        );
      } else if (selectedDialectic === 'wordcloud') {
        // Configurar contenido vacío del wordcloud
        const content = (
          <WordCloud
            data={[]} // Inicia vacío
            width={600}
            height={300}
            fontSize={(word) => Math.log2(word.value + 1) * 5}
            spiral="rectangular"
            padding={5}
          />
        );
      
        // Emitir cambio de dinámica
        socket.emit('change-dynamic', { pin, dynamicType: 'wordcloud' });
      
        // Actualizar contenido del slide
        const updatedSlides = slides.map((slide, index) =>
          index === currentSlide ? { ...slide, content: { type: 'wordcloud', data: [] } } : slide
        );
        setSlides(updatedSlides);
      }
      
      // Emitir los datos de la dinámica actual
      socket.emit('update-dynamic-data', { pin, data: content });
  
      // Actualizar contenido del slide actual
      const updatedSlides = slides.map((slide, index) =>
        index === currentSlide ? { ...slide, content } : slide
      );
      setSlides(updatedSlides);
    } catch (error) {
      console.error('Error generando dinámica:', error);
      alert('Ocurrió un error al generar la dinámica.');
    } finally {
      setLoading(false);
    }
  };
  

  const addSlide = () => {
    setSlides([...slides, { id: slides.length + 1, title: `Slide ${slides.length + 1}`, content: '' }]);
  };

  const removeSlide = (id) => {
    if (slides.length > 1) {
      const filteredSlides = slides.filter((slide) => slide.id !== id);
      setSlides(filteredSlides);
      setCurrentSlideIndex(0);
    }
  };

  const startPresentation = () => {
    setIsPresentationMode(true);
  };

  // Función para crear sesión y generar PIN
  const createSession = async () => {
    try {
      const response = await axios.post('/sessions/create-session', {
        type: selectedDialectic,
        host_user_id: 1, // Cambiar dinámicamente si es necesario
      });
      const generatedPin = response.data.session.pin;
      setPin(generatedPin);
  
      // Emitir evento para unirse a la sala
      socket.emit('join-room', generatedPin );
  
      // Mostrar modo presentación
      setIsPresentationMode(true);
      // Escuchar actualizaciones de votos
      socket.on('vote-update', (updatedIdeas) => {
        setQuestions((prevQuestions) =>
          prevQuestions.map((question) => {
            const updatedIdea = updatedIdeas.find((idea) => idea.id === question.id);
            return updatedIdea ? { ...question, progress: updatedIdea.votes } : question;
          })
        );
      });
    } catch (error) {
      console.error('Error al crear la sesión:', error.message);
      alert('No se pudo crear la sesión.');
    }
  };
  

  const enterPresentationMode = async () => {
    try {
      // Reutilizamos la función `createSession` para generar el PIN y configurar la sesión
      await createSession();
  
      // Asegurar que siempre iniciamos la presentación desde el primer slide
      setCurrentSlide(0);
      setIsPresentationMode(true);
    } catch (error) {
      console.error('Error al iniciar el modo presentación:', error.message);
      alert('No se pudo iniciar el modo presentación.');
    }
  };

  // Salir del modo presentación
  const exitPresentationMode = () => {
    setIsPresentationMode(false);
    setPin('');
    socket.off('vote-update'); // Desconectar eventos de socket
  };

  // Nuevas funciones para almacenar contenido en los slides
  const generateQuestionsAndStoreInSlide = async (type) => {
    await generateQuestions();
    setSlides((prevSlides) =>
      prevSlides.map((slide, index) =>
        index === currentSlide ? { ...slide, content: { type, questions } } : slide
      )
    );
  };

  const generateWordCloudAndStoreInSlide = async () => {
    await generateWordCloud();
    setSlides((prevSlides) =>
      prevSlides.map((slide, index) =>
        index === currentSlide ? { ...slide, content: { type: 'wordcloud', words } } : slide
      )
    );
  };

  const generateClosedQuestionsAndStoreInSlide = async () => {
    await generateClosedQuestions();
    setSlides((prevSlides) =>
      prevSlides.map((slide, index) =>
        index === currentSlide ? { ...slide, content: { type: 'close-question', questionsClosed } } : slide
      )
    );
  };

  // Vista en modo presentación
if (isPresentationMode) {
  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-b from-blue-500 to-blue-700 text-white">
      {/* Encabezado */}
      <div className="flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold">Presentación</h1>
        <div className="flex items-center">
          <span className="text-xl font-medium bg-white text-blue-700 px-4 py-2 rounded-lg mr-4">
            Código PIN: {pin}
          </span>
          <Button
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg text-white"
            onClick={exitPresentationMode}
          >
            Finalizar Presentación
          </Button>
        </div>
      </div>

      {/* Contenido del Slide */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-4xl font-semibold mb-8">
          {slides[currentSlide]?.content === 'ranking'
            ? `Ranking`
            : slides[currentSlide]?.content === 'wordcloud'
            ? `Nube de Palabras`
            : slides[currentSlide]?.content === 'close-question'
            ? `Pregunta Única`
            : slides[currentSlide]?.content === 'multiple-choice'
            ? `Pregunta Múltiple`
            : 'Slide vacío'}
        </h2>

        {slides[currentSlide]?.content === 'ranking' && (
          <div className="flex space-x-8 items-end justify-center h-64 bg-gray-100 rounded-lg p-4 w-full max-w-4xl">
            {questions.map((question) => (
              <div key={question.id} className="flex flex-col items-center">
                <div
                  className="bg-purple-500 rounded-t w-8 transition-all duration-300"
                  style={{
                    height: `${question.progress * 10}px`,
                  }}
                />
                <span className="text-sm text-gray-800">{question.text}</span>
              </div>
            ))}
          </div>
        )}

        {slides[currentSlide]?.content === 'wordcloud' && (
          <div className="h-[450px] w-full bg-white">
                    <WordCloud
                      data={words}
                      width={700}
                      height={150}
                      font="Times"
                      fontStyle="italic"
                      fontWeight="bold"
                      fontSize={(word) => Math.log2(word.value + 1) * 5}
                      spiral="rectangular"
                      rotate={() => (Math.random() > 0.5 ? 90 : 0)}
                      padding={5}
                      random={Math.random}
                    />
                  </div>
        )}

        {slides[currentSlide]?.content === 'close-question' && (
          <div className="flex flex-col items-center justify-center space-y-6">
            {questionsClosed.map((question, index) => (
              <div
                key={question.id}
                className="bg-white text-black p-6 rounded-lg shadow-lg max-w-3xl w-full"
              >
                <h2 className="text-lg font-semibold mb-4">
                  {`${question.text}`}
                </h2>
                <ul>
                  {question.options.map((option) => (
                    <li key={option.id} className="mb-2">
                      <span className="block">
                        {isPresentationMode
                          ? option.text.replace(" (Correcta)", "") // Remover "(Correcta)" en modo presentación
                          : option.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      {slides[currentSlide]?.content === 'multiple-choice' &&(
        <div className="flex flex-col items-center justify-center space-y-6">
        {questionsMultipleChoice.map((question, index) => (
          <div
            key={question.id}
            className="bg-white text-black p-2 rounded-lg shadow-lg max-w-3xl w-full"
          >
            <h2 className="text-lg font-semibold mb-4">
              {`${question.text}`}
            </h2>
            <ul>
              {question.options.map((option) => (
                <li key={option.id} className="mb-2">
                  <span className="block">
                    {isPresentationMode
                      ? option.text.replace(" (Correcta)", "") // Remover "(Correcta)" en modo presentación
                      : option.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      ) }

      {/* Controles de navegación */}
      <div className="flex justify-between items-center p-6">
        <Button
          className="bg-white text-blue-700 px-6 py-2 rounded-lg shadow hover:bg-blue-50"
          onClick={() => navigateSlide('prev')}
          disabled={currentSlide === 0}
        >
          Anterior
        </Button>
        <span className="text-xl">
          Slide {currentSlide + 1} de {slides.length}
        </span>
        <Button
          className="bg-white text-blue-700 px-6 py-2 rounded-lg shadow hover:bg-blue-50"
          onClick={() => navigateSlide('next')}
          disabled={currentSlide === slides.length - 1}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-blue-500 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/teacher-topic" className="flex items-center text-white hover:text-blue-100">
            <ArrowLeft className="mr-2" />
            <span>Atrás</span>
          </Link>
          <Button className="bg-white text-blue-500 hover:bg-blue-50" onClick={createSession}>
            Presentar
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-8 px-4 flex">
        {/* Panel de control de slides */}
        <div className="w-1/4 pr-8">
          <Button
            onClick={addSlide}
            className="w-full mb-4 bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center"
          >
            <Plus size={18} className="mr-2" /> Nueva Hoja
          </Button>
          <ul className="space-y-2">
            {slides.map((slide, index) => (
              <li
                key={slide.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer ${index === currentSlide ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                onClick={() => setCurrentSlide(index)}
              >
                <div className="w-full h-16 bg-white rounded border flex items-center justify-center">
                  <span className="text-sm text-gray-400">Slide {slide.id}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSlide(slide.id);
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contenido dinámico del slide actual */}
        <div className="flex-1">
          <div className="max-w-2xl mx-auto space-y-4">
            <Select
              value={selectedSubtopic}
              onChange={(e) => setSelectedSubtopic(e.target.value)}
              options={subtopicOptions}
              placeholder="Escoge Subtema"
            />
            <Select
              value={selectedDialectic}
              onChange={(e) => setSelectedDialectic(e.target.value)}
              options={dialecticOptions}
              placeholder="Tipo de dinámica"
            />
            <div className="flex justify-center">
              <Button
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => {
                  const generateContent =
                    selectedDialectic === 'ranking'
                      ? generateQuestions
                      : selectedDialectic === 'wordcloud'
                        ? generateWordCloud
                        : selectedDialectic === 'close-question'
                          ? generateClosedQuestions
                          : selectedDialectic === 'multiple-choice'
                            ? generateMultipleChoicesQuestions
                            : null;

                  if (generateContent) {
                    generateContent().then(() => {
                      updateSlideContent(selectedDialectic); // Actualizar solo el contenido del slide actual
                    });
                  }
                }}
                disabled={!selectedSubtopic || !selectedDialectic || loading}
              >
                {loading ? 'Generando...' : 'Generar'}
              </Button>
            </div>
          </div>

          {/* Contenido del slide actual */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            {slides[currentSlide]?.content ? (
              <>
                <h2 className="text-xl font-medium mb-6">
                  {slides[currentSlide].content === 'ranking'
                    ? `RANKING`
                    : slides[currentSlide].content === 'wordcloud'
                      ? `NUBE DE PALABRAS`
                      : slides[currentSlide].content === 'close-question'
                        ? `PREGUNTA OPCIÓN ÚNICA`
                        : slides[currentSlide].content === 'multiple-choice'
                          ? `PREGUNTA OPCIÓN MÚLTIPLE`
                          : ''}
                </h2>

                {slides[currentSlide].content === 'ranking' && (
                  <div className="flex space-x-8 items-end justify-center h-64 bg-gray-100 rounded-lg">
                    {questions.map((question) => (
                      <div key={question.id} className="flex flex-col items-center">
                        <div
                          className="bg-purple-500 rounded-t w-8 transition-all duration-300"
                          style={{
                            height: `${question.progress * 10}px`,
                          }}
                        />
                        <span className="text-sm text-gray-600">{question.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {slides[currentSlide].content === 'wordcloud' && (
                  <div className="h-[450px] w-full">
                    <WordCloud
                      data={words}
                      width={600}
                      height={300}
                      font="Times"
                      fontStyle="italic"
                      fontWeight="bold"
                      fontSize={(word) => Math.log2(word.value + 1) * 5}
                      spiral="rectangular"
                      rotate={() => (Math.random() > 0.5 ? 90 : 0)}
                      padding={5}
                      random={Math.random}
                    />
                  </div>
                )}

                {slides[currentSlide].content === 'close-question' && (
                  // Contenido de Pregunta opcion unica
                  <div>
                    {questionsClosed.length > 0 ? (
                      <ul className="space-y-4">
                        {questionsClosed.map((question, index) => (
                          <li key={index} className="bg-gray-100 p-4 rounded-md shadow-md">
                            {/* Mostrar la pregunta */}
                            <h3 className="font-semibold text-lg mb-2">
                              {` ${question.question || question.text || 'Pregunta no disponible'}`}
                            </h3>
                            {/* Mostrar las opciones */}
                            <ul className="space-y-2">
                              {question.options.map((option, idx) => (
                                <li
                                  key={idx}
                                  className={`p-2 rounded-md ${option.isCorrect ? 'bg-green-100' : 'bg-white'}`}
                                >
                                  {option.text} {option.isCorrect && <span className="text-green-600">(Correcta)</span>}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No se han generado preguntas. Por favor, haz clic en "Generar".</p>
                    )}
                  </div>
                )}
                {slides[currentSlide].content === 'multiple-choice' && (
                  // Contenido de Pregunta opcion unica
                  <div>
                    {questionsMultipleChoice.length > 0 ? (
                      <ul className="space-y-4">
                        {questionsMultipleChoice.map((question, index) => (
                          <li key={index} className="bg-gray-100 p-4 rounded-md shadow-md">
                            {/* Mostrar la pregunta */}
                            <h3 className="font-semibold text-lg mb-2">
                              {` ${question.question || question.text || 'Pregunta no disponible'}`}
                            </h3>
                            {/* Mostrar las opciones */}
                            <ul className="space-y-2">
                              {question.options.map((option, idx) => (
                                <li
                                  key={idx}
                                  className={`p-2 rounded-md ${option.isCorrect ? 'bg-green-100' : 'bg-white'}`}
                                >
                                  {option.text} {option.isCorrect && <span className="text-green-600">(Correcta)</span>}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No se han generado preguntas. Por favor, haz clic en "Generar".</p>
                    )}
                  </div>

                )}
              </>
            ) : (
              <p>No hay contenido en este slide. Genera una dinámica para almacenarla.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
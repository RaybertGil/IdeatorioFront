import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import socket from '../api/socketClient';

const Button = ({ children, className, ...props }) => (
  <button
    className={`px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const RadioGroup = ({ options, value, onChange }) => (
  <div className="space-y-4">
    {options.map((option) => (
      <div
        key={option.value}
        className={`flex items-center bg-blue-100 rounded-lg p-4 cursor-pointer transition-colors ${value === option.value ? 'bg-blue-200' : ''
          }`}
        onClick={() => onChange(option.value)}
      >
        <input
          type="radio"
          id={option.value}
          value={option.value}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          className="sr-only"
        />
        <label htmlFor={option.value} className="flex-grow cursor-pointer">
          {option.label}
        </label>
        <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
          {value === option.value && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </div>
      </div>
    ))}
  </div>
);

const StudentView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pin, participantId } = location.state || {};
  const [currentSlideContent, setCurrentSlideContent] = useState('');
  const [rankingIdeas, setRankingIdeas] = useState([]);
  const [wordCloudIdeas, setWordCloudIdeas] = useState([]);
  const [questionsClosed, setQuestionsClosed] = useState([]);
  const [questionsMultipleChoice, setQuestionsMultipleChoice] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [voted, setVoted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState({});
  const [score, setScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!pin || !participantId) {
      console.error('Datos de sesión faltantes. Redirigiendo...');
      navigate('/join');
      return;
    }

    // Emitir el evento para unirse a la sala
    socket.emit('join-room', pin, participantId);

    // Escuchar actualizaciones del slide
    socket.on('slide-update', ({ content }) => {
      console.log('Slide actualizado:', content);
      setCurrentSlideContent(content);

      // Reset content states
      setRankingIdeas([]);
      setWordCloudIdeas([]);
      setQuestionsClosed([]);
      setQuestionsMultipleChoice([]);
      setSelectedOption('');
      setSelectedAnswers({});
      setVoted(false);
      setSubmitted(false);

      // Lógica específica para cada tipo de dinámica
      if (content === 'ranking') {
        // Solicitar ideas para el ranking
        socket.emit('request-ideas', pin, 'ranking', (response) => {
          if (response.status === 'success') {
            setRankingIdeas(
              response.ideas.map((idea) => ({
                value: idea.id,
                label: idea.text,
              }))
            );
          } else {
            console.error('Error al cargar ideas del ranking:', response.error);
          }
        });
      } else if (content === 'wordcloud') {
        // Solicitar ideas para el wordcloud
        socket.emit('request-ideas', pin, 'wordcloud', (response) => {
          if (response.status === 'success') {
            setWordCloudIdeas(
              response.ideas.map((idea) => ({
                text: idea.text,
                value: idea.votes || 1, // Asegúrate de incluir el conteo de votos
              }))
            );
          } else {
            console.error('Error al cargar ideas del wordcloud:', response.error);
          }
        });
      } else if (content === 'close-question') {
        // Solicitar preguntas de tipo opción única
        socket.emit('request-questions', { pin, type: 'close-question' }, (response) => {
          if (response.status === 'success') {
            setQuestionsClosed(response.questions);
          } else {
            console.error('Error al cargar preguntas:', response.error);
          }
        });
      } else if (content === 'multiple-choice') {
        // Solicitar preguntas de opción múltiple
        socket.emit('request-questions', { pin, type: 'multiple-choice' }, (response) => {
          if (response.status === 'success') {
            setQuestionsMultipleChoice(response.questions);
          } else {
            console.error('Error al cargar preguntas:', response.error);
          }
        });
      }
    });

    // Cleanup: elimina listeners cuando se desmonta el componente
    return () => {
      socket.off('slide-update');
      socket.off('request-questions');
    };
  }, [pin, participantId, navigate]);

  const handleOptionChangeMultiple = (questionId, optionId, isChecked) => {
    setSelectedAnswers((prev) => {
      const currentAnswers = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      if (isChecked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, optionId], // Agregar respuesta seleccionada
        };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter((id) => id !== optionId), // Eliminar respuesta deseleccionada
        };
      }
    });
  };
  const handleOptionChange = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
    console.log('Respuestas seleccionadas:', selectedAnswers); // <-- Depuración
  };


  const handleSubmitAnswers = (e) => {
    e.preventDefault();

    // Determinar el evento de envío según la dinámica activa
    const submitEvent =
      currentSlideContent === 'multiple-choice'
        ? 'submit-answers-multiple'
        : 'submit-answers';

    socket.emit(
      submitEvent,
      { pin, participantId, answers: selectedAnswers },
      (response) => {
        if (response.status === 'success') {
          setSubmitted(true);
          setScore(response.score); // Actualizar el puntaje
          setFeedback(response.feedback); // Retroalimentación
        } else {
          console.error('Error al enviar respuestas:', response.error);
        }
      }
    );
  };

  const handleSubmitWord = (event) => {
    if (!event || typeof event.preventDefault !== 'function') {
      console.error('Evento inválido pasado a handleSubmitWord');
      return;
    }

    event.preventDefault(); // Detiene el comportamiento predeterminado del formulario

    if (!selectedOption.trim()) return;

    socket.emit(
      'send-idea',
      { pin, idea: selectedOption, participantId },
      (response) => {
        if (response?.status === 'success') {
          setSubmitted(true);
          setSelectedOption(''); // Limpia el input tras el envío
        } else {
          console.error('Error al enviar idea:', response.error);
        }
      }
    );
  };




  const handleSubmitVote = (e) => {
    e.preventDefault();
    const voteEvent =
      currentSlideContent === 'wordcloud' ? 'cast-vote-wordcloud' : 'cast-vote';

    socket.emit(
      voteEvent,
      { pin, wordId: selectedOption, ideaId: selectedOption },
      (response) => {
        if (response?.status === 'success') {
          setVoted(true);
        } else {
          setErrorMessage(response?.error || 'Error desconocido');
        }
      }
    );
  };

  const renderDynamicContent = () => {
    switch (currentSlideContent) {
      case 'ranking':
        const ideas = rankingIdeas;
        return (
          <div className="bg-white rounded-lg shadow-xl p-8">
            {voted ? (
              <div className="text-center">
                <h3 className="text-lg font-medium text-green-600">¡Voto registrado!</h3>
                <p className="text-gray-500 mt-2">Gracias por participar.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-4">Vota por tu idea preferida</h3>
                {ideas.length > 0 ? (
                  <form onSubmit={handleSubmitVote}>
                    <RadioGroup
                      options={ideas}
                      value={selectedOption}
                      onChange={setSelectedOption}
                    />
                    <Button
                      type="submit"
                      className="mt-6 bg-blue-900 text-white hover:bg-blue-800 px-8 py-2"
                      disabled={!selectedOption}
                    >
                      Enviar Voto
                    </Button>
                  </form>
                ) : (
                  <p className="text-center text-gray-500">Cargando opciones...</p>
                )}
              </>
            )}
          </div>
        );


      case 'wordcloud':
        return (
          <div className="bg-white rounded-lg shadow-xl p-8">
            {submitted ? ( // Verifica si la idea ha sido enviada
              <div className="text-center">
                <h3 className="text-lg font-medium text-green-600">¡Respuesta enviada!</h3>
                <p className="text-gray-500 mt-2">Gracias por participar. Tu idea ha sido registrada.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-4">Envía tu idea para la nube de palabras</h3>
                <form
                  onSubmit={(e) => {
                    handleSubmitWord(e);
                  }}
                  className="mb-6"
                >
                  <input
                    type="text"
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    placeholder="Escribe tu idea aquí"
                  />
                  <Button
                    type="submit"
                    className="bg-blue-500 text-white hover:bg-blue-600 px-6 py-2"
                    disabled={!selectedOption.trim()}
                  >
                    Enviar Idea
                  </Button>
                </form>
                <p className="text-center text-gray-500">
                  Las ideas aparecerán en la nube de palabras del docente en tiempo real.
                </p>
              </>
            )}
          </div>
        );

      case 'close-question':
        return (
          <div className="bg-white rounded-lg shadow-xl p-8">
            {submitted ? (
              <div className="">
                <h3 className="text-lg font-medium text-green-600 text-center mb-6">
                  ¡Respuestas enviadas!
                </h3>
                <div className="text-center mb-6">
                  <h4 className="font-semibold text-xl">Puntaje: {score}</h4>
                </div>
                {questionsClosed.map((question, index) => (
                  <div
                    key={question.id}
                    className="mb-6 p-4 bg-gray-100 rounded-lg shadow-md"
                  >
                    <h4 className="text-md font-semibold mb-2">
                      {question.text}
                    </h4>
                    <ul>
                      {question.options.map((option) => {
                        const isCorrect = option.correct; // Opción correcta
                        const isSelected =
                          selectedAnswers[question.id] === option.id; // Respuesta seleccionada
                        return (
                          <li
                            key={option.id}
                            className={`p-2 rounded-lg ${isSelected && isCorrect
                              ? 'bg-green-200'
                              : isSelected && !isCorrect
                                ? 'bg-red-200'
                                : isCorrect
                                  ? 'bg-green-100'
                                  : ''
                              }`}
                          >
                            {option.text}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmitAnswers}>
                <h3 className="text-lg font-medium mb-6">Responde las siguientes preguntas</h3>
                {questionsClosed.map((q) => (
                  <div key={q.id} className="mb-6">
                    <h4 className="text-md font-semibold mb-2">{q.text}</h4>
                    {q.options.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={opt.id}
                          onChange={() => handleOptionChange(q.id, opt.id)}
                        />
                        <span>{opt.text.replace(' (Correcta)', '')}</span>
                      </label>
                    ))}
                  </div>
                ))}
                <Button
                  type="submit"
                  className="bg-blue-900 text-white hover:bg-blue-800 px-8 py-2"
                  disabled={
                    Object.keys(selectedAnswers).length !== questionsClosed.length
                  }
                >
                  Enviar Respuestas
                </Button>
              </form>
            )}
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="bg-white rounded-lg shadow-xl p-8">
            {submitted ? (
              <div className="">
                <h3 className="text-lg font-medium text-green-600 text-center mb-6">
                  ¡Respuestas enviadas!
                </h3>
                <div className="text-center mb-6">
                  <h4 className="font-semibold text-xl">Puntaje: {score}</h4>
                </div>
                {questionsMultipleChoice.map((question) => (
                  <div
                    key={question.id}
                    className="mb-6 p-4 bg-gray-100 rounded-lg shadow-md"
                  >
                    <h4 className="text-md font-semibold mb-2">{question.text}</h4>
                    <ul>
                      {question.options.map((option) => {
                        const isCorrect = option.correct; // Determina si la opción es correcta
                        const isSelected = selectedAnswers[question.id]?.includes(option.id);

                        return (
                          <li
                            key={option.id}
                            className={`p-2 rounded-lg ${isSelected && isCorrect
                              ? 'bg-green-200'
                              : isSelected && !isCorrect
                                ? 'bg-red-200'
                                : isCorrect
                                  ? 'bg-green-100'
                                  : ''
                              }`}
                          >
                            {option.text}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmitAnswers}>
                <h3 className="text-lg font-medium mb-6">Responde las siguientes preguntas</h3>
                {questionsMultipleChoice.map((question) => (
                  <div
                    key={question.id}
                    className="mb-6 p-4 bg-gray-100 rounded-lg shadow-md"
                  >
                    <h4 className="text-md font-semibold mb-2">{question.text}</h4>
                    <ul>
                      {question.options.map((option) => (
                        <li key={option.id} className="mb-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              name={`question-${question.id}`}
                              value={option.id}
                              onChange={(e) =>
                                handleOptionChangeMultiple(
                                  question.id,
                                  option.id,
                                  e.target.checked
                                )
                              }
                              disabled={submitted}
                            />
                            <span>{option.text.replace(' (Correcta)', '')}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="flex justify-center mt-6">
                  <Button
                    type="submit"
                    className="bg-blue-900 text-white hover:bg-blue-800 px-8 py-2"
                    disabled={
                      Object.keys(selectedAnswers).length !==
                      questionsMultipleChoice.length
                    }
                  >
                    Enviar Respuestas
                  </Button>
                </div>
              </form>
            )}
          </div>
        );



      default:
        return <p className="text-center">Esperando que el docente seleccione una dinámica...</p>;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <header className="p-6 bg-blue-500 text-white flex justify-between">
        <h1 className="text-xl font-semibold">Vista del Estudiante</h1>
        <span className="text-sm bg-white text-blue-700 px-4 py-1 rounded-lg">Código PIN: {pin}</span>
      </header>
      <main className="max-w-3xl mx-auto mt-8 px-4">{renderDynamicContent()}</main>
    </div>
  );
};

export default StudentView;

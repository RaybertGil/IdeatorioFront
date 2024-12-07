import React from 'react'
import { GraduationCap, ArrowRight } from 'lucide-react'
import App from '../App';
import { Link } from 'react-router-dom'

export default function TeacherLogin() {
    const imagePath3 = new URL('../img/google.png', import.meta.url).href;

    // Función para manejar el inicio de sesión con Google
  const handleGoogleLogin = () => {
    // Redirige al backend para iniciar el flujo de autenticación con Google
    window.location.href = 'https://fearless-heart-production.up.railway.app/auth/google';
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8"></div>
      
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white mb-4">
          <GraduationCap className="w-24 h-24 text-blue-500" />
        </div>
            <h1 className="text-2xl font-bold text-gray-800">IDEATORIO</h1>
            <p className="text-gray-600">¡Bienvenido de vuelta!</p>
          </div>

          <form>
            
            {/* Botón de inicio de sesión con Google */}
            <button
              type="button"
              className="w-full bg-white text-gray-700 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center justify-center"
              onClick={handleGoogleLogin}
            >
              <img src={imagePath3} alt="Google logo" className="w-5 h-5 mr-2" />
              Registrarse con Google
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/join" className="text-sm text-blue-600 hover:underline">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
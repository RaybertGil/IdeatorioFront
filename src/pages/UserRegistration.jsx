import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, ArrowRight } from 'lucide-react'

// Componente para los Términos y Condiciones
const TermsAndConditions = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Términos y Condiciones</h2>
        <div className="overflow-y-auto max-h-80 mb-4 text-justify" style={{ scrollbarWidth: 'thin' }}>
            <p>Aquí van los términos y condiciones de IDEATORIO. Por favor, léalos cuidadosamente antes de registrarse.</p>
            <p><strong>1. Aceptación de los Términos</strong><br/>
            Al registrarse y utilizar la plataforma Ideatorio de la Universidad Privada Antenor Orrego (UPAO), usted, en su calidad de docente, acepta estar sujeto a estos términos y condiciones. Si no está de acuerdo con alguno de los términos establecidos aquí, no debe usar la plataforma.</p>
            <p><strong>2. Descripción del Servicio</strong><br/>
            Ideatorio es una plataforma interactiva destinada a fomentar la participación estudiantil en clases a través de salas virtuales donde se pueden ingresar ideas y realizar votaciones. La plataforma permite a los docentes generar preguntas dinámicas basadas en las discusiones de los estudiantes para enriquecer el proceso de aprendizaje.</p>
            <p><strong>3. Registro y Cuenta</strong><br/>
            a. Para utilizar Ideatorio, debe registrarse y crear una cuenta proporcionando información veraz y actualizada como se solicita en el formulario de registro.<br/>
            b. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta.<br/>
            c. Usted acuerda notificar inmediatamente a la administración de Ideatorio sobre cualquier uso no autorizado de su cuenta.</p>
            <p><strong>4. Uso Aceptable</strong><br/>
            Usted se compromete a usar Ideatorio solo para los fines educativos previstos y de manera que no infrinja los derechos de terceros ni restrinja o inhiba su uso y disfrute de la plataforma.</p>
            <p><strong>5. Propiedad Intelectual</strong><br/>
            Todos los contenidos presentados en Ideatorio, incluidos textos, gráficos, logos, imágenes y software, son propiedad de la Universidad Privada Antenor Orrego o de sus licenciantes y están protegidos por leyes de derechos de autor y marcas registradas.</p>
            <p><strong>6. Privacidad de los Datos</strong><br/>
            El manejo de la información personal y de los datos generados a través de Ideatorio se rige por la Política de Privacidad de la UPAO, la cual está disponible en nuestro sitio web.</p>
            <p><strong>7. Modificaciones al Servicio y a los Términos</strong><br/>
            UPAO se reserva el derecho de modificar o discontinuar, temporal o permanentemente, la plataforma Ideatorio con o sin previo aviso. También nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma.</p>
            <p><strong>8. Terminación</strong><br/>
            UPAO puede terminar o suspender su acceso a Ideatorio inmediatamente, sin previo aviso o responsabilidad, por cualquier razón, incluyendo, entre otros, si incumple los Términos y Condiciones.</p>
            <p><strong>9. Indemnización</strong><br/>
            Usted acuerda indemnizar y eximir de responsabilidad a la Universidad Privada Antenor Orrego, sus filiales, y su personal directivo de cualquier reclamación o demanda, incluyendo honorarios razonables de abogados, hechos por terceros debido a o surgidos de su uso de Ideatorio o la violación de estos términos.</p>
            <p><strong>10. Ley Aplicable y Jurisdicción</strong><br/>
            Estos términos y condiciones se regirán e interpretarán de acuerdo con las leyes de Perú, sin dar efecto a ningún principio de conflictos de ley. Usted acepta que cualquier acción legal o en equidad que surja bajo estos términos será presentada solo en los tribunales ubicados en Trujillo, Perú.</p>
        </div>
        <button
            onClick={onClose}
            className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 w-full"
        >
            Cerrar
        </button>
    </div>
</div>
  );
};

export default function UserRegistration() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const imagePath1 = new URL('../img/logo.png', import.meta.url).href;
  const imagePath2 = new URL('../img/background.jpg', import.meta.url).href;

  const openTerms = (e) => {
    e.preventDefault();
    setIsTermsOpen(true);
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
            <p className="text-gray-600">Registro Usuario</p>
          </div>

          <form>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Ingrese Usuario:
              </label>
              <input
                type="text"
                id="username"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="Nombre de usuario"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico:
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="usuario@ejemplo.com"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Ingrese su contraseña:
              </label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="••••••••"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Ingrese su contraseña nuevamente:
              </label>
              <input
                type="password"
                id="confirm-password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="••••••••"
              />
            </div>

            <div className="mb-4 text-sm text-gray-600">
              Al registrarse acepta nuestros{" "}
              <a href="#" onClick={openTerms} className="text-blue-600 hover:underline">
                términos y condiciones
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 mb-4"
            >
              Registrarse
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/teacher-login" className="text-blue-600 hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>

      <TermsAndConditions isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  )
}
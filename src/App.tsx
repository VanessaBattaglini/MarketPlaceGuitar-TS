/**
 * @fileoverview Componente raíz de la aplicación
 * 
 * Responsabilidades:
 * - Cargar y validar configuración
 * - Inicializar hooks principales
 * - Renderizar estructura base de la app
 * - Manejar errores globales
 * 
 * Arquitectura:
 * - Provider de configuración en App
 * - Custom hooks para estado (useCartWithPersistence)
 * - Layout básico: Header, Main, Footer
 * - Galería de guitarras + carrito
 * 
 * @example
 * <App />
 * 
 * @module App
 */

import { useEffect } from 'react';
import Guitar from "./components/Guitar";
import Header from "./components/Header";
import { useCartWithPersistence } from "./hooks/useCartWithPersistence";
import { useTheme } from "./hooks/useTheme";
import { validateConfig, logConfig } from './config/app.config';

/**
 * Componente principal de la aplicación (root)
 * 
 * Estructura de la app:
 * 1. Header: Muestra logo y carrito desplegable
 * 2. Main: Galería de guitarras
 * 3. Footer: Información y copyright
 * 
 * Estado:
 * - Mantiene el estado del carrito usando useCartWithPersistence
 * - Persiste automáticamente a localStorage
 * - Maneja errores de persistencia
 * 
 * Configuración:
 * - Se valida al montar
 * - Se loguea en modo debug
 * - Disponible para toda la app via appConfig
 * 
 * Efectos:
 * - useEffect: Validar y loguear configuración al montar
 * - useCartWithPersistence: Cargar carrito del localStorage
 * 
 * Props: Ninguna (componente raíz)
 * 
 * @returns {JSX.Element} Estructura completa de la aplicación
 * 
 * @example
 * // En main.tsx
 * import App from './App';
 * 
 * root.render(<App />);
 * 
 * @component
 */
function App() {
  // ========================================================================
  // Inicializar tema
  // ========================================================================
  useTheme()

  // ========================================================================
  // Validación y logging de configuración
  // ========================================================================
  
  /**
   * Efecto que se ejecuta una sola vez al montar
   * 
   * Responsabilidades:
   * 1. Validar que la configuración sea correcta
   * 2. Loguear la configuración en modo debug
   * 3. Lanzar error si algo está mal configurado
   */
  useEffect(() => {
    try {
      // Validar configuración
      validateConfig();
      
      // Loguear en modo debug
      logConfig();
      
      console.log('✅ Configuración validada correctamente');
    } catch (error) {
      console.error('❌ Error de configuración:', error);
      if (import.meta.env.DEV) {
        throw error; // En desarrollo, falla el app
      }
    }
  }, []);

  // ========================================================================
  // State del carrito
  // ========================================================================
  
  /**
   * Hook personalizado que combina:
   * - useReducer: Gestión de estado del carrito
   * - useEffect: Auto-persistencia a localStorage
   * - useState: Tracking del estado de persistencia
   * 
   * Retorna:
   * - state: { data: Guitar[], cart: CartItem[] }
   * - dispatch: Función para despachar acciones
   * - persistenceStatus: 'idle' | 'loading' | 'error' | 'success'
   * - persistenceError: null | string (mensaje de error)
   */
  const [state, dispatch, persistenceStatus, persistenceError] = useCartWithPersistence();

  // ========================================================================
  // Manejo de errores de persistencia
  // ========================================================================

  /**
   * Si hay error de persistencia, loguearlo
   * Pero la app sigue funcionando (es no-crítico)
   * El usuario puede seguir comprando, solo que sin persistencia
   */
  if (persistenceStatus === 'error') {
    console.warn('⚠️  Advertencia de persistencia:', persistenceError);
  }

  return (
    <>
      {/* Header: Logo + Carrito desplegable */}
      <Header
        cart={state.cart}
        dispatch={dispatch}
      />

      {/* Main: Galería de guitarras */}
      <main className="container-xl mt-5">
        <h2 className="text-center">Nuestra Colección</h2>

        <div className="row mt-5">
          {/* Renderizar cada guitarra */}
          {state.data.map((guitar) => (
            <Guitar 
              key={guitar.id} 
              guitar={guitar} 
              dispatch={dispatch} 
            />
          ))}
        </div>
      </main>

      {/* Footer: Copyright */}
      <footer className="bg-dark mt-5 py-5">
        <div className="container-xl">
          <p className="text-white text-center fs-4 mt-4 m-md-0">
            GuitarLA - Todos los derechos Reservados
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;

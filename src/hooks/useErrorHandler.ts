/**
 * @fileoverview Hook para manejar errores globales con contexto
 * 
 * Proporciona:
 * - Captura de errores no manejados
 * - Almacenamiento de contexto del usuario
 * - Logging detallado de errores
 * - Error boundary integration
 * 
 * @example
 * import { useErrorHandler } from '@/hooks/useErrorHandler';
 * 
 * function App() {
 *   useErrorHandler();
 *   
 *   return <MainContent />;
 * }
 * 
 * @module hooks/useErrorHandler
 */

import { useEffect } from 'react';
import { logger } from '../utils/logger';

/**
 * Contexto de usuario para debugging
 * 
 * @typedef {Object} UserContext
 * @property {string} [userId] - ID del usuario
 * @property {string} [action] - Acción que estaba realizando
 * @property {any} [state] - Estado de la app
 */
interface UserContext {
  userId?: string;
  action?: string;
  state?: any;
}

/**
 * Contexto global para tracking de errores
 * Se asigna al objeto window para acceso global
 */
let errorContext: UserContext = {};

/**
 * Setear contexto de usuario para debugging
 * 
 * @param {UserContext} context - Contexto a setear
 * 
 * @example
 * setErrorContext({
 *   userId: user.id,
 *   action: 'Adding item to cart',
 *   state: { cartSize: 3 }
 * });
 */
export function setErrorContext(context: UserContext): void {
  errorContext = { ...errorContext, ...context };
}

/**
 * Obtener contexto actual
 * 
 * @returns {UserContext} Contexto actual
 */
export function getErrorContext(): UserContext {
  return errorContext;
}

/**
 * Hook para capturar errores no manejados globales
 * 
 * Se ejecuta una sola vez al montar
 * Configura listeners para:
 * - Error events (errores no capturados)
 * - Unhandled Promise rejections
 * 
 * @returns {void}
 * 
 * @example
 * function App() {
 *   useErrorHandler();
 *   
 *   return <MainContent />;
 * }
 */
export function useErrorHandler(): void {
  useEffect(() => {
    /**
     * Manejador de errores globales
     * Se ejecuta cuando hay un error no capturado
     */
    const handleError = (event: ErrorEvent) => {
      const context = getErrorContext();

      logger.error('Uncaught error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        context: context,
      });

      return false;
    };

    /**
     * Manejador de promise rejections no manejadas
     * Se ejecuta cuando un promise es rechazado sin .catch()
     */
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const context = getErrorContext();

      logger.error('Unhandled promise rejection', event.reason, {
        promise: event.promise,
        context: context,
      });

      return false;
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    logger.info('Error handler initialized');

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}

/**
 * Hook para envolver async operations con error handling
 * 
 * @param {string} operationName - Nombre de la operación
 * @returns {Function} Función que wrappea async operations
 * 
 * @example
 * const handleAsyncWithError = useAsyncErrorHandler('LoadData');
 * 
 * const handleClick = handleAsyncWithError(async () => {
 *   const data = await fetchData();
 *   setData(data);
 * });
 */
export function useAsyncErrorHandler(operationName: string) {
  return async (asyncFn: () => Promise<void>) => {
    try {
      await asyncFn();
    } catch (error) {
      logger.error(`Error in ${operationName}`, error as Error, {
        context: getErrorContext(),
      });
      throw error;
    }
  };
}

/**
 * Wrapper para capturar errores síncronos
 * 
 * @param {string} operationName - Nombre de la operación
 * @param {Function} fn - Función a ejecutar
 * @returns {any} Resultado de la función
 * 
 * @example
 * const result = withErrorContext('ParseJSON', () => {
 *   return JSON.parse(jsonString);
 * });
 */
export function withErrorContext<T>(
  operationName: string,
  fn: () => T
): T | null {
  try {
    return fn();
  } catch (error) {
    logger.error(`Error in ${operationName}`, error as Error, {
      context: getErrorContext(),
    });
    return null;
  }
}

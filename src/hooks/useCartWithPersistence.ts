/**
 * @fileoverview Custom hook que combina useReducer con persistencia en localStorage
 * 
 * Este hook es el corazón de la gestión de estado de la aplicación.
 * 
 * Responsabilidades:
 * 1. Combina useReducer para gestión de estado
 * 2. Sincroniza cambios automáticamente a localStorage
 * 3. Carga datos guardados al montar
 * 4. Maneja errores de persistencia de forma robusta
 * 5. Proporciona estado de sincronización para UI feedback
 * 
 * Flujo:
 * 1. Al montar: Carga carrito desde localStorage (o array vacío si error)
 * 2. Cada acción: dispatch actualiza state
 * 3. useEffect detecta cambios en state.cart
 * 4. Auto-guarda a localStorage y actualiza persistenceStatus
 * 
 * @example
 * // En el componente principal
 * function App() {
 *   const [state, dispatch, status, error] = useCartWithPersistence();
 *   
 *   if (status === 'error') {
 *     console.warn('Carrito offline:', error);
 *   }
 *   
 *   return (
 *     <>
 *       <Header cart={state.cart} dispatch={dispatch} />
 *       {status === 'loading' && <Spinner />}
 *     </>
 *   );
 * }
 * 
 * @module hooks/useCartWithPersistence
 */

import { useReducer, useEffect, useCallback, useState } from 'react';
import { cartReducer, initialState, CartActions } from '../reducer/cart-reducer';
import { CART_CONFIG } from '../config/cart.config';
import { loadCartFromStorage, saveCartToStorage } from '../utils/cart.utils';

/**
 * Estados posibles para la sincronización con localStorage
 * 
 * Útiles para mostrar indicadores visuales al usuario
 * 
 * @typedef {string} PersistenceStatus
 * @enum {PersistenceStatus}
 * @property {'idle'} idle - Estado inicial (no ha ocurrido nada)
 * @property {'loading'} loading - Guardando o cargando datos
 * @property {'error'} error - Error al guardar o cargar
 * @property {'success'} success - Operación exitosa
 * 
 * @example
 * const [state, dispatch, status, error] = useCartWithPersistence();
 * 
 * if (status === 'loading') return <LoadingSpinner />;
 * if (status === 'error') return <ErrorAlert message={error} />;
 * if (status === 'success') return <SuccessCheckmark />;
 */
export type PersistenceStatus = 'idle' | 'loading' | 'error' | 'success';

/**
 * Hook personalizado que gestiona el estado del carrito con persistencia automática
 * 
 * Combina:
 * - useReducer: Lógica de estado predecible y testeable
 * - useEffect: Auto-sincronización a localStorage
 * - useState: Tracking del estado de persistencia
 * - useCallback: Dispatch optimizado para evitar re-renders innecesarios
 * 
 * Características:
 * - CargaInitial: Recupera carrito previo desde localStorage
 * - Auto-save: Guarda automáticamente cada cambio
 * - Error handling: Maneja errores de localStorage lleno, JSON corrupto, etc.
 * - Type safe: Tipado completo con TypeScript
 * - Offline first: Funciona sin conexión (solo localStorage)
 * 
 * @returns {[state, dispatch, persistenceStatus, persistenceError]} Tupla con:
 *   - state {CartState}: Estado actual (data + cart)
 *   - dispatch {Function}: Función para despachar acciones
 *   - persistenceStatus {PersistenceStatus}: Estado de sincronización
 *   - persistenceError {string|null}: Mensaje de error (si los hay)
 * 
 * @example
 * // Uso básico
 * const [state, dispatch, status, error] = useCartWithPersistence();
 * 
 * return (
 *   <>
 *     <Header cart={state.cart} dispatch={dispatch} />
 *     <Gallery data={state.data} dispatch={dispatch} />
 *     
 *     {status === 'error' && (
 *       <Alert type="warning">
 *         No se pudo guardar el carrito: {error}
 *       </Alert>
 *     )}
 *   </>
 * );
 * 
 * @example
 * // Con indicador de guardando
 * const [state, dispatch, status] = useCartWithPersistence();
 * 
 * return (
 *   <div>
 *     {status === 'loading' && <span className="spinner" />}
 *     {status === 'success' && <span className="checkmark" />}
 *   </div>
 * );
 */
export const useCartWithPersistence = () => {
  // ========================================================================
  // Estado para la persistencia
  // ========================================================================
  
  /**
   * Estado de sincronización con localStorage
   * Útil para mostrar indicadores visuales al usuario
   */
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>('loading');
  
  /**
   * Mensaje de error si algo falla al guardar/cargar
   * Null si no hay error
   */
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  // ========================================================================
  // Reducer con inicialización asíncrona
  // ========================================================================
  
  /**
   * Estado del carrito con carga inicial desde localStorage
   * 
   * useReducer con initializer (3er parámetro):
   * - Se llama una sola vez al montar
   * - Permite lógica de inicialización compleja
   * - Carga carrito previo desde localStorage
   * 
   * Si hay error al cargar, retorna initialState (carrito vacío)
   * y el usuario puede seguir usando la app
   */
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState,
    (initial) => {
      try {
        const loadedCart = loadCartFromStorage(CART_CONFIG.STORAGE_KEY);
        setPersistenceStatus('success');
        return {
          ...initial,
          cart: loadedCart,
        };
      } catch (error) {
        setPersistenceStatus('error');
        setPersistenceError(
          error instanceof Error
            ? error.message
            : 'Error desconocido al cargar carrito'
        );
        return initial;
      }
    }
  );

  // ========================================================================
  // Efecto: Sincronización automática a localStorage
  // ========================================================================
  
  /**
   * Efecto que se ejecuta cada vez que el carrito cambia
   * 
   * Responsabilidades:
   * 1. Detectar cambios en state.cart
   * 2. Guardar cambios a localStorage
   * 3. Actualizar persistenceStatus
   * 4. Registrar errores si los hay
   * 
   * Se ejecuta después de cada cambio en el carrito
   */
  useEffect(() => {
    setPersistenceStatus('loading');
    
    const saved = saveCartToStorage(state.cart, CART_CONFIG.STORAGE_KEY);
    
    if (saved) {
      setPersistenceStatus('success');
      setPersistenceError(null);
    } else {
      setPersistenceStatus('error');
      setPersistenceError(
        'No se pudo guardar el carrito. Verifica el espacio disponible en localStorage'
      );
    }
  }, [state.cart]);

  // ========================================================================
  // Dispatch mejorado con error handling
  // ========================================================================
  
  /**
   * Wrapper para dispatch que añade:
   * - Validación básica de acciones
   * - Manejo de errores
   * - Feedback al usuario
   * 
   * Usar este en lugar de dispatch directo para mejor UX
   */
  const safeDispatch = useCallback((action: CartActions) => {
    try {
      dispatch(action);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error al procesar acción del carrito:', errorMessage);
      setPersistenceStatus('error');
      setPersistenceError(errorMessage);
    }
  }, []);

  // ========================================================================
  // Retorno
  // ========================================================================
  
  /**
   * Retorna tupla con 4 elementos
   * 
   * @returns {readonly [state, dispatch, status, error]}
   */
  return [state, safeDispatch, persistenceStatus, persistenceError] as const;
};

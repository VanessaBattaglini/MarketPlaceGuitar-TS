/**
 * Custom hook que combina useReducer con persistencia en localStorage
 * Abstrae toda la lógica de sincronización carrito-storage con manejo robusto de errores
 */

import { useReducer, useEffect, useCallback, useState } from 'react';
import { cartReducer, initialState, CartActions } from '../reducer/cart-reducer';
import { CART_CONFIG } from '../config/cart.config';
import { loadCartFromStorage, saveCartToStorage } from '../utils/cart.utils';

/**
 * Estados posibles para la sincronización con localStorage
 */
export type PersistenceStatus = 'idle' | 'loading' | 'error' | 'success';

/**
 * Hook que gestiona el estado del carrito con persistencia automática
 * 
 * Responsabilidades:
 * - Inicializa el carrito desde localStorage de forma segura
 * - Sincroniza cambios automáticamente
 * - Maneja errores de persistencia
 * - Proporciona estado de sincronización
 * 
 * @returns Tupla con [state, dispatch, persistenceStatus, persistenceError]
 * 
 * @example
 * const [state, dispatch, status, error] = useCartWithPersistence();
 * if (status === 'error') console.error('Error:', error);
 */
export const useCartWithPersistence = () => {
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>('loading');
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  // Estado inicial con carrito cargado desde storage
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

  /**
   * Efecto: Sincroniza cambios del carrito a localStorage
   * Se ejecuta cada vez que el carrito cambia
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

  /**
   * Wrapper para dispatch que añade validación básica y manejo de errores
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

  return [state, safeDispatch, persistenceStatus, persistenceError] as const;
};

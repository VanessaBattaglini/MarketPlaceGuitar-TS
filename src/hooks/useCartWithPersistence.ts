/**
 * Custom hook que combina useReducer con persistencia en localStorage
 * Abstrae toda la lógica de sincronización carrito-storage
 */

import { useReducer, useEffect, useCallback } from 'react';
import { cartReducer, initialState, CartActions } from '../reducer/cart-reducer';
import { CART_CONFIG } from '../config/cart.config';
import { loadCartFromStorage, saveCartToStorage } from '../utils/cart.utils';

/**
 * Hook que gestiona el estado del carrito con persistencia automática
 * 
 * Responsabilidades:
 * - Inicializa el carrito desde localStorage
 * - Sincroniza cambios automáticamente
 * - Maneja errores de persistencia
 * 
 * @returns Tupla con [state, dispatch] similar a useReducer
 * 
 * @example
 * const [state, dispatch] = useCartWithPersistence();
 * dispatch({ type: 'add-to-cart', payload: { item: guitar } });
 */
export const useCartWithPersistence = () => {
  // Estado inicial con carrito cargado desde storage
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState,
    (initial) => ({
      ...initial,
      cart: loadCartFromStorage(CART_CONFIG.STORAGE_KEY),
    })
  );

  /**
   * Efecto: Sincroniza cambios del carrito a localStorage
   * Se ejecuta cada vez que el carrito cambia
   */
  useEffect(() => {
    const saved = saveCartToStorage(state.cart, CART_CONFIG.STORAGE_KEY);
    
    if (!saved) {
      console.error(
        'No se pudo guardar el carrito. Verifica el espacio disponible en localStorage'
      );
    }
  }, [state.cart]);

  /**
   * Wrapper para dispatch que añade validación básica
   * (Opcional: puede extenderse con más validaciones)
   */
  const safeDispatch = useCallback((action: CartActions) => {
    try {
      dispatch(action);
    } catch (error) {
      console.error('Error al procesar acción del carrito:', error);
    }
  }, []);

  return [state, safeDispatch] as const;
};

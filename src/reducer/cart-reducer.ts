/**
 * @fileoverview Reducer para gestionar el estado del carrito de compras
 * 
 * Implementa el patrón Redux usando useReducer de React.
 * 
 * Arquitectura:
 * - CartState: Almacena datos disponibles (todas las guitarras) y carrito actual
 * - CartActions: Union type de todas las acciones posibles
 * - cartReducer: Función pura que transforma estado basado en acciones
 * 
 * Principios:
 * - Inmutabilidad: Nunca modifica el estado existente
 * - Tipo seguro: Usa discriminated unions para type safety
 * - Puro: Sin efectos secundarios, determinista
 * - Testeable: Fácil de unit test porque son funciones puras
 * 
 * @example
 * // En un componente
 * const [state, dispatch] = useReducer(cartReducer, initialState);
 * 
 * // Despachar acciones
 * dispatch({
 *   type: CART_ACTION_TYPES.ADD_TO_CART,
 *   payload: { item: guitar }
 * });
 * 
 * @module reducer/cart-reducer
 */

import { CartItem, Guitar } from '../types/types';
import { db } from '../data/db';
import { CART_CONFIG, CART_ACTION_TYPES } from '../config/cart.config';
import {
  findCartItemById,
} from '../utils/cart.utils';

/**
 * Re-exportar CART_ACTION_TYPES para usar en componentes
 * 
 * Permite a los componentes importar desde el reducer en lugar del config
 */
export { CART_ACTION_TYPES };

/**
 * Define todas las acciones posibles en el carrito
 * 
 * Usa discriminated union para type safety:
 * - El campo 'type' distingue qué acción es
 * - TypeScript puede inferir automáticamente el payload correcto
 * 
 * @example
 * // TypeScript autocompleta el payload según el type
 * const action: CartActions = {
 *   type: CART_ACTION_TYPES.ADD_TO_CART,
 *   payload: { item: guitar } // Type checked!
 * };
 */
export type CartActions = 
  | { type: typeof CART_ACTION_TYPES.ADD_TO_CART; payload: { item: Guitar } }
  | { type: typeof CART_ACTION_TYPES.REMOVE_FROM_CART; payload: { id: Guitar['id'] } }
  | { type: typeof CART_ACTION_TYPES.INCREASE_QUANTITY; payload: { id: Guitar['id'] } }
  | { type: typeof CART_ACTION_TYPES.DECREASE_QUANTITY; payload: { id: Guitar['id'] } }
  | { type: typeof CART_ACTION_TYPES.CLEAR_CART };

/**
 * Estado del carrito de compras
 * 
 * Contiene:
 * - data: Lista completa de guitarras disponibles (no cambia durante la sesión)
 * - cart: Items actualmente en el carrito (se actualiza con acciones)
 * 
 * @example
 * // Estructura típica
 * {
 *   data: [
 *     { id: 1, name: 'Guitar 1', ... },
 *     { id: 2, name: 'Guitar 2', ... }
 *   ],
 *   cart: [
 *     { id: 1, name: 'Guitar 1', quantity: 2, ... }
 *   ]
 * }
 */
export type CartState = {
  /** Lista de todas las guitarras disponibles para compra */
  data: Guitar[];
  /** Items actualmente en el carrito */
  cart: CartItem[];
};

/**
 * Estado inicial del carrito
 * 
 * Se inicializa con:
 * - data: Todas las guitarras desde db.ts
 * - cart: Array vacío (se llena desde localStorage luego)
 * 
 * Nota: La persistencia en localStorage se maneja en el hook
 * useCartWithPersistence, no aquí en el reducer
 * 
 * @constant
 * @type {CartState}
 */
export const initialState: CartState = {
  data: db,
  cart: [],
};

/**
 * Reducer puro para gestionar las acciones del carrito
 * 
 * Patrón reducer:
 * 1. Recibe estado actual + acción
 * 2. Retorna nuevo estado (NUNCA modifica el anterior)
 * 3. Es una función pura (mismo input = mismo output)
 * 
 * Usa switch/case con handlers separados para cada acción
 * 
 * @param {CartState} [state=initialState] - Estado actual del carrito
 * @param {CartActions} action - Acción a procesar
 * @returns {CartState} Nuevo estado después de aplicar la acción
 * 
 * @example
 * const newState = cartReducer(currentState, {
 *   type: CART_ACTION_TYPES.ADD_TO_CART,
 *   payload: { item: guitar }
 * });
 */
export const cartReducer = (
  state: CartState = initialState,
  action: CartActions
): CartState => {
  switch (action.type) {
    case CART_ACTION_TYPES.ADD_TO_CART:
      return handleAddToCart(state, action);

    case CART_ACTION_TYPES.REMOVE_FROM_CART:
      return handleRemoveFromCart(state, action);

    case CART_ACTION_TYPES.INCREASE_QUANTITY:
      return handleIncreaseQuantity(state, action);

    case CART_ACTION_TYPES.DECREASE_QUANTITY:
      return handleDecreaseQuantity(state, action);

    case CART_ACTION_TYPES.CLEAR_CART:
      return handleClearCart(state);

    default:
      // Exhaustiveness check: si TypeScript no se queja, cubrimos todos los cases
      return state;
  }
};

/**
 * Maneja la acción ADD_TO_CART
 * 
 * Comportamiento:
 * - Si el artículo YA EXISTE: aumenta cantidad (máximo MAX_ITEMS)
 * - Si el artículo NO EXISTE: lo agrega con cantidad INITIAL_QUANTITY
 * 
 * @param {CartState} state - Estado actual
 * @param {Object} action - Acción con item a agregar
 * @returns {CartState} Nuevo estado con item agregado o cantidad aumentada
 * 
 * @example
 * // Item no existe: se agrega
 * { cart: [] } -> handleAddToCart -> { cart: [{ id: 1, quantity: 1 }] }
 * 
 * @example
 * // Item existe: se incrementa cantidad
 * { cart: [{ id: 1, quantity: 2 }] } -> handleAddToCart -> 
 * { cart: [{ id: 1, quantity: 3 }] }
 */
function handleAddToCart(
  state: CartState,
  action: Extract<CartActions, { type: typeof CART_ACTION_TYPES.ADD_TO_CART }>
): CartState {
  const { item } = action.payload;
  const existingItem = findCartItemById(state.cart, item.id);

  let updatedCart: CartItem[];

  if (existingItem) {
    // Incrementar cantidad si está bajo el máximo
    if (existingItem.quantity < CART_CONFIG.MAX_ITEMS) {
      updatedCart = state.cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
    } else {
      // Ya está al máximo, no cambiar
      updatedCart = state.cart;
    }
  } else {
    // Agregar nuevo item con cantidad inicial
    const newItem: CartItem = {
      ...item,
      quantity: CART_CONFIG.INITIAL_QUANTITY,
    };
    updatedCart = [...state.cart, newItem];
  }

  return {
    ...state,
    cart: updatedCart,
  };
}

/**
 * Maneja la acción REMOVE_FROM_CART
 * 
 * Elimina un artículo del carrito por su ID
 * Si el artículo no existe, el estado no cambia
 * 
 * @param {CartState} state - Estado actual
 * @param {Object} action - Acción con ID del item a remover
 * @returns {CartState} Nuevo estado con item removido
 * 
 * @example
 * { cart: [{ id: 1 }, { id: 2 }] } -> handleRemoveFromCart(id: 1) -> 
 * { cart: [{ id: 2 }] }
 */
function handleRemoveFromCart(
  state: CartState,
  action: Extract<CartActions, { type: typeof CART_ACTION_TYPES.REMOVE_FROM_CART }>
): CartState {
  const filteredCart = state.cart.filter(
    (item) => item.id !== action.payload.id
  );

  return {
    ...state,
    cart: filteredCart,
  };
}

/**
 * Maneja la acción INCREASE_QUANTITY
 * 
 * Aumenta la cantidad de un artículo en 1
 * Solo incrementa si cantidad < MAX_ITEMS
 * 
 * @param {CartState} state - Estado actual
 * @param {Object} action - Acción con ID del item
 * @returns {CartState} Nuevo estado con cantidad aumentada (o sin cambios)
 * 
 * @example
 * { cart: [{ id: 1, quantity: 2 }] } -> handleIncreaseQuantity(id: 1) ->
 * { cart: [{ id: 1, quantity: 3 }] }
 */
function handleIncreaseQuantity(
  state: CartState,
  action: Extract<CartActions, { type: typeof CART_ACTION_TYPES.INCREASE_QUANTITY }>
): CartState {
  const updatedCart = state.cart.map((item) => {
    if (
      item.id === action.payload.id &&
      item.quantity < CART_CONFIG.MAX_ITEMS
    ) {
      return {
        ...item,
        quantity: item.quantity + 1,
      };
    }
    return item;
  });

  return {
    ...state,
    cart: updatedCart,
  };
}

/**
 * Maneja la acción DECREASE_QUANTITY
 * 
 * Disminuye la cantidad de un artículo en 1
 * Solo disminuye si cantidad > MIN_ITEMS
 * 
 * Nota: No elimina el artículo cuando llega a cantidad 1
 * Para eliminar, usar REMOVE_FROM_CART
 * 
 * @param {CartState} state - Estado actual
 * @param {Object} action - Acción con ID del item
 * @returns {CartState} Nuevo estado con cantidad disminuida (o sin cambios)
 * 
 * @example
 * { cart: [{ id: 1, quantity: 2 }] } -> handleDecreaseQuantity(id: 1) ->
 * { cart: [{ id: 1, quantity: 1 }] }
 */
function handleDecreaseQuantity(
  state: CartState,
  action: Extract<CartActions, { type: typeof CART_ACTION_TYPES.DECREASE_QUANTITY }>
): CartState {
  const updatedCart = state.cart.map((item) => {
    if (
      item.id === action.payload.id &&
      item.quantity > CART_CONFIG.MIN_ITEMS
    ) {
      return {
        ...item,
        quantity: item.quantity - 1,
      };
    }
    return item;
  });

  return {
    ...state,
    cart: updatedCart,
  };
}

/**
 * Maneja la acción CLEAR_CART
 * 
 * Vacía completamente el carrito
 * 
 * @param {CartState} state - Estado actual
 * @returns {CartState} Nuevo estado con carrito vacío
 * 
 * @example
 * { cart: [{ id: 1 }, { id: 2 }] } -> handleClearCart -> { cart: [] }
 */
function handleClearCart(state: CartState): CartState {
  return {
    ...state,
    cart: [],
  };
}

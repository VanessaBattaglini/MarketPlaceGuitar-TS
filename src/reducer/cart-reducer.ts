/**
 * Reducer para gestionar el estado del carrito de compras
 * Maneja todas las acciones relacionadas con agregar, quitar y modificar items
 */

import { CartItem, Guitar } from '../types/types';
import { db } from '../data/db';
import { CART_CONFIG, CART_ACTION_TYPES } from '../config/cart.config';
import {
  findCartItemById,
} from '../utils/cart.utils';

/**
 * Define todas las acciones posibles en el carrito
 */
export type CartActions = 
  | { type: typeof CART_ACTION_TYPES.ADD_TO_CART; payload: { item: Guitar } }
  | { type: typeof CART_ACTION_TYPES.REMOVE_FROM_CART; payload: { id: Guitar['id'] } }
  | { type: typeof CART_ACTION_TYPES.INCREASE_QUANTITY; payload: { id: Guitar['id'] } }
  | { type: typeof CART_ACTION_TYPES.DECREASE_QUANTITY; payload: { id: Guitar['id'] } }
  | { type: typeof CART_ACTION_TYPES.CLEAR_CART };

/**
 * Estado del carrito que incluye datos de guitarras disponibles y items en el carrito
 */
export type CartState = {
  /** Lista de guitarras disponibles para compra */
  data: Guitar[];
  /** Items actualmente en el carrito */
  cart: CartItem[];
};

/**
 * Estado inicial del carrito
 * Se inicializa con todas las guitarras disponibles y carrito vacío
 * (La persistencia se maneja en el hook useCartWithPersistence)
 */
export const initialState: CartState = {
  data: db,
  cart: [],
};

/**
 * Reducer para gestionar las acciones del carrito
 * @param state - Estado actual del carrito
 * @param action - Acción a ejecutar
 * @returns Nuevo estado después de aplicar la acción
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
      return state;
  }
};

/**
 * Maneja la acción de agregar un artículo al carrito
 * Si ya existe, incrementa la cantidad (hasta MAX_ITEMS)
 * Si no existe, lo agrega con cantidad inicial
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
 * Maneja la acción de remover un artículo del carrito
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
 * Maneja la acción de aumentar cantidad de un artículo
 * Solo aumenta si está bajo el máximo permitido
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
 * Maneja la acción de disminuir cantidad de un artículo
 * Solo disminuye si está sobre el mínimo permitido
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
 * Maneja la acción de vaciar el carrito
 */
function handleClearCart(state: CartState): CartState {
  return {
    ...state,
    cart: [],
  };
}

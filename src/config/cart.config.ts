/**
 * @fileoverview Configuración centralizada del carrito de compras
 * 
 * Este módulo define todas las constantes, límites y valores por defecto
 * utilizados en toda la aplicación para garantizar consistencia.
 * 
 * Cambiar estos valores aquí afecta automáticamente todo el comportamiento del carrito.
 * 
 * @example
 * // Aumentar la cantidad máxima permitida
 * CART_CONFIG.MAX_ITEMS = 10;
 * 
 * @module config/cart.config
 */

/**
 * Configuración del carrito de compras
 * 
 * Todos los valores son inmutables (const) para evitar cambios accidentales.
 * Usa estos valores en lugar de hardcodear números en el código.
 * 
 * @constant
 * @type {Object}
 * @property {number} MAX_ITEMS - Cantidad máxima de ítems iguales permitidos (default: 5)
 * @property {number} MIN_ITEMS - Cantidad mínima de ítems permitidos (default: 1)
 * @property {string} STORAGE_KEY - Clave para localStorage donde se persiste el carrito (default: "cart")
 * @property {number} INITIAL_QUANTITY - Cantidad inicial cuando se agrega un artículo (default: 1)
 * 
 * @example
 * import { CART_CONFIG } from '../config/cart.config';
 * 
 * // Validar cantidad
 * if (quantity > CART_CONFIG.MAX_ITEMS) {
 *   console.warn('Cantidad excede el máximo permitido');
 * }
 * 
 * // Acceder a datos de localStorage
 * const cart = localStorage.getItem(CART_CONFIG.STORAGE_KEY);
 */
export const CART_CONFIG = {
  /** 
   * Cantidad máxima de ítems iguales permitidos en el carrito
   * @type {number}
   */
  MAX_ITEMS: 5,
  
  /** 
   * Cantidad mínima de ítems permitidos
   * @type {number}
   */
  MIN_ITEMS: 1,
  
  /** 
   * Clave del localStorage donde se persiste el carrito
   * @type {string}
   */
  STORAGE_KEY: 'cart',
  
  /** 
   * Cantidad inicial de un artículo cuando se añade al carrito
   * @type {number}
   */
  INITIAL_QUANTITY: 1,
};

/**
 * Tipos de acciones disponibles en el carrito
 * 
 * Usa estas constantes en lugar de strings para evitar typos y obtener
 * autocompletado en el IDE.
 * 
 * @constant
 * @type {Object}
 * @property {string} ADD_TO_CART - Agregar artículo al carrito
 * @property {string} REMOVE_FROM_CART - Remover artículo del carrito
 * @property {string} INCREASE_QUANTITY - Aumentar cantidad de un artículo
 * @property {string} DECREASE_QUANTITY - Disminuir cantidad de un artículo
 * @property {string} CLEAR_CART - Vaciar todo el carrito
 * 
 * @example
 * import { CART_ACTION_TYPES } from '../config/cart.config';
 * 
 * dispatch({
 *   type: CART_ACTION_TYPES.ADD_TO_CART,
 *   payload: { item: guitar }
 * });
 */
export const CART_ACTION_TYPES = {
  /** Agregar guitarra al carrito o aumentar cantidad si ya existe */
  ADD_TO_CART: 'add-to-cart',
  
  /** Remover una guitarra específica del carrito */
  REMOVE_FROM_CART: 'remove-from-cart',
  
  /** Aumentar cantidad de una guitarra (hasta MAX_ITEMS) */
  INCREASE_QUANTITY: 'increase-quantity',
  
  /** Disminuir cantidad de una guitarra (hasta MIN_ITEMS) */
  DECREASE_QUANTITY: 'decrease-quantity',
  
  /** Vaciar completamente el carrito */
  CLEAR_CART: 'clear-cart',
} as const;

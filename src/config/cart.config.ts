/**
 * Configuración central del carrito de compras
 * Define límites, constantes y valores por defecto
 */

export const CART_CONFIG = {
  /** Cantidad máxima de ítems iguales permitidos en el carrito */
  MAX_ITEMS: 5,
  
  /** Cantidad mínima de ítems permitidos */
  MIN_ITEMS: 1,
  
  /** Clave del localStorage donde se persiste el carrito */
  STORAGE_KEY: 'cart',
  
  /** Cantidad inicial de un artículo añadido al carrito */
  INITIAL_QUANTITY: 1,
};

/** Tipos de acciones disponibles en el carrito */
export const CART_ACTION_TYPES = {
  ADD_TO_CART: 'add-to-cart',
  REMOVE_FROM_CART: 'remove-from-cart',
  INCREASE_QUANTITY: 'increase-quantity',
  DECREASE_QUANTITY: 'decrease-quantity',
  CLEAR_CART: 'clear-cart',
} as const;

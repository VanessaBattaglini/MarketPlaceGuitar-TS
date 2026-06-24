/**
 * @fileoverview Utilidades para validación y manipulación de datos del carrito
 * 
 * Este módulo proporciona funciones puras para:
 * - Validar guitarras, ítems del carrito y carritos completos usando Zod
 * - Cargar y guardar el carrito desde/a localStorage de forma segura
 * - Buscar y consultar ítems en el carrito
 * 
 * Todas las funciones de validación son type guards que proporcionan
 * type narrowing automático al IDE.
 * 
 * @example
 * import { isValidCart, loadCartFromStorage } from '../utils/cart.utils';
 * 
 * const cart = loadCartFromStorage('cart');
 * if (isValidCart(cart)) {
 *   // TypeScript sabe que 'cart' es CartItem[]
 *   console.log(cart.length);
 * }
 * 
 * @module utils/cart.utils
 */

import { CartItem, Guitar } from '../types/types';
import { CART_CONFIG } from '../config/cart.config';
import { 
  guitarSchema, 
  cartItemSchema, 
  cartArraySchema,
  safeValidate,
  getZodErrorMessages 
} from '../schemas/guitar.schema';
import { z } from 'zod';

// ============================================================================
// Type Guards (Validadores)
// ============================================================================

/**
 * Valida que un objeto sea una Guitar válida usando Zod
 * 
 * Type guard que proporciona type narrowing automático:
 * - Si retorna true: TypeScript sabe que el objeto es Guitar
 * - Ideal para usar en condicionales
 * 
 * @param {unknown} data - Objeto a validar
 * @returns {boolean} true si el objeto es un Guitar válido, false en caso contrario
 * 
 * @example
 * const unknown: unknown = JSON.parse(json);
 * if (isValidGuitar(unknown)) {
 *   // TypeScript sabe que 'unknown' es Guitar
 *   console.log(unknown.price);
 * }
 */
export const isValidGuitar = (data: unknown): data is Guitar => {
  return safeValidate(data, guitarSchema) !== null;
};

/**
 * Valida que un objeto sea un CartItem válido usando Zod
 * 
 * Verifica que sea una guitarra válida + cantidad dentro de límites
 * 
 * @param {unknown} data - Objeto a validar
 * @returns {boolean} true si es un CartItem válido
 * 
 * @example
 * if (isValidCartItem(item)) {
 *   console.log(`${item.name} x ${item.quantity}`);
 * }
 */
export const isValidCartItem = (data: unknown): data is CartItem => {
  return safeValidate(data, cartItemSchema) !== null;
};

/**
 * Valida que un array sea un carrito válido usando Zod
 * 
 * Verifica que sea un array de CartItems válidos
 * Un array vacío se considera válido
 * 
 * @param {unknown} data - Array a validar
 * @returns {boolean} true si es un array válido de CartItems
 * 
 * @example
 * const cart = [{ id: 1, name: 'Guitar', ... }];
 * if (isValidCart(cart)) {
 *   // TypeScript sabe que cart es CartItem[]
 * }
 */
export const isValidCart = (data: unknown): data is CartItem[] => {
  return safeValidate(data, cartArraySchema) !== null;
};

/**
 * Valida y retorna una Guitar, lanzando error si es inválido
 * 
 * A diferencia de isValidGuitar, esta función lanza un error
 * en lugar de retornar false. Útil para operaciones críticas
 * donde querrías que falle ruidosamente.
 * 
 * @param {unknown} data - Objeto a validar
 * @returns {Guitar} La guitarra validada
 * @throws {Error} Si la validación falla con mensajes detallados
 * 
 * @example
 * try {
 *   const guitar = validateGuitar(unknownData);
 *   // Usar guitar...
 * } catch (error) {
 *   console.error('Guitarra inválida:', error.message);
 * }
 */
export const validateGuitar = (data: unknown): Guitar => {
  try {
    return guitarSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = getZodErrorMessages(error);
      throw new Error(`Validación de guitarra fallida: ${messages.join(', ')}`);
    }
    throw error;
  }
};

/**
 * Valida y retorna un CartItem, lanzando error si es inválido
 * 
 * @param {unknown} data - Objeto a validar
 * @returns {CartItem} El item validado
 * @throws {Error} Si la validación falla con mensajes detallados
 * 
 * @example
 * const item = validateCartItem(data);
 */
export const validateCartItem = (data: unknown): CartItem => {
  try {
    return cartItemSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = getZodErrorMessages(error);
      throw new Error(`Validación de item inválida: ${messages.join(', ')}`);
    }
    throw error;
  }
};

// ============================================================================
// Persistencia en localStorage
// ============================================================================

/**
 * Carga el carrito desde localStorage de forma segura
 * 
 * Maneja todos los errores posibles:
 * - localStorage no disponible
 * - JSON malformado
 * - Datos que no cumplen el schema
 * 
 * Nunca lanza error. Si algo falla, retorna array vacío
 * y registra un warning en console.
 * 
 * @param {string} storageKey - Clave del localStorage (default: CART_CONFIG.STORAGE_KEY)
 * @returns {CartItem[]} Array de ítems o array vacío si error
 * 
 * @example
 * const cart = loadCartFromStorage('cart');
 * // Si hay error: retorna [], imprime warning en console
 * 
 * @example
 * // Con clave personalizada
 * const tempCart = loadCartFromStorage('temp-cart');
 */
export const loadCartFromStorage = (storageKey: string): CartItem[] => {
  try {
    const storedData = localStorage.getItem(storageKey);
    
    if (!storedData) {
      return [];
    }
    
    const parsedData = JSON.parse(storedData);
    
    // Validar que sea un carrito válido usando Zod
    if (isValidCart(parsedData)) {
      return parsedData;
    }
    
    console.warn(
      'Datos del carrito inválidos en localStorage. Iniciando carrito vacío.'
    );
    return [];
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Error al parsear carrito de localStorage (JSON inválido):', error);
    } else {
      console.error('Error inesperado al cargar carrito de localStorage:', error);
    }
    return [];
  }
};

/**
 * Guarda el carrito en localStorage de forma segura
 * 
 * Valida que el carrito sea válido antes de guardar.
 * Maneja el error de localStorage lleno (DOMException code 22).
 * 
 * @param {CartItem[]} cart - Carrito a guardar
 * @param {string} storageKey - Clave del localStorage
 * @returns {boolean} true si se guardó exitosamente, false en error
 * 
 * @example
 * const success = saveCartToStorage(cart, 'cart');
 * if (!success) {
 *   console.warn('No se pudo guardar el carrito');
 * }
 * 
 * @example
 * // Guardar y validar
 * if (!saveCartToStorage(updatedCart, CART_CONFIG.STORAGE_KEY)) {
 *   // Manejar error...
 * }
 */
export const saveCartToStorage = (
  cart: CartItem[],
  storageKey: string
): boolean => {
  try {
    // Validar que el carrito sea válido antes de guardar
    if (!isValidCart(cart)) {
      console.error('Intento de guardar carrito inválido');
      return false;
    }
    
    localStorage.setItem(storageKey, JSON.stringify(cart));
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.code === 22) {
      console.error('localStorage lleno, no se puede guardar carrito');
    } else {
      console.error('Error al guardar carrito en localStorage:', error);
    }
    return false;
  }
};

// ============================================================================
// Búsqueda y Consultas
// ============================================================================

/**
 * Valida que la cantidad esté dentro de los límites permitidos
 * 
 * Verifica:
 * - Es un número entero
 * - Está entre MIN_ITEMS y MAX_ITEMS (inclusive)
 * 
 * @param {number} quantity - Cantidad a validar
 * @returns {boolean} true si la cantidad es válida
 * 
 * @example
 * if (isValidQuantity(quantity)) {
 *   // Cantidad está entre 1 y 5
 * }
 */
export const isValidQuantity = (quantity: number): boolean => {
  return (
    Number.isInteger(quantity) &&
    quantity >= CART_CONFIG.MIN_ITEMS &&
    quantity <= CART_CONFIG.MAX_ITEMS
  );
};

/**
 * Busca un artículo en el carrito por su ID
 * 
 * Búsqueda O(n) - recorre el array hasta encontrar
 * 
 * @param {CartItem[]} cart - Carrito donde buscar
 * @param {number} id - ID del artículo a buscar
 * @returns {CartItem | undefined} El CartItem encontrado o undefined
 * 
 * @example
 * const item = findCartItemById(cart, 5);
 * if (item) {
 *   console.log(`Encontrado: ${item.name}`);
 * }
 */
export const findCartItemById = (cart: CartItem[], id: number): CartItem | undefined => {
  return cart.find(item => item.id === id);
};

/**
 * Verifica si un artículo existe en el carrito
 * 
 * Más eficiente que findCartItemById si solo necesitas saber
 * si existe, ya que retorna boolean en lugar del objeto completo.
 * 
 * @param {CartItem[]} cart - Carrito donde verificar
 * @param {number} id - ID del artículo a verificar
 * @returns {boolean} true si el artículo existe en el carrito
 * 
 * @example
 * if (itemExistsInCart(cart, guitarId)) {
 *   // Ya está en el carrito, aumentar cantidad...
 * } else {
 *   // Agregar como nuevo item...
 * }
 */
export const itemExistsInCart = (cart: CartItem[], id: number): boolean => {
  return cart.some(item => item.id === id);
};

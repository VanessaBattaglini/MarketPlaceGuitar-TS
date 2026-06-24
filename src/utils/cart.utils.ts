/**
 * Utilidades para validación y manipulación de datos del carrito
 * Usa Zod para validación type-safe
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

/**
 * Valida que un objeto sea un Guitar válido usando Zod
 * @param data - Objeto a validar
 * @returns true si el objeto es un Guitar válido
 */
export const isValidGuitar = (data: unknown): data is Guitar => {
  return safeValidate(data, guitarSchema) !== null;
};

/**
 * Valida que un objeto sea un CartItem válido usando Zod
 * @param data - Objeto a validar
 * @returns true si el objeto es un CartItem válido
 */
export const isValidCartItem = (data: unknown): data is CartItem => {
  return safeValidate(data, cartItemSchema) !== null;
};

/**
 * Valida que un array sea un carrito válido usando Zod
 * @param data - Array a validar
 * @returns true si es un array válido de CartItems
 */
export const isValidCart = (data: unknown): data is CartItem[] => {
  return safeValidate(data, cartArraySchema) !== null;
};

/**
 * Valida y retorna un Guitar, lanzando error si es inválido
 * Útil para operaciones críticas
 * @param data - Objeto a validar
 * @returns Guitar validado
 * @throws Error si la validación falla
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
 * @param data - Objeto a validar
 * @returns CartItem validado
 * @throws Error si la validación falla
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

/**
 * Carga el carrito desde localStorage de forma segura
 * Si hay error en los datos, retorna un array vacío y registra la advertencia
 * @returns Array de CartItems o array vacío si hay error
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
 * @param cart - Carrito a guardar
 * @param storageKey - Clave del localStorage
 * @returns true si se guardó exitosamente, false en caso de error
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

/**
 * Valida que la cantidad esté dentro de los límites
 * @param quantity - Cantidad a validar
 * @returns true si la cantidad es válida
 */
export const isValidQuantity = (quantity: number): boolean => {
  return (
    Number.isInteger(quantity) &&
    quantity >= CART_CONFIG.MIN_ITEMS &&
    quantity <= CART_CONFIG.MAX_ITEMS
  );
};

/**
 * Busca un artículo en el carrito por ID
 * @param cart - Carrito a buscar
 * @param id - ID del artículo
 * @returns El CartItem encontrado o undefined
 */
export const findCartItemById = (cart: CartItem[], id: number): CartItem | undefined => {
  return cart.find(item => item.id === id);
};

/**
 * Verifica si un artículo existe en el carrito
 * @param cart - Carrito a verificar
 * @param id - ID del artículo
 * @returns true si el artículo existe
 */
export const itemExistsInCart = (cart: CartItem[], id: number): boolean => {
  return cart.some(item => item.id === id);
};

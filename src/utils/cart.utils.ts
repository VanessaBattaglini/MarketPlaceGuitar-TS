/**
 * Utilidades para validación y manipulación de datos del carrito
 */

import { CartItem, Guitar } from '../types/types';
import { CART_CONFIG } from '../config/cart.config';

/**
 * Valida que un objeto sea un Guitar válido
 * @param data - Objeto a validar
 * @returns true si el objeto es un Guitar válido
 */
export const isValidGuitar = (data: unknown): data is Guitar => {
  if (typeof data !== 'object' || data === null) return false;
  
  const guitar = data as Record<string, unknown>;
  return (
    typeof guitar.id === 'number' &&
    typeof guitar.name === 'string' &&
    typeof guitar.image === 'string' &&
    typeof guitar.description === 'string' &&
    typeof guitar.price === 'number' &&
    guitar.price > 0
  );
};

/**
 * Valida que un objeto sea un CartItem válido
 * @param data - Objeto a validar
 * @returns true si el objeto es un CartItem válido
 */
export const isValidCartItem = (data: unknown): data is CartItem => {
  if (!isValidGuitar(data)) return false;
  
  const item = data as Record<string, unknown>;
  return (
    typeof item.quantity === 'number' &&
    item.quantity >= CART_CONFIG.MIN_ITEMS &&
    item.quantity <= CART_CONFIG.MAX_ITEMS
  );
};

/**
 * Valida que un array sea un carrito válido
 * @param data - Array a validar
 * @returns true si es un array válido de CartItems
 */
export const isValidCart = (data: unknown): data is CartItem[] => {
  if (!Array.isArray(data)) return false;
  return data.every(isValidCartItem);
};

/**
 * Carga el carrito desde localStorage de forma segura
 * Si hay error en los datos, retorna un array vacío
 * @returns Array de CartItems o array vacío si hay error
 */
export const loadCartFromStorage = (storageKey: string): CartItem[] => {
  try {
    const storedData = localStorage.getItem(storageKey);
    
    if (!storedData) return [];
    
    const parsedData = JSON.parse(storedData);
    
    // Validar que sea un carrito válido
    if (isValidCart(parsedData)) {
      return parsedData;
    }
    
    console.warn('Datos del carrito inválidos en localStorage, iniciando vacío');
    return [];
  } catch (error) {
    console.warn('Error al cargar carrito de localStorage:', error);
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
    localStorage.setItem(storageKey, JSON.stringify(cart));
    return true;
  } catch (error) {
    console.error('Error al guardar carrito en localStorage:', error);
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

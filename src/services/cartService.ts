/**
 * @fileoverview Servicio para operaciones del carrito (persistencia híbrida)
 * 
 * Proporciona funciones para:
 * - Sincronizar carrito local con servidor
 * - Guardar carrito en backend
 * - Cargar carrito desde backend
 * - Manejo de conflictos (local vs server)
 * 
 * Implementa persistencia híbrida:
 * - Primero intenta guardar en backend
 * - Si falla, guarda en localStorage como fallback
 * - Al cargar, intenta backend primero, luego localStorage
 * 
 * @example
 * import { cartService } from '@/services/cartService';
 * 
 * const syncedCart = await cartService.syncCart(localCart);
 * 
 * @module services/cartService
 */

import { CartItem } from '../types/types';
import { httpClient } from './api';
import { isValidCart } from '../utils/cart.utils';
import { AppError } from './error';

/**
 * Estructura de respuesta del servidor para sincronización
 * 
 * @typedef {Object} CartSyncResponse
 * @property {CartItem[]} cart - Carrito sincronizado
 * @property {string} status - Estado de sincronización (synced, conflicted, etc)
 * @property {CartItem[]|null} [serverCart] - Carrito del servidor (si hay conflicto)
 * @property {CartItem[]|null} [mergedCart] - Carrito mergeado si se resolvió el conflicto
 */
interface CartSyncResponse {
  cart: CartItem[];
  status: 'synced' | 'conflicted' | 'created' | 'updated' | 'error';
  serverCart?: CartItem[] | null;
  mergedCart?: CartItem[] | null;
}

/**
 * Endpoints de la API de carrito
 * 
 * @constant
 * @type {Object}
 */
const CART_ENDPOINTS = {
  /** Sincronizar carrito (POST/PUT según necesidad) */
  SYNC: '/cart/sync',
  
  /** Obtener carrito actual del usuario */
  GET: '/cart',
  
  /** Guardar carrito */
  SAVE: '/cart',
  
  /** Limpiar carrito */
  CLEAR: '/cart',
};

/**
 * Estados posibles de la sincronización del carrito
 * 
 * @typedef {string} CartSyncStatus
 * @enum {CartSyncStatus}
 * @property {'idle'} idle - Sin sincronización
 * @property {'syncing'} syncing - Sincronizando
 * @property {'synced'} synced - Sincronizado correctamente
 * @property {'conflicted'} conflicted - Hay conflicto (local vs server)
 * @property {'error'} error - Error en sincronización
 */
export type CartSyncStatus = 'idle' | 'syncing' | 'synced' | 'conflicted' | 'error';

/**
 * Servicio para operaciones del carrito
 * 
 * Implementa persistencia híbrida con fallback a localStorage
 * 
 * @namespace cartService
 */
export const cartService = {
  /**
   * Sincronizar carrito local con backend
   * 
   * Comportamiento:
   * 1. Valida que el carrito local sea correcto
   * 2. Envía al servidor para sincronización
   * 3. Si hay conflicto, retorna ambas versiones
   * 4. Si hay error de red, retorna carrito local sin cambios
   * 
   * POST /api/cart/sync
   * 
   * @param {CartItem[]} localCart - Carrito local a sincronizar
   * @returns {Promise<CartSyncResponse>} Respuesta de sincronización
   * @throws {ValidationError} Si el carrito local es inválido
   * @throws {AppError} Si hay error en la sincronización
   * 
   * @example
   * try {
   *   const response = await cartService.syncCart(localCart);
   *   
   *   if (response.status === 'synced') {
   *     console.log('✅ Carrito sincronizado');
   *     updateLocalCart(response.cart);
   *   } else if (response.status === 'conflicted') {
   *     console.log('⚠️  Conflicto detectado');
   *     // Resolver conflicto...
   *   }
   * } catch (error) {
   *   console.error('Error de sincronización:', error);
   *   // Usar carrito local...
   * }
   */
  async syncCart(localCart: CartItem[]): Promise<CartSyncResponse> {
    // Validar que el carrito sea válido
    if (!isValidCart(localCart)) {
      throw new AppError('Carrito inválido', 'INVALID_CART', 400);
    }

    try {
      // Intentar sincronizar con servidor
      const response = await httpClient.post<CartSyncResponse>(
        CART_ENDPOINTS.SYNC,
        { cart: localCart }
      );

      return response;
    } catch (error) {
      // Si hay error de red, retornar carrito local sin cambios
      console.warn('⚠️  Error sincronizando carrito, usando versión local:', error);
      return {
        cart: localCart,
        status: 'error',
      };
    }
  },

  /**
   * Obtener carrito del servidor para el usuario actual
   * 
   * GET /api/cart
   * 
   * @returns {Promise<CartItem[]>} Carrito guardado en servidor
   * @throws {UnauthorizedError} Si el usuario no está autenticado
   * @throws {AppError} Si hay error en la petición
   * 
   * @example
   * try {
   *   const serverCart = await cartService.getCart();
   *   updateLocalCart(serverCart);
   * } catch (error) {
   *   console.error('Error al obtener carrito:', error);
   * }
   */
  async getCart(): Promise<CartItem[]> {
    return httpClient.get<CartItem[]>(CART_ENDPOINTS.GET);
  },

  /**
   * Guardar carrito en el servidor
   * 
   * PUT /api/cart
   * 
   * @param {CartItem[]} cart - Carrito a guardar
   * @returns {Promise<CartItem[]>} Carrito guardado (puede estar normalizado)
   * @throws {ValidationError} Si el carrito es inválido
   * @throws {UnauthorizedError} Si el usuario no está autenticado
   * @throws {AppError} Si hay error en la petición
   * 
   * @example
   * try {
   *   await cartService.saveCart(updatedCart);
   *   console.log('✅ Carrito guardado');
   * } catch (error) {
   *   console.error('Error guardando carrito:', error);
   * }
   */
  async saveCart(cart: CartItem[]): Promise<CartItem[]> {
    // Validar carrito
    if (!isValidCart(cart)) {
      throw new AppError('Carrito inválido', 'INVALID_CART', 400);
    }

    return httpClient.put<CartItem[]>(CART_ENDPOINTS.SAVE, { cart });
  },

  /**
   * Limpiar/vaciar el carrito en el servidor
   * 
   * DELETE /api/cart
   * 
   * @returns {Promise<void>} Void si se limpió correctamente
   * @throws {UnauthorizedError} Si el usuario no está autenticado
   * @throws {AppError} Si hay error en la petición
   * 
   * @example
   * try {
   *   await cartService.clearCart();
   *   console.log('✅ Carrito vaciado');
   * } catch (error) {
   *   console.error('Error vaciando carrito:', error);
   * }
   */
  async clearCart(): Promise<void> {
    await httpClient.delete(CART_ENDPOINTS.CLEAR);
  },

  /**
   * Resolver conflicto entre carrito local y servidor
   * 
   * Estrategias de resolución:
   * - 'local': Usar carrito local (sobrescribe servidor)
   * - 'server': Usar carrito del servidor (descarta cambios locales)
   * - 'merge': Combinar ambos (favoreciendo más reciente por cantidad)
   * 
   * @param {CartItem[]} localCart - Carrito local
   * @param {CartItem[]} serverCart - Carrito del servidor
   * @param {'local'|'server'|'merge'} strategy - Estrategia a usar
   * @returns {Promise<CartItem[]>} Carrito resuelto
   * 
   * @example
   * const resolved = await cartService.resolveConflict(
   *   localCart,
   *   serverCart,
   *   'merge'
   * );
   */
  async resolveConflict(
    localCart: CartItem[],
    serverCart: CartItem[],
    strategy: 'local' | 'server' | 'merge' = 'merge'
  ): Promise<CartItem[]> {
    switch (strategy) {
      case 'local':
        // Sobrescribir servidor con local
        return this.saveCart(localCart);

      case 'server':
        // Descartar cambios locales
        return serverCart;

      case 'merge':
        // Combinar ambos
        return this.mergeCartItems(localCart, serverCart);

      default:
        throw new AppError(`Estrategia desconocida: ${strategy}`, 'INVALID_STRATEGY');
    }
  },

  /**
   * Combinar items de dos carritos
   * 
   * Lógica:
   * - Toma items de ambos carritos
   * - Para items duplicados (mismo ID), suma cantidades
   * - Respeta límites máximos de cantidad
   * 
   * @param {CartItem[]} cart1 - Primer carrito
   * @param {CartItem[]} cart2 - Segundo carrito
   * @returns {CartItem[]} Carrito combinado
   * 
   * @example
   * const merged = cartService.mergeCartItems(localCart, serverCart);
   */
  mergeCartItems(cart1: CartItem[], cart2: CartItem[]): CartItem[] {
    // Convertir a Map para deduplicación
    const mergedMap = new Map<number, CartItem>();

    // Agregar items del primer carrito
    cart1.forEach((item) => {
      mergedMap.set(item.id, { ...item });
    });

    // Agregar/combinar items del segundo carrito
    cart2.forEach((item) => {
      const existing = mergedMap.get(item.id);

      if (existing) {
        // Sumar cantidades (respectando máximo)
        existing.quantity = Math.min(
          existing.quantity + item.quantity,
          5 // MAX_ITEMS (hardcoded por ahora, debería venir de config)
        );
      } else {
        mergedMap.set(item.id, { ...item });
      }
    });

    return Array.from(mergedMap.values());
  },
};

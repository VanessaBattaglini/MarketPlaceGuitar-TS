/**
 * Tests para funciones de utilidades del carrito
 * Validación de datos y persistencia en localStorage
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isValidGuitar,
  isValidCartItem,
  isValidCart,
  loadCartFromStorage,
  saveCartToStorage,
  isValidQuantity,
  findCartItemById,
  itemExistsInCart,
} from '../cart.utils';
import { CART_CONFIG } from '../../config/cart.config';
import type { Guitar, CartItem } from '../../types/types';

// Mock data
const mockGuitar: Guitar = {
  id: 1,
  name: 'Test Guitar',
  image: 'test-image',
  description: 'Test Description',
  price: 299.99,
};

const mockCartItem: CartItem = {
  ...mockGuitar,
  quantity: 2,
};

describe('cart.utils - Validadores', () => {
  describe('isValidGuitar', () => {
    it('debe validar una guitarra correcta', () => {
      expect(isValidGuitar(mockGuitar)).toBe(true);
    });

    it('debe rechazar guitarra sin id', () => {
      const invalid = { ...mockGuitar, id: undefined };
      expect(isValidGuitar(invalid)).toBe(false);
    });

    it('debe rechazar guitarra con precio negativo', () => {
      const invalid = { ...mockGuitar, price: -100 };
      expect(isValidGuitar(invalid)).toBe(false);
    });

    it('debe rechazar objeto no guitarra', () => {
      expect(isValidGuitar({ name: 'Test' })).toBe(false);
      expect(isValidGuitar(null)).toBe(false);
      expect(isValidGuitar('string')).toBe(false);
    });
  });

  describe('isValidCartItem', () => {
    it('debe validar un cart item correcto', () => {
      expect(isValidCartItem(mockCartItem)).toBe(true);
    });

    it('debe rechazar cantidad fuera de rango (menor)', () => {
      const invalid = { ...mockCartItem, quantity: 0 };
      expect(isValidCartItem(invalid)).toBe(false);
    });

    it('debe rechazar cantidad fuera de rango (mayor)', () => {
      const invalid = { ...mockCartItem, quantity: CART_CONFIG.MAX_ITEMS + 1 };
      expect(isValidCartItem(invalid)).toBe(false);
    });

    it('debe aceptar cantidad en límites', () => {
      const item1 = { ...mockCartItem, quantity: CART_CONFIG.MIN_ITEMS };
      const item2 = { ...mockCartItem, quantity: CART_CONFIG.MAX_ITEMS };
      expect(isValidCartItem(item1)).toBe(true);
      expect(isValidCartItem(item2)).toBe(true);
    });
  });

  describe('isValidCart', () => {
    it('debe validar un carrito vacío', () => {
      expect(isValidCart([])).toBe(true);
    });

    it('debe validar un carrito con items válidos', () => {
      const cart = [mockCartItem, { ...mockCartItem, id: 2 }];
      expect(isValidCart(cart)).toBe(true);
    });

    it('debe rechazar carrito con item inválido', () => {
      const cart = [mockCartItem, { ...mockCartItem, quantity: 999 }];
      expect(isValidCart(cart)).toBe(false);
    });

    it('debe rechazar si no es un array', () => {
      expect(isValidCart('not-array')).toBe(false);
      expect(isValidCart({ items: [] })).toBe(false);
    });
  });

  describe('isValidQuantity', () => {
    it('debe validar cantidad válida', () => {
      expect(isValidQuantity(1)).toBe(true);
      expect(isValidQuantity(3)).toBe(true);
      expect(isValidQuantity(CART_CONFIG.MAX_ITEMS)).toBe(true);
    });

    it('debe rechazar cantidad fuera de rango', () => {
      expect(isValidQuantity(0)).toBe(false);
      expect(isValidQuantity(CART_CONFIG.MAX_ITEMS + 1)).toBe(false);
    });

    it('debe rechazar decimales', () => {
      expect(isValidQuantity(2.5)).toBe(false);
    });
  });
});

describe('cart.utils - Búsqueda', () => {
  const mockCart: CartItem[] = [
    mockCartItem,
    { ...mockCartItem, id: 2, name: 'Guitar 2' },
    { ...mockCartItem, id: 3, name: 'Guitar 3' },
  ];

  describe('findCartItemById', () => {
    it('debe encontrar item por id', () => {
      const found = findCartItemById(mockCart, 2);
      expect(found).toEqual(mockCart[1]);
    });

    it('debe retornar undefined si no existe', () => {
      const found = findCartItemById(mockCart, 999);
      expect(found).toBeUndefined();
    });

    it('debe retornar undefined en carrito vacío', () => {
      const found = findCartItemById([], 1);
      expect(found).toBeUndefined();
    });
  });

  describe('itemExistsInCart', () => {
    it('debe retornar true si existe', () => {
      expect(itemExistsInCart(mockCart, 2)).toBe(true);
    });

    it('debe retornar false si no existe', () => {
      expect(itemExistsInCart(mockCart, 999)).toBe(false);
    });

    it('debe retornar false en carrito vacío', () => {
      expect(itemExistsInCart([], 1)).toBe(false);
    });
  });
});

describe('cart.utils - Persistencia en localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveCartToStorage', () => {
    it('debe guardar carrito válido', () => {
      const cart = [mockCartItem];
      const result = saveCartToStorage(cart, CART_CONFIG.STORAGE_KEY);
      expect(result).toBe(true);
      expect(localStorage.getItem(CART_CONFIG.STORAGE_KEY)).toBeDefined();
    });

    it('debe guardar carrito vacío', () => {
      const result = saveCartToStorage([], CART_CONFIG.STORAGE_KEY);
      expect(result).toBe(true);
    });

    it('debe retornar false si carrito es inválido', () => {
      const invalidCart = [{ ...mockCartItem, quantity: 999 }];
      const result = saveCartToStorage(invalidCart, CART_CONFIG.STORAGE_KEY);
      expect(result).toBe(false);
    });
  });

  describe('loadCartFromStorage', () => {
    it('debe cargar carrito guardado', () => {
      const cart = [mockCartItem];
      localStorage.setItem(CART_CONFIG.STORAGE_KEY, JSON.stringify(cart));
      
      const loaded = loadCartFromStorage(CART_CONFIG.STORAGE_KEY);
      expect(loaded).toEqual(cart);
    });

    it('debe retornar vacío si no existe', () => {
      const loaded = loadCartFromStorage(CART_CONFIG.STORAGE_KEY);
      expect(loaded).toEqual([]);
    });

    it('debe retornar vacío si JSON es inválido', () => {
      localStorage.setItem(CART_CONFIG.STORAGE_KEY, 'invalid-json{');
      
      const loaded = loadCartFromStorage(CART_CONFIG.STORAGE_KEY);
      expect(loaded).toEqual([]);
    });

    it('debe retornar vacío si datos no cumplen schema', () => {
      const invalidData = [{ ...mockCartItem, quantity: 999 }];
      localStorage.setItem(CART_CONFIG.STORAGE_KEY, JSON.stringify(invalidData));
      
      const loaded = loadCartFromStorage(CART_CONFIG.STORAGE_KEY);
      expect(loaded).toEqual([]);
    });
  });

  describe('Ciclo completo: guardar y cargar', () => {
    it('debe guardar y cargar carrito correctamente', () => {
      const originalCart = [mockCartItem, { ...mockCartItem, id: 2 }];
      
      // Guardar
      const saved = saveCartToStorage(originalCart, CART_CONFIG.STORAGE_KEY);
      expect(saved).toBe(true);
      
      // Cargar
      const loaded = loadCartFromStorage(CART_CONFIG.STORAGE_KEY);
      expect(loaded).toEqual(originalCart);
    });
  });
});

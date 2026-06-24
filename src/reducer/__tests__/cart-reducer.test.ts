/**
 * Tests para el reducer del carrito
 * Valida todas las acciones y transiciones de estado
 */

import { describe, it, expect } from 'vitest';
import {
  cartReducer,
  initialState,
  CartActions,
  CART_ACTION_TYPES,
} from '../cart-reducer';
import { CART_CONFIG } from '../../config/cart.config';
import type { Guitar, CartItem } from '../../types/types';

// Mock data
const mockGuitar: Guitar = {
  id: 1,
  name: 'Test Guitar',
  image: 'test',
  description: 'Test',
  price: 299.99,
};

const mockGuitar2: Guitar = {
  id: 2,
  name: 'Test Guitar 2',
  image: 'test2',
  description: 'Test 2',
  price: 399.99,
};

describe('cartReducer', () => {
  describe('Estado inicial', () => {
    it('debe tener estado inicial válido', () => {
      expect(initialState.cart).toEqual([]);
      expect(initialState.data.length).toBeGreaterThan(0);
    });
  });

  describe('ADD_TO_CART', () => {
    it('debe agregar item al carrito vacío', () => {
      const action: CartActions = {
        type: CART_ACTION_TYPES.ADD_TO_CART,
        payload: { item: mockGuitar },
      };

      const state = cartReducer(initialState, action);
      expect(state.cart).toHaveLength(1);
      expect(state.cart[0]).toEqual({
        ...mockGuitar,
        quantity: CART_CONFIG.INITIAL_QUANTITY,
      });
    });

    it('debe aumentar cantidad si item ya existe', () => {
      const stateWithItem = {
        ...initialState,
        cart: [{ ...mockGuitar, quantity: 2 }],
      };

      const action: CartActions = {
        type: CART_ACTION_TYPES.ADD_TO_CART,
        payload: { item: mockGuitar },
      };

      const state = cartReducer(stateWithItem, action);
      expect(state.cart).toHaveLength(1);
      expect(state.cart[0].quantity).toBe(3);
    });

    it('no debe exceder MAX_ITEMS', () => {
      const stateWithMaxItems = {
        ...initialState,
        cart: [{ ...mockGuitar, quantity: CART_CONFIG.MAX_ITEMS }],
      };

      const action: CartActions = {
        type: CART_ACTION_TYPES.ADD_TO_CART,
        payload: { item: mockGuitar },
      };

      const state = cartReducer(stateWithMaxItems, action);
      expect(state.cart[0].quantity).toBe(CART_CONFIG.MAX_ITEMS);
    });

    it('debe agregar múltiples items diferentes', () => {
      let state = initialState;

      // Agregar primer item
      state = cartReducer(state, {
        type: CART_ACTION_TYPES.ADD_TO_CART,
        payload: { item: mockGuitar },
      });

      // Agregar segundo item
      state = cartReducer(state, {
        type: CART_ACTION_TYPES.ADD_TO_CART,
        payload: { item: mockGuitar2 },
      });

      expect(state.cart).toHaveLength(2);
      expect(state.cart[0].id).toBe(1);
      expect(state.cart[1].id).toBe(2);
    });
  });

  describe('REMOVE_FROM_CART', () => {
    it('debe remover item del carrito', () => {
      const stateWithItems = {
        ...initialState,
        cart: [
          { ...mockGuitar, quantity: 1 },
          { ...mockGuitar2, quantity: 2 },
        ],
      };

      const action: CartActions = {
        type: CART_ACTION_TYPES.REMOVE_FROM_CART,
        payload: { id: 1 },
      };

      const state = cartReducer(stateWithItems, action);
      expect(state.cart).toHaveLength(1);
      expect(state.cart[0].id).toBe(2);
    });

    it('debe hacer nada si item no existe', () => {
      const stateWithItems = {
        ...initialState,
        cart: [{ ...mockGuitar, quantity: 1 }],
      };

      const action: CartActions = {
        type: CART_ACTION_TYPES.REMOVE_FROM_CART,
        payload: { id: 999 },
      };

      const state = cartReducer(stateWithItems, action);
      expect(state.cart).toHaveLength(1);
    });
  });

  describe('INCREASE_QUANTITY', () => {
    it('debe aumentar cantidad', () => {
      const stateWithItem = {
        ...initialState,
        cart: [{ ...mockGuitar, quantity: 2 }],
      };

      const action: CartActions = {
        type: CART_ACTION_TYPES.INCREASE_QUANTITY,
        payload: { id: 1 },
      };

      const state = cartReducer(stateWithItem, action);
      expect(state.cart[0].quantity).toBe(3);
    });

    it('no debe exceder MAX_ITEMS', () => {
      const stateWithMaxItems = {
        ...initialState,
        cart: [{ ...mockGuitar, quantity: CART_CONFIG.MAX_ITEMS }],
      };

      const action: CartActions = {
        type: CART_ACTION_TYPES.INCREASE_QUANTITY,
        payload: { id: 1 },
      };

      const state = cartReducer(stateWithMaxItems, action);
      expect(state.cart[0].quantity).toBe(CART_CONFIG.MAX_ITEMS);
    });

    it('debe ignorar si item no existe', () => {
      const stateWithItem = {
        ...initialState,
        cart: [{ ...mockGuitar, quantity: 1 }],
      };

      const action: CartActions = {
        type: CART_ACTION_TYPES.INCREASE_QUANTITY,
        payload: { id: 999 },
      };

      const state = cartReducer(stateWithItem, action);
      expect(state.cart[0].quantity).toBe(1);
    });
  });

  describe('DECREASE_QUANTITY', () => {
    it('debe disminuir cantidad', () => {
      const stateWithItem = {
        ...initialState,
        cart: [{ ...mockGuitar, quantity: 3 }],
      };

      const action: CartActions = {
        type: CART_ACTION_TYPES.DECREASE_QUANTITY,
        payload: { id: 1 },
      };

      const state = cartReducer(stateWithItem, action);
      expect(state.cart[0].quantity).toBe(2);
    });

    it('no debe bajar de MIN_ITEMS', () => {
      const stateWithMinItems = {
        ...initialState,
        cart: [{ ...mockGuitar, quantity: CART_CONFIG.MIN_ITEMS }],
      };

      const action: CartActions = {
        type: CART_ACTION_TYPES.DECREASE_QUANTITY,
        payload: { id: 1 },
      };

      const state = cartReducer(stateWithMinItems, action);
      expect(state.cart[0].quantity).toBe(CART_CONFIG.MIN_ITEMS);
    });

    it('debe ignorar si item no existe', () => {
      const stateWithItem = {
        ...initialState,
        cart: [{ ...mockGuitar, quantity: 2 }],
      };

      const action: CartActions = {
        type: CART_ACTION_TYPES.DECREASE_QUANTITY,
        payload: { id: 999 },
      };

      const state = cartReducer(stateWithItem, action);
      expect(state.cart[0].quantity).toBe(2);
    });
  });

  describe('CLEAR_CART', () => {
    it('debe vaciar el carrito', () => {
      const stateWithItems = {
        ...initialState,
        cart: [
          { ...mockGuitar, quantity: 1 },
          { ...mockGuitar2, quantity: 2 },
        ],
      };

      const action: CartActions = {
        type: CART_ACTION_TYPES.CLEAR_CART,
      };

      const state = cartReducer(stateWithItems, action);
      expect(state.cart).toEqual([]);
    });

    it('debe hacer nada si carrito ya está vacío', () => {
      const action: CartActions = {
        type: CART_ACTION_TYPES.CLEAR_CART,
      };

      const state = cartReducer(initialState, action);
      expect(state.cart).toEqual([]);
    });
  });

  describe('Casos límite', () => {
    it('debe no modificar el estado original (inmutabilidad)', () => {
      const state = { ...initialState };
      const originalCart = [...state.cart];

      cartReducer(state, {
        type: CART_ACTION_TYPES.ADD_TO_CART,
        payload: { item: mockGuitar },
      });

      expect(state.cart).toEqual(originalCart);
    });

    it('debe preservar propiedades de data', () => {
      const action: CartActions = {
        type: CART_ACTION_TYPES.ADD_TO_CART,
        payload: { item: mockGuitar },
      };

      const state = cartReducer(initialState, action);
      expect(state.data).toEqual(initialState.data);
    });
  });
});

/**
 * @fileoverview Componente para una fila individual de la tabla del carrito
 * 
 * Responsabilidades:
 * - Renderizar imagen, nombre, precio unitario del item
 * - Mostrar controles de cantidad (buttons +/-)
 * - Mostrar cantidad actual
 * - Botón para remover item del carrito
 * - Despachar acciones al hacer clic en botones
 * 
 * Estructura de fila:
 * - TD 1: Imagen de la guitarra
 * - TD 2: Nombre del producto
 * - TD 3: Precio unitario
 * - TD 4: Controles de cantidad (-, cantidad, +)
 * - TD 5: Botón remover (X)
 * 
 * @example
 * <CartTableRow item={item} dispatch={dispatch} />
 * 
 * @module components/Cart/CartTableRow
 */

import { CartItem } from '../../types/types';
import { CartActions, CART_ACTION_TYPES } from '../../reducer/cart-reducer';
import { Dispatch } from 'react';
import CartButton from '../Button/CartButton';

/**
 * Props para el componente CartTableRow
 * 
 * @typedef {Object} CartTableRowProps
 * @property {CartItem} item - Item del carrito a renderizar
 * @property {Dispatch<CartActions>} dispatch - Función para despachar acciones
 */
interface CartTableRowProps {
  /** 
   * Item del carrito a mostrar en esta fila
   * Incluye: id, name, image, price, quantity, description
   * @type {CartItem}
   */
  item: CartItem;
  
  /** 
   * Función dispatch del reducer
   * Se usa para despachar: INCREASE_QUANTITY, DECREASE_QUANTITY, REMOVE_FROM_CART
   * @type {Dispatch<CartActions>}
   */
  dispatch: Dispatch<CartActions>;
}

/**
 * Componente CartTableRow - Fila individual de la tabla del carrito
 * 
 * Renderiza una fila (<tr>) con 5 columnas:
 * 1. Imagen del producto (img tag con alt)
 * 2. Nombre del producto
 * 3. Precio unitario (formateado a 2 decimales)
 * 4. Controles de cantidad (CartButton decrease, cantidad, CartButton increase)
 * 5. Botón remover (CartButton remove)
 * 
 * Comportamiento de botones:
 * - Decrease (-): Disminuye cantidad en 1 (mínimo 1 item)
 * - Increase (+): Aumenta cantidad en 1 (máximo 5 items)
 * - Remove (X): Elimina el item del carrito
 * 
 * Accesibilidad:
 * - Imagen con alt text descriptivo
 * - ARIA labels en todos los botones
 * - Estructura semántica con <tr> y <td>
 * - CartButton proporciona aria-label automáticos
 * 
 * @param {CartTableRowProps} props - Props del componente
 * @param {CartItem} props.item - Item a renderizar
 * @param {Dispatch<CartActions>} props.dispatch - Función dispatch
 * 
 * @returns {JSX.Element} Fila HTML (<tr>) con item y controles
 * 
 * @example
 * // Dentro de CartTable <tbody>
 * {cart.map((item) => (
 *   <CartTableRow key={item.id} item={item} dispatch={dispatch} />
 * ))}
 * 
 * @component
 */
export default function CartTableRow({ item, dispatch }: CartTableRowProps) {
  const { id, name, image, price, quantity } = item;

  /**
   * Handlers para las acciones del carrito
   * 
   * Cada handler despacha la acción correspondiente con el ID del item
   * El reducer maneja la lógica de validación (min/max quantities)
   */

  /**
   * Aumenta la cantidad del item en 1
   * Respeta el límite máximo configurado en CART_CONFIG.MAX_ITEMS
   * 
   * @function handleIncrease
   * @returns {void}
   */
  const handleIncrease = () =>
    dispatch({ type: CART_ACTION_TYPES.INCREASE_QUANTITY, payload: { id } });

  /**
   * Disminuye la cantidad del item en 1
   * Respeta el límite mínimo configurado en CART_CONFIG.MIN_ITEMS (1)
   * 
   * @function handleDecrease
   * @returns {void}
   */
  const handleDecrease = () =>
    dispatch({ type: CART_ACTION_TYPES.DECREASE_QUANTITY, payload: { id } });

  /**
   * Remueve completamente el item del carrito
   * No respeta límites de cantidad, elimina directamente
   * 
   * @function handleRemove
   * @returns {void}
   */
  const handleRemove = () =>
    dispatch({ type: CART_ACTION_TYPES.REMOVE_FROM_CART, payload: { id } });

  return (
    <tr>
      {/* Columna 1: Imagen del producto */}
      <td>
        <img
          className="img-fluid"
          src={`/img/${image}.jpg`}
          alt={`Imagen de ${name}`}
        />
      </td>

      {/* Columna 2: Nombre del producto */}
      <td>{name}</td>

      {/* Columna 3: Precio unitario */}
      <td className="fw-bold">${price.toFixed(2)}</td>

      {/* Columna 4: Controles de cantidad */}
      <td className="flex align-items-start gap-4">
        {/* Botón Disminuir (-) */}
        <CartButton
          variant="decrease"
          onClick={handleDecrease}
          aria-label={`Disminuir cantidad de ${name}`}
        />
        
        {/* Cantidad actual */}
        <span className="quantity-display">{quantity}</span>
        
        {/* Botón Aumentar (+) */}
        <CartButton
          variant="increase"
          onClick={handleIncrease}
          aria-label={`Aumentar cantidad de ${name}`}
        />
      </td>

      {/* Columna 5: Botón Remover */}
      <td>
        <CartButton
          variant="remove"
          onClick={handleRemove}
          aria-label={`Remover ${name} del carrito`}
        />
      </td>
    </tr>
  );
}

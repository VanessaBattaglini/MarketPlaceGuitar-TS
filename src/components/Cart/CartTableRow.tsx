/**
 * Componente para una fila de la tabla del carrito
 * Muestra imagen, nombre, precio, cantidad y controles
 */

import { CartItem } from '../../types/types';
import { CartActions, CART_ACTION_TYPES } from '../../reducer/cart-reducer';
import { Dispatch } from 'react';
import CartButton from '../Button/CartButton';

interface CartTableRowProps {
  /** Item del carrito a mostrar */
  item: CartItem;
  /** Función dispatch para acciones */
  dispatch: Dispatch<CartActions>;
}

/**
 * Fila de tabla que muestra un item del carrito
 * Permite aumentar/disminuir cantidad y remover
 */
export default function CartTableRow({ item, dispatch }: CartTableRowProps) {
  const { id, name, image, price, quantity } = item;

  /**
   * Handlers para acciones
   */
  const handleIncrease = () =>
    dispatch({ type: CART_ACTION_TYPES.INCREASE_QUANTITY, payload: { id } });

  const handleDecrease = () =>
    dispatch({ type: CART_ACTION_TYPES.DECREASE_QUANTITY, payload: { id } });

  const handleRemove = () =>
    dispatch({ type: CART_ACTION_TYPES.REMOVE_FROM_CART, payload: { id } });

  return (
    <tr>
      {/* Imagen */}
      <td>
        <img
          className="img-fluid"
          src={`/img/${image}.jpg`}
          alt={`Imagen de ${name}`}
        />
      </td>

      {/* Nombre */}
      <td>{name}</td>

      {/* Precio unitario */}
      <td className="fw-bold">${price.toFixed(2)}</td>

      {/* Cantidad con controles */}
      <td className="flex align-items-start gap-4">
        <CartButton
          variant="decrease"
          onClick={handleDecrease}
          aria-label={`Disminuir cantidad de ${name}`}
        />
        <span className="quantity-display">{quantity}</span>
        <CartButton
          variant="increase"
          onClick={handleIncrease}
          aria-label={`Aumentar cantidad de ${name}`}
        />
      </td>

      {/* Acciones - Remover */}
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

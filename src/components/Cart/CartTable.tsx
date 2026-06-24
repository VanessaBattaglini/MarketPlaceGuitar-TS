/**
 * Componente que renderiza la tabla del carrito
 * Muestra todos los items con precio total
 */

import { CartItem } from '../../types/types';
import { CartActions } from '../../reducer/cart-reducer';
import { Dispatch } from 'react';
import CartTableRow from './CartTableRow';

interface CartTableProps {
  /** Items del carrito a mostrar */
  cart: CartItem[];
  /** Función dispatch para acciones del carrito */
  dispatch: Dispatch<CartActions>;
}

/**
 * Tabla que muestra los items del carrito
 * Calcula y muestra el total a pagar
 */
export default function CartTable({ cart, dispatch }: CartTableProps) {
  /**
   * Calcula el total del carrito
   * Suma: precio * cantidad para cada item
   */
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <>
      <table className="w-100 table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <CartTableRow
              key={item.id}
              item={item}
              dispatch={dispatch}
            />
          ))}
        </tbody>
      </table>

      {/* Total a pagar */}
      <p className="text-end">
        Total pagar: <span className="fw-bold">${cartTotal.toFixed(2)}</span>
      </p>
    </>
  );
}

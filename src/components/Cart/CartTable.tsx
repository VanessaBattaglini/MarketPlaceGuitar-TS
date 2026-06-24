/**
 * @fileoverview Componente que renderiza la tabla del carrito
 * 
 * Responsabilidades:
 * - Renderizar tabla HTML con estructura semántica
 * - Mapear items del carrito a filas usando CartTableRow
 * - Calcular y mostrar el total a pagar
 * - Pasar dispatch a filas para manejar acciones
 * 
 * Estructura de tabla:
 * - <thead>: Encabezados (Imagen, Nombre, Precio, Cantidad, Acciones)
 * - <tbody>: Filas individuales via CartTableRow
 * - Total: Debajo de la tabla
 * 
 * Cálculo del total:
 * - Usa Array.reduce() para sumar: precio * cantidad para cada item
 * - Muestra formateado a 2 decimales
 * 
 * @example
 * <CartTable cart={state.cart} dispatch={dispatch} />
 * 
 * @module components/Cart/CartTable
 */

import { CartItem } from '../../types/types';
import { CartActions } from '../../reducer/cart-reducer';
import { Dispatch } from 'react';
import CartTableRow from './CartTableRow';

/**
 * Props para el componente CartTable
 * 
 * @typedef {Object} CartTableProps
 * @property {CartItem[]} cart - Array de items del carrito a renderizar
 * @property {Dispatch<CartActions>} dispatch - Función para despachar acciones
 */
interface CartTableProps {
  /** 
   * Array de CartItems a mostrar en la tabla
   * Cada item se renderiza como una fila
   * @type {CartItem[]}
   */
  cart: CartItem[];
  
  /** 
   * Función dispatch del reducer para manejar acciones
   * Se pasa a cada CartTableRow para manejar increase/decrease/remove
   * @type {Dispatch<CartActions>}
   */
  dispatch: Dispatch<CartActions>;
}

/**
 * Componente CartTable - Tabla del carrito con todos los items
 * 
 * Renderiza:
 * 1. Tabla HTML Bootstrap con estructura semántica
 * 2. Encabezados: Imagen, Nombre, Precio, Cantidad, Acciones
 * 3. Filas: Cada CartItem renderizado con CartTableRow
 * 4. Total: Suma de precio * cantidad para todos los items
 * 
 * Cálculo del total:
 * - Usa reduce() para iterar todos los items
 * - Multiplica precio * cantidad para cada item
 * - Suma todos los totales individuales
 * - Muestra con 2 decimales usando toFixed(2)
 * 
 * Responsividad:
 * - Usa clases Bootstrap para tabla
 * - CartTableRow se adapta al contenido
 * 
 * Accesibilidad:
 * - Tabla semántica con <thead> y <tbody>
 * - Encabezados claros en <th>
 * - CartTableRow añade aria-labels a botones
 * 
 * @param {CartTableProps} props - Props del componente
 * @param {CartItem[]} props.cart - Items a mostrar
 * @param {Dispatch<CartActions>} props.dispatch - Función dispatch
 * 
 * @returns {JSX.Element} Tabla HTML con items y total
 * 
 * @example
 * {cart.length > 0 ? (
 *   <CartTable cart={cart} dispatch={dispatch} />
 * ) : (
 *   <EmptyCart />
 * )}
 * 
 * @component
 */
export default function CartTable({ cart, dispatch }: CartTableProps) {
  /**
   * Calcula el total del carrito
   * 
   * Lógica:
   * 1. Usa Array.reduce() para acumular
   * 2. Para cada item: suma = suma anterior + (precio * cantidad)
   * 3. Retorna suma total
   * 
   * Ejemplo:
   * - Item 1: $299.99 * 2 = $599.98
   * - Item 2: $149.99 * 1 = $149.99
   * - Total: $749.97
   * 
   * @constant
   * @type {number}
   */
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <>
      {/* Tabla de items */}
      <table className="w-100 table">
        {/* Encabezados */}
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Acciones</th>
          </tr>
        </thead>

        {/* Filas de items */}
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

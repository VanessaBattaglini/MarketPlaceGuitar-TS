/**
 * Componente Header con carrito desplegable y tema
 * 
 * Responsabilidades:
 * - Mostrar logo de la aplicación
 * - Renderizar toggle de tema (light/dark)
 * - Renderizar carrito con dropdown
 * - Mostrar items del carrito, total y controles
 * - Manejar acciones del carrito (aumentar, disminuir, remover, vaciar)
 */

import { CartItem } from "../types/types";
import { useMemo, Dispatch } from "react";
import { CartActions, CART_ACTION_TYPES } from "../reducer/cart-reducer";
import CartTable from "./Cart/CartTable";
import EmptyCart from "./Cart/EmptyCart";
import CartButton from "./Button/CartButton";
import ThemeToggle from "./ThemeToggle/ThemeToggle";
import { useNotification } from "../contexts/NotificationContext";
import "./Cart/Cart.css";

/**
 * Props para el Header
 * 
 * @typedef {Object} HeaderProps
 * @property {CartItem[]} cart - Items en el carrito
 * @property {Dispatch<CartActions>} dispatch - Función para despachar acciones
 */
type HeaderProps = {
  /** Items en el carrito para mostrar */
  cart: CartItem[];
  /** Función dispatch del reducer para manejar acciones */
  dispatch: Dispatch<CartActions>;
};

/**
 * Componente Header con carrito desplegable y toggle de tema
 * 
 * Muestra:
 * - Logo de GuitarLA (clickeable)
 * - Toggle de tema (light/dark mode)
 * - Carrito con dropdown que contiene:
 *   - Lista de items (o mensaje vacío)
 *   - Total a pagar
 *   - Botón para vaciar carrito
 * 
 * El carrito usa hover para mostrar/ocultar el dropdown
 * Los items pueden aumentar/disminuir cantidad o removerse
 * 
 * @component
 * @example
 * <Header cart={state.cart} dispatch={dispatch} />
 */
export default function Header({ cart, dispatch }: HeaderProps) {
  /**
   * Estado derivado: verifica si el carrito está vacío
   * 
   * Memoizado para evitar re-cálculos innecesarios
   * Se actualiza solo cuando 'cart' cambia
   */
  const isEmpty = useMemo(() => cart.length === 0, [cart]);
  const notification = useNotification();

  /**
   * Handler para vaciar el carrito
   * Despacha acción CLEAR_CART al reducer
   * y muestra notificación
   */
  const handleClearCart = () => {
    dispatch({ type: CART_ACTION_TYPES.CLEAR_CART });
    notification.info('Carrito vaciado');
  };

  return (
    <header className="py-5 header">
      <div className="container-xl">
        <div className="row justify-content-center justify-content-md-between">
          {/* Logo */}
          <div className="col-8 col-md-3">
            <a href="index.html">
              <img
                className="img-fluid"
                src="/img/logo.svg"
                alt="Logo de GuitarLA"
              />
            </a>
          </div>

          {/* Carrito y Tema */}
          <nav className="col-md-6 a mt-5 d-flex align-items-start justify-content-end">
            {/* Toggle de Tema */}
            <ThemeToggle />

            {/* Carrito */}
            <div className="carrito">
              <img
                className="img-fluid"
                src="/img/carrito.png"
                alt="Icono del carrito de compras"
              />

              {/* Contenido del carrito desplegable */}
              <div id="carrito" className="bg-white p-3">
                {isEmpty ? (
                  <EmptyCart />
                ) : (
                  <CartTable cart={cart} dispatch={dispatch} />
                )}

                {/* Botón para vaciar carrito */}
                <CartButton
                  variant="add"
                  onClick={handleClearCart}
                  className="mt-3 p-2"
                >
                  Vaciar Carrito
                </CartButton>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

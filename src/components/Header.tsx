import { CartItem } from "../types/types";
import { useMemo, Dispatch } from "react";
import { CartActions, CART_ACTION_TYPES } from "../reducer/cart-reducer";
import CartTable from "./Cart/CartTable";
import EmptyCart from "./Cart/EmptyCart";
import CartButton from "./Button/CartButton";

/**
 * Props para el Header
 */
type HeaderProps = {
  /** Items en el carrito */
  cart: CartItem[];
  /** Función dispatch para acciones del carrito */
  dispatch: Dispatch<CartActions>;
};

/**
 * Componente Header con carrito desplegable
 * Muestra logo, y un carrito con los items
 */
export default function Header({ cart, dispatch }: HeaderProps) {
  /**
   * Estado derivado: verifica si el carrito está vacío
   */
  const isEmpty = useMemo(() => cart.length === 0, [cart]);

  /**
   * Handler para vaciar el carrito
   */
  const handleClearCart = () =>
    dispatch({ type: CART_ACTION_TYPES.CLEAR_CART });

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

          {/* Carrito */}
          <nav className="col-md-6 a mt-5 d-flex align-items-start justify-content-end">
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

import { Dispatch } from "react";
import type { Guitar } from "../types/types";
import type { CartActions } from "../reducer/cart-reducer";
import { CART_ACTION_TYPES } from "../reducer/cart-reducer";
import CartButton from "./Button/CartButton";

/**
 * Props para el componente Guitar
 */
type GuitarProps = {
  /** Datos de la guitarra */
  guitar: Guitar;
  /** Función dispatch para agregar al carrito */
  dispatch: Dispatch<CartActions>;
};

/**
 * Componente que muestra una guitarra individual
 * Permite agregar la guitarra al carrito
 */
export default function Guitar({ guitar, dispatch }: GuitarProps) {
  const { name, image, description, price } = guitar;

  /**
   * Handler para agregar al carrito
   */
  const handleAddToCart = () =>
    dispatch({ type: CART_ACTION_TYPES.ADD_TO_CART, payload: { item: guitar } });

  return (
    <div className="col-md-6 col-lg-4 my-4 row align-items-center">
      {/* Imagen */}
      <div className="col-4">
        <img
          className="img-fluid"
          src={`/img/${image}.jpg`}
          alt={`Imagen de ${name}`}
        />
      </div>

      {/* Información */}
      <div className="col-8">
        <h3 className="text-black fs-4 fw-bold text-uppercase">
          {name}
        </h3>
        <p>{description}</p>
        <p className="fw-black text-primary fs-3">${price.toFixed(2)}</p>

        {/* Botón agregar al carrito */}
        <CartButton
          variant="add"
          onClick={handleAddToCart}
        />
      </div>
    </div>
  );
}
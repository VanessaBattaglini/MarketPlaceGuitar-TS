/**
 * @fileoverview Componente que muestra una guitarra individual en la galería
 * 
 * Responsabilidades:
 * - Mostrar imagen, nombre, descripción y precio de la guitarra
 * - Proporcionar botón para agregar al carrito
 * - Despachar acción ADD_TO_CART cuando se hace clic
 * 
 * Arquitectura:
 * - Componente de presentación (solo renderiza)
 * - Todo state management se maneja en el padre (App)
 * - Props type-safe con TypeScript
 * 
 * Uso:
 * - Se renderiza dentro de un contenedor grid
 * - Estilo Bootstrap para responsive design
 * 
 * @example
 * <Guitar guitar={guitarData} dispatch={dispatch} />
 * 
 * @module components/Guitar
 */

import { Dispatch } from "react";
import type { Guitar } from "../types/types";
import type { CartActions } from "../reducer/cart-reducer";
import { CART_ACTION_TYPES } from "../reducer/cart-reducer";
import CartButton from "./Button/CartButton";

/**
 * Props para el componente Guitar
 * 
 * @typedef {Object} GuitarProps
 * @property {Guitar} guitar - Objeto con datos de la guitarra (id, name, image, description, price)
 * @property {Dispatch<CartActions>} dispatch - Función dispatch del reducer para despachar acciones
 * 
 * @example
 * const props: GuitarProps = {
 *   guitar: { id: 1, name: 'Guitarra acústica', image: 'guitarra_01', description: '...', price: 299.99 },
 *   dispatch: dispatch
 * };
 */
type GuitarProps = {
  /** 
   * Datos completos de la guitarra a mostrar
   * Incluye: id, name, image, description, price
   * @type {Guitar}
   */
  guitar: Guitar;
  
  /** 
   * Función dispatch del reducer de carrito
   * Se usa para despachar acción ADD_TO_CART cuando hace clic en agregar
   * @type {Dispatch<CartActions>}
   */
  dispatch: Dispatch<CartActions>;
};

/**
 * Componente Guitar - Tarjeta de guitarra individual
 * 
 * Renderiza una tarjeta con:
 * - Imagen de la guitarra (izquierda, col-4)
 * - Información: nombre, descripción, precio (derecha, col-8)
 * - Botón "Agregar al Carrito" (component CartButton)
 * 
 * Layout Bootstrap Grid:
 * - Responsive: col-md-6 col-lg-4 (2 por fila en tablet, 3 en desktop)
 * - Alineación vertical: align-items-center
 * - Espaciado: my-4 (margen vertical)
 * 
 * @param {GuitarProps} props - Props del componente
 * @param {Guitar} props.guitar - Datos de la guitarra
 * @param {Dispatch<CartActions>} props.dispatch - Función dispatch
 * 
 * @returns {JSX.Element} Tarjeta Bootstrap con guitarra
 * 
 * @example
 * // Dentro de un map en la galería
 * {data.map((guitar) => (
 *   <Guitar key={guitar.id} guitar={guitar} dispatch={dispatch} />
 * ))}
 * 
 * @component
 */
export default function Guitar({ guitar, dispatch }: GuitarProps) {
  const { name, image, description, price } = guitar;

  /**
   * Handler para agregar guitarra al carrito
   * 
   * Despacha acción ADD_TO_CART con:
   * - type: CART_ACTION_TYPES.ADD_TO_CART
   * - payload: { item: guitar }
   * 
   * Lógica en el reducer:
   * - Si guitarra ya existe en carrito: aumenta cantidad
   * - Si no existe: la agrega con cantidad inicial (1)
   * 
   * @function handleAddToCart
   * @returns {void}
   */
  const handleAddToCart = () =>
    dispatch({ type: CART_ACTION_TYPES.ADD_TO_CART, payload: { item: guitar } });

  return (
    <div className="col-md-6 col-lg-4 my-4 row align-items-center">
      {/* Imagen de la guitarra - Columna izquierda (40% de ancho) */}
      <div className="col-4">
        <img
          className="img-fluid"
          src={`/img/${image}.jpg`}
          alt={`Imagen de ${name}`}
        />
      </div>

      {/* Información de la guitarra - Columna derecha (60% de ancho) */}
      <div className="col-8">
        {/* Nombre en mayúsculas */}
        <h3 className="text-black fs-4 fw-bold text-uppercase">
          {name}
        </h3>
        
        {/* Descripción */}
        <p>{description}</p>
        
        {/* Precio formateado a 2 decimales */}
        <p className="fw-black text-primary fs-3">${price.toFixed(2)}</p>

        {/* Botón para agregar al carrito */}
        <CartButton
          variant="add"
          onClick={handleAddToCart}
        />
      </div>
    </div>
  );
}
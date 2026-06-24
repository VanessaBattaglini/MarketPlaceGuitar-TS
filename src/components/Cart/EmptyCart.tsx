/**
 * @fileoverview Componente que muestra el estado vacío del carrito
 * 
 * Responsabilidades:
 * - Mostrar mensaje cuando el carrito está sin items
 * - Proporcionar feedback visual al usuario
 * - Componente simple y reutilizable
 * 
 * Uso:
 * - Se renderiza en Header cuando cart.length === 0
 * - Alternativa a CartTable
 * 
 * @example
 * {isEmpty ? <EmptyCart /> : <CartTable />}
 * 
 * @module components/Cart/EmptyCart
 */

/**
 * Componente EmptyCart - Mensaje de carrito vacío
 * 
 * Componente presentacional simple que:
 * - No recibe props
 * - No tiene estado
 * - Solo renderiza un mensaje
 * 
 * Útil para:
 * - Indicar al usuario que el carrito está vacío
 * - Proporcionar feedback visual claro
 * - Diferenciar de un carrito con items
 * 
 * Patrón:
 * - Componente funcional puro
 * - Sin efectos secundarios
 * - Completamente testeable
 * 
 * Estilo:
 * - Usa clases Bootstrap: text-center
 * - Mensajeclaro y conciso
 * 
 * Accesibilidad:
 * - Párrafo semántico <p>
 * - Texto legible y centrado
 * - Se anidará dentro de #carrito dropdown
 * 
 * @returns {JSX.Element} Párrafo con mensaje de carrito vacío
 * 
 * @example
 * // En Header.tsx
 * {isEmpty ? (
 *   <EmptyCart />
 * ) : (
 *   <CartTable cart={cart} dispatch={dispatch} />
 * )}
 * 
 * @component
 */
export default function EmptyCart() {
  return (
    <div className="empty-cart-message">
      <p className="text-center">El carrito esta vacio</p>
    </div>
  );
}

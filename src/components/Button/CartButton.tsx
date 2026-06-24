/**
 * @fileoverview Componente botón reutilizable para acciones del carrito
 * 
 * Proporciona 4 variantes:
 * - add: Botón primario para agregar al carrito (ancho completo, Bootstrap btn-dark)
 * - remove: Botón peligro para remover (Bootstrap btn-danger, ícono X)
 * - increase: Botón para aumentar cantidad (ícono +)
 * - decrease: Botón para disminuir cantidad (ícono -)
 * 
 * Características:
 * - Type-safe con variantes discriminadas
 * - ARIA labels automáticos para accesibilidad
 * - Estilos Bootstrap integrados
 * - Soporte para contenido personalizado (children)
 * - Soporta estado disabled
 * 
 * Arquitectura:
 * - Componente de presentación puro (no tiene estado)
 * - Todo controlado por props
 * - BUTTON_CONFIG centraliza estilos y labels ARIA
 * 
 * @example
 * <CartButton variant="add" onClick={handleAdd} />
 * 
 * @example
 * <CartButton variant="increase" onClick={handleIncrease} aria-label="Aumentar cantidad" />
 * 
 * @module components/Button/CartButton
 */

import { ReactNode } from 'react';

/**
 * Props para el componente CartButton
 * 
 * @typedef {Object} CartButtonProps
 * @property {'add'|'remove'|'increase'|'decrease'} variant - Tipo de botón
 * @property {Function} onClick - Callback al hacer clic
 * @property {ReactNode} [children] - Contenido personalizado (opcional)
 * @property {string} [className] - Clases CSS adicionales (opcional)
 * @property {boolean} [disabled] - Deshabilitar botón (opcional, default: false)
 */
interface CartButtonProps {
  /** 
   * Variante del botón determina estilo, labels ARIA y comportamiento
   * - 'add': Botón primario ancho para agregar al carrito
   * - 'remove': Botón peligro para remover (X)
   * - 'increase': Botón para aumentar cantidad (+)
   * - 'decrease': Botón para disminuir cantidad (-)
   * @type {'add'|'remove'|'increase'|'decrease'}
   */
  variant: 'add' | 'remove' | 'increase' | 'decrease';
  
  /** 
   * Función a ejecutar cuando se hace clic en el botón
   * Generalmente dispatchea una acción del reducer
   * @type {() => void}
   */
  onClick: () => void;
  
  /** 
   * Contenido personalizado del botón (texto o elemento)
   * Si no se proporciona, usa el label por defecto según la variante
   * @type {ReactNode}
   * @optional
   */
  children?: ReactNode;
  
  /** 
   * Clases CSS adicionales a agregar
   * Se concatenan con las clases de la variante
   * Útil para espaciado, tamaño personalizado, etc.
   * @type {string}
   * @optional
   */
  className?: string;
  
  /** 
   * Deshabilitar el botón (disabled state)
   * Cuando está disabled el botón no responde a clics
   * @type {boolean}
   * @optional
   * @default false
   */
  disabled?: boolean;
}

/**
 * Configuración de variantes de botón
 * 
 * Mapeo centralizado de:
 * - cssClass: Clases Bootstrap + estilos personalizados
 * - ariaLabel: Etiqueta ARIA para accesibilidad
 * - defaultLabel: Contenido por defecto si no se proporciona children
 * 
 * Ventajas:
 * - Cambiar estilos en un solo lugar
 * - Coherencia de labels ARIA
 * - Fácil de mantener y extender
 * 
 * @constant
 * @type {Record<CartButtonProps['variant'], {...}>}
 * 
 * @example
 * // Para agregar nueva variante:
 * // 1. Agregar aquí en BUTTON_CONFIG
 * // 2. Agregar en CartButtonProps variant union type
 * // 3. Listo, el componente funciona automáticamente
 */
const BUTTON_CONFIG: Record<
  CartButtonProps['variant'],
  { cssClass: string; ariaLabel: string; defaultLabel: string }
> = {
  /**
   * Botón para agregar al carrito
   * - Ancho completo (w-100) en contexto de tarjeta de guitarra
   * - Color dark de Bootstrap
   * - Se usa en Guitar component y en Header (Vaciar Carrito)
   */
  add: {
    cssClass: 'btn btn-dark w-100',
    ariaLabel: 'Agregar guitarra al carrito',
    defaultLabel: 'Agregar al Carrito',
  },
  
  /**
   * Botón para remover del carrito
   * - Botón peligro (rojo) usando btn-danger de Bootstrap
   * - Ícono X por defecto
   * - Se usa en CartTableRow para remover items
   */
  remove: {
    cssClass: 'btn btn-danger',
    ariaLabel: 'Remover del carrito',
    defaultLabel: 'X',
  },
  
  /**
   * Botón para aumentar cantidad
   * - Color dark
   * - Ícono + por defecto
   * - Se usa en CartTableRow
   */
  increase: {
    cssClass: 'btn btn-dark',
    ariaLabel: 'Aumentar cantidad',
    defaultLabel: '+',
  },
  
  /**
   * Botón para disminuir cantidad
   * - Color dark
   * - Ícono - por defecto
   * - Se usa en CartTableRow
   */
  decrease: {
    cssClass: 'btn btn-dark',
    ariaLabel: 'Disminuir cantidad',
    defaultLabel: '-',
  },
};

/**
 * Botón reutilizable para acciones del carrito
 * 
 * Componente presentacional que renderiza un `<button>` nativo HTML
 * con:
 * - Clases Bootstrap según variante
 * - ARIA labels para accesibilidad
 * - Contenido personalizable con children
 * - Soporte para disabled state
 * 
 * Lógica:
 * 1. Obtiene config de variante desde BUTTON_CONFIG
 * 2. Concatena clases CSS (variante + adicionales)
 * 3. Usa children si se proporciona, sino usa defaultLabel
 * 4. Renderiza button HTML con atributos ARIA
 * 
 * @param {CartButtonProps} props - Props del componente
 * @param {string} props.variant - Variante del botón
 * @param {Function} props.onClick - Handler del clic
 * @param {ReactNode} [props.children] - Contenido personalizado
 * @param {string} [props.className] - Clases adicionales
 * @param {boolean} [props.disabled] - Estado disabled
 * 
 * @returns {JSX.Element} Botón HTML nativo con estilos y atributos
 * 
 * @example
 * // Botón simple para agregar
 * <CartButton variant="add" onClick={() => dispatch(addAction)} />
 * 
 * @example
 * // Botón con contenido personalizado
 * <CartButton 
 *   variant="increase" 
 *   onClick={handleIncrease}
 * >
 *   🔼 Más
 * </CartButton>
 * 
 * @example
 * // Botón deshabilitado
 * <CartButton 
 *   variant="add" 
 *   onClick={handleAdd} 
 *   disabled={isLoading}
 * />
 * 
 * @component
 */
export default function CartButton({
  variant,
  onClick,
  children,
  className = '',
  disabled = false,
}: CartButtonProps) {
  // Obtener configuración según variante
  const config = BUTTON_CONFIG[variant];
  
  // Concatenar clases CSS: variante + adicionales
  const cssClasses = `${config.cssClass} ${className}`.trim();

  return (
    <button
      type="button"
      className={cssClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={config.ariaLabel}
    >
      {/* Usar children si se proporciona, sino usar label por defecto */}
      {children ?? config.defaultLabel}
    </button>
  );
}

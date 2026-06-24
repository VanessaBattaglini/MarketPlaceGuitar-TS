/**
 * Componente botón reutilizable para acciones del carrito
 * Proporciona diferentes variantes (add, remove, increase, decrease)
 */

import { ReactNode } from 'react';

/**
 * Props para el componente CartButton
 */
interface CartButtonProps {
  /** Variante del botón: add, remove, increase, decrease */
  variant: 'add' | 'remove' | 'increase' | 'decrease';
  /** Función a ejecutar al hacer clic */
  onClick: () => void;
  /** Contenido del botón (texto o icono) */
  children?: ReactNode;
  /** Clase CSS adicional */
  className?: string;
  /** Deshabilitar el botón */
  disabled?: boolean;
}

/**
 * Mapeo de variantes a clases CSS y etiquetas ARIA
 */
const BUTTON_CONFIG: Record<
  CartButtonProps['variant'],
  { cssClass: string; ariaLabel: string; defaultLabel: string }
> = {
  add: {
    cssClass: 'btn btn-dark w-100',
    ariaLabel: 'Agregar guitarra al carrito',
    defaultLabel: 'Agregar al Carrito',
  },
  remove: {
    cssClass: 'btn btn-danger',
    ariaLabel: 'Remover del carrito',
    defaultLabel: 'X',
  },
  increase: {
    cssClass: 'btn btn-dark',
    ariaLabel: 'Aumentar cantidad',
    defaultLabel: '+',
  },
  decrease: {
    cssClass: 'btn btn-dark',
    ariaLabel: 'Disminuir cantidad',
    defaultLabel: '-',
  },
};

/**
 * Botón reutilizable para acciones del carrito
 * 
 * @example
 * // Botón para agregar
 * <CartButton variant="add" onClick={() => dispatch({...})} />
 * 
 * @example
 * // Botón para aumentar cantidad
 * <CartButton variant="increase" onClick={handleIncrease} />
 */
export default function CartButton({
  variant,
  onClick,
  children,
  className = '',
  disabled = false,
}: CartButtonProps) {
  const config = BUTTON_CONFIG[variant];
  const cssClasses = `${config.cssClass} ${className}`.trim();

  return (
    <button
      type="button"
      className={cssClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={config.ariaLabel}
    >
      {children ?? config.defaultLabel}
    </button>
  );
}

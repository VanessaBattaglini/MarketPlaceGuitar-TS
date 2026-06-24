/**
 * @fileoverview Componente individual de notificación toast
 * 
 * Muestra una notificación en la esquina con:
 * - Ícono según el tipo
 * - Mensaje
 * - Botón cerrar
 * - Animación de salida
 * 
 * @example
 * <Toast
 *   id="notif-1"
 *   message="¡Operación exitosa!"
 *   type="success"
 *   onDismiss={() => dismiss('notif-1')}
 * />
 * 
 * @module components/Notifications/Toast
 */

import { Notification } from '../../contexts/NotificationContext';
import './Toast.css';

/**
 * Props del componente Toast
 * 
 * @typedef {Object} ToastProps
 * @property {string} id - ID único del toast
 * @property {string} message - Mensaje a mostrar
 * @property {NotificationType} type - Tipo de notificación
 * @property {Function} onDismiss - Callback cuando se cierra
 */
interface ToastProps extends Omit<Notification, 'duration'> {
  onDismiss: () => void;
}

/**
 * Mapeo de tipos a íconos emoji y clases CSS
 * 
 * @constant
 * @type {Object}
 */
const TOAST_CONFIG = {
  success: {
    icon: '✅',
    className: 'toast-success',
    ariaLabel: 'Notificación exitosa:',
  },
  error: {
    icon: '❌',
    className: 'toast-error',
    ariaLabel: 'Notificación de error:',
  },
  warning: {
    icon: '⚠️',
    className: 'toast-warning',
    ariaLabel: 'Advertencia:',
  },
  info: {
    icon: 'ℹ️',
    className: 'toast-info',
    ariaLabel: 'Información:',
  },
};

/**
 * Componente Toast - Notificación individual
 * 
 * Renderiza un toast con:
 * - Ícono según tipo
 * - Mensaje
 * - Botón cerrar
 * - ARIA labels para accesibilidad
 * 
 * Accesibilidad:
 * - role="alert": Notificar a lectores de pantalla
 * - aria-label: Descripción de tipo
 * - Botón cerrar visible y accesible
 * - Contraste de colores WCAG AA
 * 
 * @param {ToastProps} props - Props del componente
 * @returns {JSX.Element} Toast renderizado
 * 
 * @example
 * <Toast
 *   id="notif-1"
 *   message="¡Guardado exitosamente!"
 *   type="success"
 *   onDismiss={() => handleDismiss('notif-1')}
 * />
 * 
 * @component
 */
export default function Toast({ message, type, onDismiss }: ToastProps) {
  const config = TOAST_CONFIG[type];

  return (
    <div
      className={`toast ${config.className}`}
      role="alert"
      aria-label={config.ariaLabel}
    >
      {/* Ícono */}
      <span className="toast-icon" aria-hidden="true">
        {config.icon}
      </span>

      {/* Mensaje */}
      <span className="toast-message">{message}</span>

      {/* Botón cerrar */}
      <button
        className="toast-close"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        title="Cerrar"
      >
        ✕
      </button>
    </div>
  );
}

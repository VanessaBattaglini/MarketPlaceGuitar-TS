/**
 * @fileoverview Contenedor que renderiza todos los toasts activos
 * 
 * Se debe renderizar una sola vez en la app (generalmente en App.tsx)
 * Muestra todos los toasts del contexto de notificaciones
 * 
 * @example
 * En App.tsx
 * <ToastContainer />
 * 
 * @module components/Notifications/ToastContainer
 */

import { useNotification } from '../../contexts/NotificationContext';
import Toast from './Toast';
import './Toast.css';

/**
 * Contenedor de toasts
 * 
 * Renderiza:
 * - Contenedor fijo en la esquina superior derecha
 * - Todos los toasts activos
 * - Maneja el cierre de toasts
 * 
 * Se debe renderizar en App.tsx, fuera de otras estructuras
 * No recibe props
 * 
 * @returns {JSX.Element} Contenedor con toasts
 * 
 * @component
 */
export default function ToastContainer() {
  const { notifications, dismiss } = useNotification();

  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          {...notification}
          onDismiss={() => dismiss(notification.id)}
        />
      ))}
    </div>
  );
}

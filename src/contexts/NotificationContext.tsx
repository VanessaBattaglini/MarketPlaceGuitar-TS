/**
 * @fileoverview Context y hook para sistema de notificaciones toast
 * 
 * Proporciona:
 * - Sistema de notificaciones tipo toast
 * - Tipos de notificaciones: success, error, warning, info
 * - Auto-dismiss configurable
 * - Fila de notificaciones
 * - Hook useNotification para acceder desde componentes
 * 
 * @example
 * import { useNotification } from '@/contexts/NotificationContext';
 * 
 * function MyComponent() {
 *   const notification = useNotification();
 *   
 *   const handleClick = () => {
 *     notification.success('¡Operación exitosa!');
 *   };
 *   
 *   return <button onClick={handleClick}>Enviar</button>;
 * }
 * 
 * @module contexts/NotificationContext
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * Tipos de notificaciones disponibles
 * 
 * @typedef {string} NotificationType
 * @enum {NotificationType}
 * @property {'success'} success - Operación exitosa (verde)
 * @property {'error'} error - Error (rojo)
 * @property {'warning'} warning - Advertencia (amarillo)
 * @property {'info'} info - Información (azul)
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Estructura de una notificación
 * 
 * @typedef {Object} Notification
 * @property {string} id - ID único de la notificación
 * @property {string} message - Mensaje a mostrar
 * @property {NotificationType} type - Tipo de notificación
 * @property {number} [duration] - Duración en ms antes de auto-dismiss (0 = no auto-dismiss)
 */
interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

/**
 * Interfaz del contexto de notificaciones
 * 
 * @typedef {Object} NotificationContextType
 * @property {Notification[]} notifications - Array de notificaciones activas
 * @property {Function} success - Crear notificación de éxito
 * @property {Function} error - Crear notificación de error
 * @property {Function} warning - Crear notificación de advertencia
 * @property {Function} info - Crear notificación de información
 * @property {Function} dismiss - Descartar una notificación por ID
 * @property {Function} clear - Descartar todas las notificaciones
 */
interface NotificationContextType {
  notifications: Notification[];
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

/**
 * Contexto de notificaciones
 * 
 * @constant
 * @type {React.Context<NotificationContextType|undefined>}
 */
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Props del provider de notificaciones
 * 
 * @typedef {Object} NotificationProviderProps
 * @property {ReactNode} children - Componentes hijos
 * @property {number} [defaultDuration] - Duración por defecto de notificaciones (ms)
 */
interface NotificationProviderProps {
  children: ReactNode;
  defaultDuration?: number;
}

/**
 * Provider de notificaciones
 * 
 * Gestiona el estado global de notificaciones
 * Debe envolver la aplicación para que todos los componentes puedan usar useNotification()
 * 
 * @param {NotificationProviderProps} props - Props del provider
 * @returns {JSX.Element} Provider con contexto configurado
 * 
 * @example
 * // En main.tsx o App.tsx
 * <NotificationProvider defaultDuration={3000}>
 *   <App />
 * </NotificationProvider>
 */
export function NotificationProvider({
  children,
  defaultDuration = 3000,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * Generar ID único para notificación
   * 
   * @returns {string} ID único
   */
  const generateId = useCallback(() => {
    return `notification-${Date.now()}-${Math.random()}`;
  }, []);

  /**
   * Agregar notificación
   * 
   * @param {string} message - Mensaje
   * @param {NotificationType} type - Tipo
   * @param {number} [duration] - Duración en ms
   */
  const addNotification = useCallback(
    (message: string, type: NotificationType, duration: number = defaultDuration) => {
      const id = generateId();
      const notification: Notification = { id, message, type, duration };

      setNotifications((prev) => [...prev, notification]);

      // Auto-dismiss si duration > 0
      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [defaultDuration, generateId]
  );

  /**
   * Descartar notificación por ID
   * 
   * @param {string} id - ID de la notificación
   */
  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /**
   * Descartar todas las notificaciones
   */
  const clear = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Métodos de conveniencia para cada tipo
   */
  const success = useCallback(
    (message: string, duration?: number) =>
      addNotification(message, 'success', duration),
    [addNotification]
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      addNotification(message, 'error', duration),
    [addNotification]
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      addNotification(message, 'warning', duration),
    [addNotification]
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      addNotification(message, 'info', duration),
    [addNotification]
  );

  const value: NotificationContextType = {
    notifications,
    success,
    error,
    warning,
    info,
    dismiss,
    clear,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook para acceder al sistema de notificaciones
 * 
 * Debe usarse dentro de un componente que esté dentro del NotificationProvider
 * 
 * @returns {NotificationContextType} Métodos del sistema de notificaciones
 * @throws {Error} Si se usa fuera del NotificationProvider
 * 
 * @example
 * function MyComponent() {
 *   const notification = useNotification();
 *   
 *   const handleSubmit = async () => {
 *     try {
 *       await submitData();
 *       notification.success('¡Guardado exitosamente!');
 *     } catch (error) {
 *       notification.error('Error al guardar');
 *     }
 *   };
 *   
 *   return <button onClick={handleSubmit}>Guardar</button>;
 * }
 */
export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotification debe usarse dentro de un NotificationProvider'
    );
  }

  return context;
}

/**
 * Exportar tipos para uso en otras partes
 */
export type { Notification, NotificationContextType };

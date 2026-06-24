/**
 * @fileoverview Configuración centralizada de la aplicación
 * 
 * Este módulo carga todas las variables de entorno y proporciona
 * una interfaz type-safe para acceder a la configuración.
 * 
 * Características:
 * - Validación de variables requeridas
 * - Valores por defecto si variables no existen
 * - Type-safe (TypeScript compila si accedes a una variable inexistente)
 * - Documentado para cada variable
 * - Fácil de mantener y extender
 * 
 * @example
 * import { appConfig } from '@/config/app.config';
 * 
 * // Acceder a configuración type-safe
 * console.log(appConfig.api.baseUrl);
 * console.log(appConfig.cart.maxItems);
 * console.log(appConfig.logging.level);
 * 
 * @module config/app.config
 */

/**
 * Tipo para los niveles de logging
 * @typedef {string} LogLevel
 * @enum {LogLevel}
 * @property {'DEBUG'} DEBUG - Mostrar todos los logs
 * @property {'INFO'} INFO - Mostrar info y errores
 * @property {'WARN'} WARN - Mostrar solo warnings y errores
 * @property {'ERROR'} ERROR - Mostrar solo errores
 */
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

/**
 * Interfaz de configuración de la aplicación
 * Define la estructura completa y proporciona type-safety
 */
interface AppConfig {
  /** Configuración de la API */
  api: {
    /** URL base para todas las peticiones API */
    baseUrl: string;
    /** Timeout en milisegundos para peticiones */
    timeout: number;
    /** Número máximo de reintentos automáticos */
    maxRetries: number;
  };
  
  /** Configuración del carrito */
  cart: {
    /** Cantidad máxima de items iguales permitidos */
    maxItems: number;
    /** Cantidad mínima de items permitidos */
    minItems: number;
    /** Clave de localStorage para persistencia */
    storageKey: string;
  };
  
  /** Configuración de logging */
  logging: {
    /** Nivel de logging actual */
    level: LogLevel;
    /** Habilitar logs detallados */
    debug: boolean;
  };
  
  /** Configuración de features */
  features: {
    /** Habilitar sistema de notificaciones */
    notifications: boolean;
    /** Habilitar dark mode */
    darkMode: boolean;
    /** Habilitar analytics */
    analytics: boolean;
  };
  
  /** Configuración de debugging */
  debug: {
    /** Habilitar modo debug completo */
    enabled: boolean;
    /** Habilitar Redux DevTools */
    reduxDevTools: boolean;
  };
}

/**
 * Helper para obtener variables de entorno con tipo safe
 * 
 * @param {string} key - Nombre de la variable
 * @param {string|boolean|number} defaultValue - Valor por defecto
 * @returns {string|boolean|number} Valor de la variable o default
 * 
 * @example
 * const baseUrl = getEnv('VITE_API_BASE_URL', 'http://localhost:3000');
 */
const getEnv = (key: string, defaultValue: string | boolean | number): string | boolean | number => {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
};

/**
 * Helper para parsear strings booleanos desde variables de entorno
 * 
 * @param {string|boolean} value - Valor como string ('true', 'false', etc) o boolean
 * @param {boolean} defaultValue - Valor por defecto
 * @returns {boolean} Valor booleano parseado
 * 
 * @example
 * const enabled = parseBoolEnv('true', false); // true
 * const enabled = parseBoolEnv('false', true); // false
 * const enabled = parseBoolEnv('', true); // true (default)
 */
const parseBoolEnv = (value: string | boolean | undefined, defaultValue: boolean): boolean => {
  if (value === undefined || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  return value.toLowerCase() === 'true';
};

/**
 * Helper para parsear números desde variables de entorno
 * 
 * @param {string|number} value - Valor como string o número
 * @param {number} defaultValue - Valor por defecto
 * @returns {number} Valor numérico parseado
 * 
 * @example
 * const maxItems = parseNumEnv('5', 10); // 5
 * const timeout = parseNumEnv(30000, 10000); // 30000
 */
const parseNumEnv = (value: string | number | undefined, defaultValue: number): number => {
  if (value === undefined || value === '') return defaultValue;
  const num = typeof value === 'number' ? value : parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Configuración centralizada de la aplicación
 * 
 * Se carga una sola vez al iniciar la aplicación
 * Todos los valores son derivados de:
 * 1. Variables de entorno (.env, .env.local, .env.production)
 * 2. Valores por defecto configurados aquí
 * 
 * @constant
 * @type {AppConfig}
 * 
 * @example
 * // En cualquier parte de la app
 * import { appConfig } from '@/config/app.config';
 * 
 * if (appConfig.logging.debug) {
 *   console.log('Debug mode enabled');
 * }
 * 
 * const headers = {
 *   'X-Request-Timeout': appConfig.api.timeout,
 * };
 */
export const appConfig: AppConfig = {
  // ========================================================================
  // Configuración de API
  // ========================================================================
  api: {
    /** 
     * URL base para las peticiones API
     * Debe apuntar al servidor backend
     * 
     * En desarrollo: http://localhost:3000/api
     * En producción: https://api.guitarla.com
     * 
     * @default "http://localhost:3000/api"
     */
    baseUrl: String(getEnv('VITE_API_BASE_URL', 'http://localhost:3000/api')),
    
    /** 
     * Timeout en milisegundos para las peticiones HTTP
     * Si una petición tarda más que esto, se cancela
     * 
     * Rango recomendado: 15000-60000 (15-60 segundos)
     * 
     * @default 30000
     */
    timeout: parseNumEnv(getEnv('VITE_REQUEST_TIMEOUT', 30000) as number | string, 30000),
    
    /** 
     * Número de reintentos automáticos para peticiones fallidas
     * Se aplica solo a errores de red, no a errores 4xx
     * 
     * Rango recomendado: 1-5
     * 
     * @default 3
     */
    maxRetries: parseNumEnv(getEnv('VITE_MAX_RETRIES', 3) as number | string, 3),
  },

  // ========================================================================
  // Configuración del Carrito
  // ========================================================================
  cart: {
    /** 
     * Cantidad máxima de items iguales permitidos en el carrito
     * Previene que se agreguen demasiados items del mismo producto
     * 
     * @default 5
     */
    maxItems: parseNumEnv(getEnv('VITE_CART_MAX_ITEMS', 5) as number | string, 5),
    
    /** 
     * Cantidad mínima de items permitidos (siempre 1)
     * No cambiar este valor, siempre debe ser 1
     * 
     * @default 1
     */
    minItems: parseNumEnv(getEnv('VITE_CART_MIN_ITEMS', 1) as number | string, 1),
    
    /** 
     * Clave de localStorage donde se persiste el carrito
     * Cambiar este valor hará que pierda el carrito guardado anterior
     * 
     * @default "cart"
     */
    storageKey: String(getEnv('VITE_CART_STORAGE_KEY', 'cart')),
  },

  // ========================================================================
  // Configuración de Logging
  // ========================================================================
  logging: {
    /** 
     * Nivel actual de logging
     * Determina qué logs se muestran en console
     * 
     * En desarrollo: DEBUG (muestra TODO)
     * En producción: ERROR (solo errores)
     * 
     * @default "DEBUG"
     */
    level: (getEnv('VITE_LOG_LEVEL', 'DEBUG') as LogLevel) || 'DEBUG',
    
    /** 
     * Habilitar logs detallados
     * Si está false, se suprimen muchos logs de debug
     * 
     * @default true
     */
    debug: parseBoolEnv(String(getEnv('VITE_DEBUG_MODE', true)) as string | boolean, true),
  },

  // ========================================================================
  // Configuración de Features
  // ========================================================================
  features: {
    /** 
     * Habilitar sistema de notificaciones (toast)
     * Si está false, no se muestran notificaciones al usuario
     * 
     * @default true
     */
    notifications: parseBoolEnv(String(getEnv('VITE_ENABLE_NOTIFICATIONS', true)) as string | boolean, true),
    
    /** 
     * Habilitar dark mode
     * Si está false, solo hay light mode disponible
     * 
     * @default false
     */
    darkMode: parseBoolEnv(String(getEnv('VITE_ENABLE_DARK_MODE', false)) as string | boolean, false),
    
    /** 
     * Habilitar analytics (Google Analytics, Mixpanel, etc)
     * Si está false, no se trackea actividad del usuario
     * 
     * @default false
     */
    analytics: parseBoolEnv(String(getEnv('VITE_ENABLE_ANALYTICS', false)) as string | boolean, false),
  },

  // ========================================================================
  // Configuración de Debugging
  // ========================================================================
  debug: {
    /** 
     * Habilitar modo debug completo
     * Activa logs, DevTools, y otras utilidades de debugging
     * 
     * En desarrollo: true
     * En producción: false
     * 
     * @default true
     */
    enabled: parseBoolEnv(String(getEnv('VITE_DEBUG_MODE', true)) as string | boolean, true),
    
    /** 
     * Habilitar Redux DevTools para debugging de state
     * Requiere la extensión Redux DevTools en el navegador
     * 
     * En desarrollo: true
     * En producción: false
     * 
     * @default true
     */
    reduxDevTools: parseBoolEnv(String(getEnv('VITE_DEBUG_REDUX_DEVTOOLS', true)) as string | boolean, true),
  },
};

/**
 * Función para validar que la configuración esté completa
 * Se ejecuta al startup y lanza error si falta algo crítico
 * 
 * @function validateConfig
 * @returns {boolean} true si la configuración es válida
 * @throws {Error} Si hay variables requeridas faltantes
 * 
 * @example
 * import { validateConfig } from '@/config/app.config';
 * 
 * try {
 *   validateConfig();
 *   console.log('Config válida');
 * } catch (error) {
 *   console.error('Config inválida:', error.message);
 * }
 */
export const validateConfig = (): boolean => {
  // Validar que tenemos un baseUrl válido
  if (!appConfig.api.baseUrl) {
    throw new Error('VITE_API_BASE_URL no está configurada');
  }

  // Validar que cart.maxItems > cart.minItems
  if (appConfig.cart.maxItems < appConfig.cart.minItems) {
    throw new Error(
      `CART_MAX_ITEMS (${appConfig.cart.maxItems}) debe ser mayor que CART_MIN_ITEMS (${appConfig.cart.minItems})`
    );
  }

  // Validar que timeout sea positivo
  if (appConfig.api.timeout <= 0) {
    throw new Error('REQUEST_TIMEOUT debe ser mayor a 0');
  }

  // Validar que maxRetries sea no-negativo
  if (appConfig.api.maxRetries < 0) {
    throw new Error('MAX_RETRIES no puede ser negativo');
  }

  return true;
};

/**
 * Log de la configuración actual (solo en debug mode)
 * Útil para verificar que los valores se cargaron correctamente
 * 
 * @example
 * import { logConfig } from '@/config/app.config';
 * 
 * if (import.meta.env.DEV) {
 *   logConfig();
 * }
 */
export const logConfig = (): void => {
  if (appConfig.debug.enabled) {
    console.group('🔧 Configuración de Aplicación');
    console.log('API:', appConfig.api);
    console.log('Cart:', appConfig.cart);
    console.log('Logging:', appConfig.logging);
    console.log('Features:', appConfig.features);
    console.log('Debug:', appConfig.debug);
    console.groupEnd();
  }
};

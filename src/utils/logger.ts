/**
 * @fileoverview Logger centralizado para debugging y logging
 * 
 * Proporciona:
 * - Niveles de logging: DEBUG, INFO, WARN, ERROR
 * - Formato consistente con timestamps
 * - Persistencia en localStorage (últimas 50 entradas)
 * - Exportación de logs para debugging remoto
 * - Integración con appConfig.logging.level
 * 
 * @example
 * import { logger } from '@/utils/logger';
 * 
 * logger.debug('Inicializando app');
 * logger.info('Datos cargados correctamente');
 * logger.warn('Carrito casi lleno');
 * logger.error('Error al guardar', error);
 * 
 * @module utils/logger
 */

import { appConfig } from '../config/app.config';

/**
 * Niveles de logging
 * 
 * @typedef {string} LogLevel
 * @enum {LogLevel}
 * @property {0} DEBUG - Información de debugging (más verboso)
 * @property {1} INFO - Información general
 * @property {2} WARN - Advertencias
 * @property {3} ERROR - Errores críticos
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

/**
 * Entrada de log con metadata
 * 
 * @typedef {Object} LogEntry
 * @property {string} timestamp - ISO timestamp
 * @property {LogLevel} level - Nivel del log
 * @property {string} message - Mensaje principal
 * @property {any} [data] - Datos adicionales (JSON-serializable)
 * @property {string} [stack] - Stack trace si es error
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}

/**
 * Configuración del logger
 * 
 * @constant
 * @type {Object}
 */
const LOG_CONFIG = {
  /** Número máximo de logs a guardar en localStorage */
  MAX_LOGS: 50,
  
  /** Clave de localStorage donde se guardan logs */
  STORAGE_KEY: 'app-logs',
};

/**
 * Mapeo de niveles a índices (para comparación)
 * 
 * @constant
 * @type {Object}
 */
const LOG_LEVEL_INDEX: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

/**
 * Mapeo de niveles a emojis y colores
 * 
 * @constant
 * @type {Object}
 */
const LOG_STYLE = {
  DEBUG: { emoji: '🔍', color: 'color: #999' },
  INFO: { emoji: 'ℹ️', color: 'color: #0d6efd' },
  WARN: { emoji: '⚠️', color: 'color: #ffc107' },
  ERROR: { emoji: '❌', color: 'color: #dc3545; font-weight: bold' },
};

/**
 * Logger centralizado
 * 
 * Métodos:
 * - debug(message, data?): Log de debugging
 * - info(message, data?): Log de información
 * - warn(message, data?): Log de advertencia
 * - error(message, error, data?): Log de error
 * - getLogs(): Obtener todos los logs guardados
 * - exportLogs(): Exportar logs como JSON
 * - clearLogs(): Limpiar logs guardados
 * 
 * @namespace logger
 */
export const logger = {
  /**
   * Obtener nivel actual de logging
   * Derivado de appConfig.logging.level
   * 
   * @returns {LogLevel} Nivel actual
   */
  getCurrentLevel(): LogLevel {
    return appConfig.logging.level;
  },

  /**
   * Verificar si debe loguearse un nivel específico
   * 
   * @param {LogLevel} level - Nivel a verificar
   * @returns {boolean} true si debe loguear
   */
  shouldLog(level: LogLevel): boolean {
    const currentIndex = LOG_LEVEL_INDEX[this.getCurrentLevel()];
    const levelIndex = LOG_LEVEL_INDEX[level];
    return levelIndex >= currentIndex;
  },

  /**
   * Log de debugging (más verboso)
   * 
   * @param {string} message - Mensaje
   * @param {any} [data] - Datos adicionales
   * 
   * @example
   * logger.debug('Componente Guitar renderizado', { guitarId: 1 });
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog('DEBUG')) {
      this.log('DEBUG', message, data);
    }
  },

  /**
   * Log de información
   * 
   * @param {string} message - Mensaje
   * @param {any} [data] - Datos adicionales
   * 
   * @example
   * logger.info('Carrito guardado en localStorage');
   */
  info(message: string, data?: any): void {
    if (this.shouldLog('INFO')) {
      this.log('INFO', message, data);
    }
  },

  /**
   * Log de advertencia
   * 
   * @param {string} message - Mensaje
   * @param {any} [data] - Datos adicionales
   * 
   * @example
   * logger.warn('localStorage casi lleno', { usage: '95%' });
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog('WARN')) {
      this.log('WARN', message, data);
    }
  },

  /**
   * Log de error
   * 
   * @param {string} message - Mensaje del error
   * @param {Error|unknown} error - Error ocurrido
   * @param {any} [data] - Datos adicionales para contexto
   * 
   * @example
   * try {
   *   await fetchData();
   * } catch (error) {
   *   logger.error('Error fetching data', error, { endpoint: '/api/guitars' });
   * }
   */
  error(message: string, error: Error | unknown, data?: any): void {
    if (this.shouldLog('ERROR')) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      this.log('ERROR', message, {
        error: errorMessage,
        ...data,
      }, errorStack);
    }
  },

  /**
   * Loguar a console con formato
   * 
   * @param {LogEntry} entry - Entrada de log
   */
  logToConsole(entry: LogEntry): void {
    const style = LOG_STYLE[entry.level];
    const time = new Date(entry.timestamp).toLocaleTimeString();

    const prefix = `%c[${time}] ${style.emoji} ${entry.level}:`;
    const args: any[] = [
      prefix,
      style.color,
      entry.message,
    ];

    if (entry.data) {
      args.push(entry.data);
    }

    if (entry.stack) {
      args.push('\nStack:', entry.stack);
    }

    console.log(...args);
  },

  /**
   * Guardar log en localStorage
   * Mantiene solo las últimas MAX_LOGS entradas
   * 
   * @param {LogEntry} entry - Entrada de log
   */
  logToStorage(entry: LogEntry): void {
    try {
      const stored = localStorage.getItem(LOG_CONFIG.STORAGE_KEY);
      const logs: LogEntry[] = stored ? JSON.parse(stored) : [];

      logs.push(entry);

      if (logs.length > LOG_CONFIG.MAX_LOGS) {
        logs.splice(0, logs.length - LOG_CONFIG.MAX_LOGS);
      }

      localStorage.setItem(LOG_CONFIG.STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.warn('⚠️  No se pudo guardar log en localStorage:', error);
    }
  },

  /**
   * Realizar logging interno
   * 
   * @param {LogLevel} level - Nivel del log
   * @param {string} message - Mensaje
   * @param {any} [data] - Datos adicionales
   * @param {string} [stack] - Stack trace
   */
  log(
    level: LogLevel,
    message: string,
    data?: any,
    stack?: string
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
      ...(stack && { stack }),
    };

    this.logToConsole(entry);
    this.logToStorage(entry);
  },

  /**
   * Obtener todos los logs guardados
   * 
   * @returns {LogEntry[]} Array de logs (últimas MAX_LOGS entradas)
   * 
   * @example
   * const logs = logger.getLogs();
   * console.log(`Total logs: ${logs.length}`);
   */
  getLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem(LOG_CONFIG.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Error leyendo logs de localStorage:', error);
      return [];
    }
  },

  /**
   * Exportar logs como objeto JSON
   * Útil para enviar a backend para debugging remoto
   * 
   * @returns {Object} Objeto con metadata y logs
   * 
   * @example
   * const logsExport = logger.exportLogs();
   * // Enviar a backend para análisis
   * await fetch('/api/debug/logs', {
   *   method: 'POST',
   *   body: JSON.stringify(logsExport)
   * });
   */
  exportLogs() {
    return {
      exportedAt: new Date().toISOString(),
      appConfig: {
        version: import.meta.env.VITE_APP_VERSION || 'unknown',
        mode: import.meta.env.MODE,
        dev: import.meta.env.DEV,
      },
      userAgent: navigator.userAgent,
      logs: this.getLogs(),
    };
  },

  /**
   * Exportar logs como string JSON
   * 
   * @returns {string} JSON stringificado
   * 
   * @example
   * const logsJson = logger.exportLogsAsString();
   * // Copiar al clipboard
   * navigator.clipboard.writeText(logsJson);
   */
  exportLogsAsString(): string {
    return JSON.stringify(this.exportLogs(), null, 2);
  },

  /**
   * Limpiar logs guardados
   * 
   * @example
   * logger.clearLogs();
   */
  clearLogs(): void {
    try {
      localStorage.removeItem(LOG_CONFIG.STORAGE_KEY);
      this.info('Logs limpiados');
    } catch (error) {
      console.warn('Error limpiando logs:', error);
    }
  },

  /**
   * Crear contexto de logs para operaciones
   * Agrupa logs relacionados
   * 
   * @param {string} contextName - Nombre del contexto
   * @returns {Object} Métodos de log con contexto
   * 
   * @example
   * const cartLogs = logger.createContext('Cart');
   * cartLogs.info('Item agregado');
   * cartLogs.error('Error guardando', error);
   */
  createContext(contextName: string) {
    return {
      debug: (msg: string, data?: any) =>
        this.debug(`[${contextName}] ${msg}`, data),
      info: (msg: string, data?: any) =>
        this.info(`[${contextName}] ${msg}`, data),
      warn: (msg: string, data?: any) =>
        this.warn(`[${contextName}] ${msg}`, data),
      error: (msg: string, error: Error | unknown, data?: any) =>
        this.error(`[${contextName}] ${msg}`, error, data),
    };
  },
};

/**
 * @fileoverview Manejo de errores personalizado para la aplicación
 * 
 * Define clases de error que heredan de Error nativo para que TypeScript
 * y los debuggers los reconozcan como errores reales.
 * 
 * Tipos de errores:
 * - AppError: Error genérico de la aplicación
 * - NetworkError: Error de conectividad de red
 * - ValidationError: Error de validación de datos
 * - NotFoundError: Recurso no encontrado (404)
 * - UnauthorizedError: No autorizado (401)
 * - ForbiddenError: Acceso prohibido (403)
 * - ServerError: Error del servidor (5xx)
 * - TimeoutError: Timeout en la petición
 * 
 * @example
 * import { NetworkError, ValidationError } from '@/services/error';
 * 
 * try {
 *   // operación
 * } catch (error) {
 *   if (error instanceof NetworkError) {
 *     console.error('Error de red:', error.message);
 *   } else if (error instanceof ValidationError) {
 *     console.error('Datos inválidos:', error.errors);
 *   }
 * }
 * 
 * @module services/error
 */

/**
 * Error base para toda la aplicación
 * Proporciona estructura consistente para errores
 * 
 * @class AppError
 * @extends {Error}
 */
export class AppError extends Error {
  /**
   * Nombre del tipo de error
   * @type {string}
   */
  public readonly name: string;

  /**
   * Código de error único para identificar el tipo
   * @type {string}
   */
  public readonly code: string;

  /**
   * Status code HTTP asociado (si aplica)
   * @type {number|null}
   */
  public readonly statusCode: number | null;

  /**
   * Timestamp de cuando ocurrió el error
   * @type {Date}
   */
  public readonly timestamp: Date;

  /**
   * Constructor del error base
   * 
   * @param {string} message - Mensaje del error
   * @param {string} code - Código único del error
   * @param {number|null} statusCode - Status HTTP (opcional)
   */
  constructor(message: string, code: string, statusCode: number | null = null) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();

    // Mantener la cadena de prototipos correcta para instanceof
    Object.setPrototypeOf(this, AppError.prototype);

    // Capturar stack trace en development
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convertir error a objeto JSON para logging
   * 
   * @returns {Object} Objeto serializable con información del error
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Error de conectividad de red
 * Se lanza cuando no hay conexión a internet o la red falla
 * 
 * @class NetworkError
 * @extends {AppError}
 */
export class NetworkError extends AppError {
  /**
   * Intento actual del reintento
   * @type {number}
   */
  public readonly retryAttempt: number;

  /**
   * Número máximo de reintentos
   * @type {number}
   */
  public readonly maxRetries: number;

  constructor(
    message: string,
    retryAttempt: number = 0,
    maxRetries: number = 3
  ) {
    super(
      message,
      'NETWORK_ERROR',
      null
    );
    this.retryAttempt = retryAttempt;
    this.maxRetries = maxRetries;
    Object.setPrototypeOf(this, NetworkError.prototype);
  }

  /**
   * ¿Debe reintentar?
   * 
   * @returns {boolean} true si hay más reintentos disponibles
   */
  canRetry(): boolean {
    return this.retryAttempt < this.maxRetries;
  }

  /**
   * Siguiente intento de reintento
   * 
   * @returns {NetworkError} Nuevo error con retryAttempt incrementado
   */
  nextRetry(): NetworkError {
    return new NetworkError(
      this.message,
      this.retryAttempt + 1,
      this.maxRetries
    );
  }
}

/**
 * Error de validación de datos
 * Se lanza cuando los datos no cumplen con el schema
 * 
 * @class ValidationError
 * @extends {AppError}
 */
export class ValidationError extends AppError {
  /**
   * Array de errores de validación
   * @type {Array<{field: string, message: string}>}
   */
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    errors: Array<{ field: string; message: string }> = []
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error 404 - Recurso no encontrado
 * Se lanza cuando se intenta acceder a un recurso que no existe
 * 
 * @class NotFoundError
 * @extends {AppError}
 */
export class NotFoundError extends AppError {
  /**
   * Recurso que no fue encontrado
   * @type {string}
   */
  public readonly resource: string;

  constructor(resource: string, message?: string) {
    const msg = message || `${resource} no encontrado`;
    super(msg, 'NOT_FOUND', 404);
    this.resource = resource;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error 401 - No autorizado
 * Se lanza cuando falta autenticación o el token es inválido
 * 
 * @class UnauthorizedError
 * @extends {AppError}
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado. Por favor inicia sesión.') {
    super(message, 'UNAUTHORIZED', 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Error 403 - Acceso prohibido
 * Se lanza cuando el usuario no tiene permisos para acceder
 * 
 * @class ForbiddenError
 * @extends {AppError}
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso prohibido. No tienes permisos.') {
    super(message, 'FORBIDDEN', 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Error 5xx - Error del servidor
 * Se lanza cuando el servidor tiene un error interno
 * 
 * @class ServerError
 * @extends {AppError}
 */
export class ServerError extends AppError {
  /**
   * Status code específico del error (500, 502, 503, etc)
   * @type {number}
   */
  public readonly serverStatusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message, 'SERVER_ERROR', statusCode);
    this.serverStatusCode = statusCode;
    Object.setPrototypeOf(this, ServerError.prototype);
  }

  /**
   * ¿Es un error recuperable (5xx)?
   * Los 500, 502, 503 pueden recuperarse reintentar
   * 
   * @returns {boolean} true si puede reintentar
   */
  isRetryable(): boolean {
    return [500, 502, 503].includes(this.serverStatusCode);
  }
}

/**
 * Error de timeout
 * Se lanza cuando una petición excede el tiempo límite
 * 
 * @class TimeoutError
 * @extends {AppError}
 */
export class TimeoutError extends AppError {
  /**
   * Tiempo límite en milisegundos
   * @type {number}
   */
  public readonly timeoutMs: number;

  constructor(timeoutMs: number, message?: string) {
    const msg = message || `Timeout después de ${timeoutMs}ms`;
    super(msg, 'TIMEOUT', null);
    this.timeoutMs = timeoutMs;
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Función para mapear status HTTP a tipos de error
 * 
 * @param {number} statusCode - Status code HTTP
 * @param {string} message - Mensaje del error
 * @returns {AppError} Instancia del error apropiado
 * 
 * @example
 * const error = mapHttpStatusToError(404, 'Guitarra no encontrada');
 * // Retorna: NotFoundError
 */
export function mapHttpStatusToError(
  statusCode: number,
  message: string
): AppError {
  switch (statusCode) {
    case 400:
      return new ValidationError(message);
    case 401:
      return new UnauthorizedError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError('Recurso', message);
    case 500:
    case 502:
    case 503:
      return new ServerError(message, statusCode);
    default:
      return new AppError(message, `HTTP_${statusCode}`, statusCode);
  }
}

/**
 * Función para determinar si un error es recuperable (se puede reintentar)
 * 
 * @param {Error} error - Error a evaluar
 * @returns {boolean} true si el error se puede reintentar
 * 
 * @example
 * if (isRetryableError(error)) {
 *   // Reintentar la petición
 * }
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) return error.canRetry();
  if (error instanceof ServerError) return error.isRetryable();
  if (error instanceof TimeoutError) return true;
  return false;
}

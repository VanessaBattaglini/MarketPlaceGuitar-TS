/**
 * @fileoverview Cliente HTTP centralizado para todas las peticiones API
 * 
 * Proporciona:
 * - Gestión de headers y autenticación
 * - Reintentos automáticos en errores de red
 * - Timeouts configurables
 * - Manejo de errores consistente
 * - Logging de peticiones/respuestas
 * 
 * Características:
 * - Interceptors para requests y responses
 * - Auto-retry con backoff exponencial
 * - Validación automática de respuestas
 * - TypeScript type-safe
 * 
 * @example
 * import { httpClient } from '@/services/api';
 * 
 * const guitars = await httpClient.get('/guitars');
 * const newGuitar = await httpClient.post('/guitars', { name: '...' });
 * 
 * @module services/api
 */

import { appConfig } from '../config/app.config';
import {
  NetworkError,
  ValidationError,
  TimeoutError,
  mapHttpStatusToError,
  isRetryableError,
  AppError,
} from './error';

// ============================================================================
// Tipos
// ============================================================================

/**
 * Opciones para configurar una petición HTTP
 * 
 * @typedef {Object} HttpRequestOptions
 * @property {Record<string, string>} [headers] - Headers adicionales
 * @property {number} [timeout] - Timeout en milisegundos
 * @property {number} [retries] - Número de reintentos
 * @property {boolean} [skipValidation] - Saltarse validación de respuesta
 */
interface HttpRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  skipValidation?: boolean;
}

/**
 * Estructura de respuesta del servidor
 * 
 * @typedef {Object} ApiResponse
 * @property {T} data - Datos de la respuesta
 * @property {boolean} success - ¿Fue exitosa?
 * @property {string} [message] - Mensaje adicional
 */
interface ApiResponse<T = any> {
  data?: T;
  success: boolean;
  message?: string;
}

// ============================================================================
// Cliente HTTP
// ============================================================================

/**
 * Cliente HTTP centralizado con reintentos y manejo de errores
 * 
 * Características:
 * - BaseURL configurables desde variables de entorno
 * - Reintentos automáticos con backoff exponencial
 * - Timeouts personalizables
 * - Interceptors para requests y responses
 * - Logging detallado en modo debug
 * 
 * @class HttpClient
 */
class HttpClient {
  /**
   * URL base para todas las peticiones
   * @type {string}
   */
  private baseUrl: string;

  /**
   * Timeout por defecto en milisegundos
   * @type {number}
   */
  private defaultTimeout: number;

  /**
   * Número máximo de reintentos por defecto
   * @type {number}
   */
  private defaultRetries: number;

  /**
   * Tokens de autenticación (Bearer token, API key, etc)
   * @type {string|null}
   */
  private authToken: string | null = null;

  /**
   * Constructor del cliente HTTP
   * 
   * Se inicializa con configuración de appConfig
   */
  constructor() {
    this.baseUrl = appConfig.api.baseUrl;
    this.defaultTimeout = appConfig.api.timeout;
    this.defaultRetries = appConfig.api.maxRetries;
  }

  /**
   * Setear token de autenticación
   * Se agregará automáticamente a todos los requests como Bearer token
   * 
   * @param {string} token - Token JWT o similar
   * 
   * @example
   * httpClient.setAuthToken(jwtToken);
   * // Siguientes peticiones incluirán: Authorization: Bearer <token>
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Limpiar token de autenticación
   * 
   * @example
   * httpClient.clearAuthToken();
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Obtener headers base para todas las peticiones
   * 
   * @param {HttpRequestOptions} [options] - Opciones adicionales
   * @returns {Record<string, string>} Headers completos
   */
  private getHeaders(options?: HttpRequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Agregar token si existe
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Sobrescribir con headers personalizados
    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    return headers;
  }

  /**
   * Realizar petición GET
   * 
   * @template T
   * @param {string} endpoint - Ruta del endpoint (ej: /guitars, /guitars/1)
   * @param {HttpRequestOptions} [options] - Opciones de la petición
   * @returns {Promise<T>} Datos de la respuesta
   * @throws {AppError} Si hay error en la petición
   * 
   * @example
   * const guitars = await httpClient.get<Guitar[]>('/guitars');
   * const guitar = await httpClient.get<Guitar>('/guitars/1');
   */
  async get<T = any>(
    endpoint: string,
    options?: HttpRequestOptions
  ): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * Realizar petición POST
   * 
   * @template T
   * @param {string} endpoint - Ruta del endpoint
   * @param {any} body - Cuerpo de la petición (será serializado a JSON)
   * @param {HttpRequestOptions} [options] - Opciones de la petición
   * @returns {Promise<T>} Datos de la respuesta
   * @throws {AppError} Si hay error en la petición
   * 
   * @example
   * const newGuitar = await httpClient.post<Guitar>('/guitars', {
   *   name: 'Guitarra nueva',
   *   price: 299.99
   * });
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: HttpRequestOptions
  ): Promise<T> {
    return this.request<T>('POST', endpoint, body, options);
  }

  /**
   * Realizar petición PUT
   * 
   * @template T
   * @param {string} endpoint - Ruta del endpoint
   * @param {any} body - Cuerpo de la petición
   * @param {HttpRequestOptions} [options] - Opciones de la petición
   * @returns {Promise<T>} Datos de la respuesta
   * @throws {AppError} Si hay error en la petición
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: HttpRequestOptions
  ): Promise<T> {
    return this.request<T>('PUT', endpoint, body, options);
  }

  /**
   * Realizar petición PATCH
   * 
   * @template T
   * @param {string} endpoint - Ruta del endpoint
   * @param {any} body - Cuerpo de la petición
   * @param {HttpRequestOptions} [options] - Opciones de la petición
   * @returns {Promise<T>} Datos de la respuesta
   * @throws {AppError} Si hay error en la petición
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    options?: HttpRequestOptions
  ): Promise<T> {
    return this.request<T>('PATCH', endpoint, body, options);
  }

  /**
   * Realizar petición DELETE
   * 
   * @template T
   * @param {string} endpoint - Ruta del endpoint
   * @param {HttpRequestOptions} [options] - Opciones de la petición
   * @returns {Promise<T>} Datos de la respuesta
   * @throws {AppError} Si hay error en la petición
   */
  async delete<T = any>(
    endpoint: string,
    options?: HttpRequestOptions
  ): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * Petición base con reintentos automáticos
   * 
   * Características:
   * - Reintentos automáticos con backoff exponencial
   * - Timeout configurable
   * - Logging en modo debug
   * - Validación de respuesta
   * 
   * @template T
   * @param {string} method - Método HTTP (GET, POST, etc)
   * @param {string} endpoint - Ruta del endpoint
   * @param {any} body - Cuerpo de la petición
   * @param {HttpRequestOptions} [options] - Opciones
   * @returns {Promise<T>} Datos de la respuesta
   * @throws {AppError} Si falla después de todos los reintentos
   */
  private async request<T = any>(
    method: string,
    endpoint: string,
    body?: any,
    options?: HttpRequestOptions
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options?.timeout ?? this.defaultTimeout;
    const maxRetries = options?.retries ?? this.defaultRetries;

    let lastError: Error | null = null;

    // Reintentos con backoff exponencial
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.fetchWithTimeout<T>(
          url,
          {
            method,
            headers: this.getHeaders(options),
            body: body ? JSON.stringify(body) : undefined,
          },
          timeout,
          options?.skipValidation
        );
      } catch (error) {
        lastError = error as Error;

        // Log del error
        if (appConfig.logging.debug) {
          console.warn(
            `🔄 Intento ${attempt + 1}/${maxRetries + 1} fallido para ${method} ${endpoint}:`,
            error
          );
        }

        // Verificar si es recuperable
        if (!isRetryableError(error) || attempt === maxRetries) {
          throw error;
        }

        // Esperar antes de reintentar (backoff exponencial)
        const delayMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, ...
        await this.delay(delayMs);
      }
    }

    throw lastError || new AppError('Petición fallida', 'UNKNOWN_ERROR');
  }

  /**
   * Fetch con timeout
   * Fetch nativo no tiene soporte de timeout, así que lo implementamos manualmente
   * 
   * @template T
   * @param {string} url - URL completa
   * @param {RequestInit} init - Opciones de fetch
   * @param {number} timeoutMs - Timeout en milisegundos
   * @param {boolean} [skipValidation] - Saltarse validación
   * @returns {Promise<T>} Datos parseados de la respuesta
   * @throws {AppError} Si hay error en la petición
   */
  private async fetchWithTimeout<T = any>(
    url: string,
    init: RequestInit,
    timeoutMs: number,
    skipValidation?: boolean
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      // Log en modo debug
      if (appConfig.logging.debug) {
        console.log(
          `✅ ${init.method} ${url} → ${response.status}`
        );
      }

      // Manejo de errores HTTP
      if (!response.ok) {
        const errorData = await this.parseResponse(response);
        const message = errorData?.message || response.statusText;
        throw mapHttpStatusToError(response.status, message);
      }

      // Parsear y validar respuesta
      const data = await this.parseResponse<T>(response, skipValidation);
      return data;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError(timeoutMs);
      }

      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof TypeError) {
        // Error de red (no hay conexión)
        throw new NetworkError(
          'Error de conectividad de red',
          0,
          this.defaultRetries
        );
      }

      throw new AppError(
        error instanceof Error ? error.message : 'Error desconocido',
        'FETCH_ERROR'
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Parsear respuesta JSON de forma segura
   * 
   * @template T
   * @param {Response} response - Respuesta de fetch
   * @param {boolean} [skipValidation] - Saltarse validación
   * @returns {Promise<T>} Datos parseados
   * @throws {ValidationError} Si el JSON es inválido
   */
  private async parseResponse<T = any>(
    response: Response,
    skipValidation?: boolean
  ): Promise<T> {
    const contentType = response.headers.get('content-type');

    // Si no es JSON, retornar empty object
    if (!contentType?.includes('application/json')) {
      return {} as T;
    }

    try {
      const text = await response.text();

      if (!text) {
        return {} as T;
      }

      const data = JSON.parse(text);

      // Validar estructura de respuesta
      if (!skipValidation && data.success === false) {
        throw new ValidationError(
          data.message || 'Error en la respuesta del servidor'
        );
      }

      // Si es ApiResponse, extraer .data, sino retornar tal cual
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new ValidationError('Error al parsear respuesta JSON');
    }
  }

  /**
   * Helper para delay/sleep (usado en reintentos)
   * 
   * @param {number} ms - Milisegundos a esperar
   * @returns {Promise<void>}
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Instancia única del cliente HTTP
 * Se exporta para usarse en toda la aplicación
 * 
 * @constant
 * @type {HttpClient}
 * 
 * @example
 * import { httpClient } from '@/services/api';
 * 
 * const data = await httpClient.get('/endpoint');
 */
export const httpClient = new HttpClient();

/**
 * Exportar tipos para uso en otras partes de la app
 */
export type { HttpRequestOptions, ApiResponse };

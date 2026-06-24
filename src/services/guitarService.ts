/**
 * @fileoverview Servicio para operaciones relacionadas con guitarras
 * 
 * Proporciona funciones para:
 * - Obtener lista de guitarras
 * - Obtener una guitarra específica
 * - Crear nueva guitarra (admin)
 * - Actualizar guitarra (admin)
 * - Eliminar guitarra (admin)
 * 
 * Utiliza el cliente HTTP centralizado para todas las peticiones
 * Abstrae los detalles de la API del resto de la aplicación
 * 
 * @example
 * import { guitarService } from '@/services/guitarService';
 * 
 * const guitars = await guitarService.getAll();
 * const guitar = await guitarService.getById(1);
 * 
 * @module services/guitarService
 */

import { Guitar } from '../types/types';
import { httpClient } from './api';

/**
 * Endpoints de la API de guitarras
 * 
 * @constant
 * @type {Object}
 */
const ENDPOINTS = {
  /** Obtener todas las guitarras */
  GET_ALL: '/guitars',
  
  /** Obtener una guitarra por ID */
  GET_BY_ID: (id: number) => `/guitars/${id}`,
  
  /** Crear nueva guitarra */
  CREATE: '/guitars',
  
  /** Actualizar guitarra */
  UPDATE: (id: number) => `/guitars/${id}`,
  
  /** Eliminar guitarra */
  DELETE: (id: number) => `/guitars/${id}`,
};

/**
 * Servicio para operaciones de guitarras
 * 
 * Métodos:
 * - getAll(): Obtener todas las guitarras
 * - getById(id): Obtener una guitarra específica
 * - create(guitar): Crear nueva guitarra
 * - update(id, guitar): Actualizar guitarra
 * - delete(id): Eliminar guitarra
 * 
 * Todos los métodos usan el cliente HTTP centralizado con reintentos automáticos
 * 
 * @namespace guitarService
 */
export const guitarService = {
  /**
   * Obtener todas las guitarras disponibles
   * 
   * GET /api/guitars
   * 
   * @returns {Promise<Guitar[]>} Array de todas las guitarras
   * @throws {AppError} Si hay error en la petición
   * 
   * @example
   * try {
   *   const guitars = await guitarService.getAll();
   *   console.log(`${guitars.length} guitarras disponibles`);
   * } catch (error) {
   *   console.error('Error al obtener guitarras:', error);
   * }
   */
  async getAll(): Promise<Guitar[]> {
    return httpClient.get<Guitar[]>(ENDPOINTS.GET_ALL);
  },

  /**
   * Obtener una guitarra específica por su ID
   * 
   * GET /api/guitars/{id}
   * 
   * @param {number} id - ID de la guitarra a obtener
   * @returns {Promise<Guitar>} La guitarra solicitada
   * @throws {NotFoundError} Si la guitarra no existe
   * @throws {AppError} Si hay error en la petición
   * 
   * @example
   * try {
   *   const guitar = await guitarService.getById(1);
   *   console.log(`Guitarra: ${guitar.name}`);
   * } catch (error) {
   *   if (error instanceof NotFoundError) {
   *     console.log('Guitarra no existe');
   *   }
   * }
   */
  async getById(id: number): Promise<Guitar> {
    return httpClient.get<Guitar>(ENDPOINTS.GET_BY_ID(id));
  },

  /**
   * Crear nueva guitarra (requiere autenticación y permisos admin)
   * 
   * POST /api/guitars
   * 
   * @param {Omit<Guitar, 'id'>} guitarData - Datos de la nueva guitarra (sin ID)
   * @returns {Promise<Guitar>} Guitarra creada con ID asignado
   * @throws {ValidationError} Si los datos no son válidos
   * @throws {UnauthorizedError} Si no hay autenticación
   * @throws {ForbiddenError} Si no tienes permisos
   * @throws {AppError} Si hay error en la petición
   * 
   * @example
   * try {
   *   const newGuitar = await guitarService.create({
   *     name: 'Guitarra nueva',
   *     image: 'guitarra_new',
   *     description: 'Una guitarra hermosa',
   *     price: 399.99
   *   });
   *   console.log('Creada:', newGuitar);
   * } catch (error) {
   *   console.error('Error:', error.message);
   * }
   */
  async create(guitarData: Omit<Guitar, 'id'>): Promise<Guitar> {
    return httpClient.post<Guitar>(ENDPOINTS.CREATE, guitarData);
  },

  /**
   * Actualizar una guitarra existente (requiere autenticación y permisos admin)
   * 
   * PUT /api/guitars/{id}
   * 
   * @param {number} id - ID de la guitarra a actualizar
   * @param {Partial<Guitar>} updates - Campos a actualizar
   * @returns {Promise<Guitar>} Guitarra actualizada
   * @throws {NotFoundError} Si la guitarra no existe
   * @throws {ValidationError} Si los datos no son válidos
   * @throws {UnauthorizedError} Si no hay autenticación
   * @throws {ForbiddenError} Si no tienes permisos
   * @throws {AppError} Si hay error en la petición
   * 
   * @example
   * try {
   *   const updated = await guitarService.update(1, {
   *     price: 499.99
   *   });
   *   console.log('Actualizada:', updated);
   * } catch (error) {
   *   console.error('Error:', error.message);
   * }
   */
  async update(id: number, updates: Partial<Guitar>): Promise<Guitar> {
    return httpClient.put<Guitar>(ENDPOINTS.UPDATE(id), updates);
  },

  /**
   * Eliminar una guitarra (requiere autenticación y permisos admin)
   * 
   * DELETE /api/guitars/{id}
   * 
   * @param {number} id - ID de la guitarra a eliminar
   * @returns {Promise<void>} Void si se eliminó correctamente
   * @throws {NotFoundError} Si la guitarra no existe
   * @throws {UnauthorizedError} Si no hay autenticación
   * @throws {ForbiddenError} Si no tienes permisos
   * @throws {AppError} Si hay error en la petición
   * 
   * @example
   * try {
   *   await guitarService.delete(1);
   *   console.log('Guitarra eliminada');
   * } catch (error) {
   *   console.error('Error al eliminar:', error.message);
   * }
   */
  async delete(id: number): Promise<void> {
    await httpClient.delete(ENDPOINTS.DELETE(id));
  },

  /**
   * Obtener guitarras filtradas por búsqueda (si el backend lo soporta)
   * 
   * GET /api/guitars?search={query}
   * 
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Guitar[]>} Guitarras que coinciden con la búsqueda
   * @throws {AppError} Si hay error en la petición
   * 
   * @example
   * const results = await guitarService.search('acústica');
   */
  async search(query: string): Promise<Guitar[]> {
    const params = new URLSearchParams({ search: query });
    return httpClient.get<Guitar[]>(`${ENDPOINTS.GET_ALL}?${params}`);
  },

  /**
   * Obtener guitarras paginadas (si el backend lo soporta)
   * 
   * GET /api/guitars?page={page}&limit={limit}
   * 
   * @param {number} page - Número de página (comienza en 1)
   * @param {number} limit - Items por página
   * @returns {Promise<{guitars: Guitar[], total: number}>} Guitarras y total
   * @throws {AppError} Si hay error en la petición
   * 
   * @example
   * const { guitars, total } = await guitarService.getPaginated(1, 10);
   * console.log(`Página 1 de ${Math.ceil(total / 10)}`);
   */
  async getPaginated(
    page: number,
    limit: number
  ): Promise<{ guitars: Guitar[]; total: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return httpClient.get(`${ENDPOINTS.GET_ALL}?${params}`);
  },
};

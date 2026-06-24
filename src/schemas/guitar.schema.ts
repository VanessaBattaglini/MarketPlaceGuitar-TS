/**
 * Schemas de validación para guitarras y carrito usando Zod
 * Proporciona validación type-safe y manejo de errores consistente
 */

import { z } from 'zod';
import { CART_CONFIG } from '../config/cart.config';

/**
 * Schema para validar un objeto Guitar
 * Asegura que tenga todos los campos requeridos con tipos correctos
 */
export const guitarSchema = z.object({
  id: z.number().int().positive('ID debe ser un número positivo'),
  name: z.string().min(1, 'El nombre no puede estar vacío'),
  image: z.string().min(1, 'La imagen no puede estar vacía'),
  description: z.string().min(1, 'La descripción no puede estar vacía'),
  price: z.number().positive('El precio debe ser mayor a 0'),
});

/**
 * Type derivado del schema para usar en TypeScript
 * Garantiza que el tipo coincida exactamente con el schema
 */
export type GuitarValidated = z.infer<typeof guitarSchema>;

/**
 * Schema para validar un CartItem (Guitar + quantity)
 * Valida que la cantidad esté dentro de los límites configurados
 */
export const cartItemSchema = guitarSchema.extend({
  quantity: z
    .number()
    .int('La cantidad debe ser un número entero')
    .min(
      CART_CONFIG.MIN_ITEMS,
      `La cantidad mínima es ${CART_CONFIG.MIN_ITEMS}`
    )
    .max(
      CART_CONFIG.MAX_ITEMS,
      `La cantidad máxima es ${CART_CONFIG.MAX_ITEMS}`
    ),
});

/**
 * Type derivado del schema CartItem
 */
export type CartItemValidated = z.infer<typeof cartItemSchema>;

/**
 * Schema para validar un array completo de CartItems
 */
export const cartArraySchema = z.array(cartItemSchema);

/**
 * Función auxiliar para validar y parsear datos de forma segura
 * Retorna los datos validados o null si falla la validación
 * 
 * @param data - Datos a validar
 * @param schema - Schema de Zod a usar
 * @returns Datos validados o null
 */
export function safeValidate<T>(data: unknown, schema: z.ZodSchema<T>): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn('Validación fallida:', error.message);
    }
    return null;
  }
}

/**
 * Función para obtener mensajes de error legibles desde ZodError
 * 
 * @param error - Error de Zod
 * @returns Array de mensajes de error
 */
export function getZodErrorMessages(error: z.ZodError<unknown>): string[] {
  return error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`
  );
}

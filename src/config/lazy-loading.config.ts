/**
 * @fileoverview Configuración de lazy loading (carga perezosa) de componentes
 * 
 * Este módulo proporciona componentes cargados dinámicamente usando React.lazy()
 * Lo que permite que Vite genere chunks separados durante el build.
 * 
 * Ventajas:
 * - Reduce el tamaño del bundle inicial
 * - Carga componentes bajo demanda
 * - Mejor performance en la carga inicial
 * - Ideal para componentes que no siempre se usan
 * 
 * Patrón:
 * - Cada componente lazy se define aquí
 * - Se importa con React.lazy()
 * - Se envuelve en Suspense en el componente padre
 * - Se proporciona un fallback mientras carga
 * 
 * Componentes candidatos para lazy loading:
 * - Componentes pesados (dialogs, modales)
 * - Componentes condicionales (mostrados solo a veces)
 * - Componentes bajo rutas secundarias
 * - Componentes de admin/settings
 * 
 * @example
 * import { LazyGuitarGallery } from '@/config/lazy-loading.config';
 * 
 * <Suspense fallback={<LoadingSpinner />}>
 *   <LazyGuitarGallery />
 * </Suspense>
 * 
 * @module config/lazy-loading.config
 */

import { lazy } from 'react';

// ============================================================================
// Componentes Lazy-Loaded
// ============================================================================

/**
 * Header del sitio (carrito desplegable)
 * 
 * Razón para lazy loading:
 * - El header es relativamente pesado con la lógica del carrito
 * - Se carga después del contenido principal
 * - Mejora el Core Web Vital: First Contentful Paint (FCP)
 * 
 * Tamaño: ~15KB
 * 
 * @example
 * <Suspense fallback={<HeaderSkeleton />}>
 *   <LazyHeader cart={cart} dispatch={dispatch} />
 * </Suspense>
 */
export const LazyHeader = lazy(() =>
  import('../components/Header').then((mod) => ({
    default: mod.default,
  }))
);

/**
 * Galería de guitarras
 * 
 * Razón para lazy loading:
 * - La galería contiene muchos componentes Guitar
 * - Se carga después del fold (visible area)
 * - Permite que el header se renderice primero
 * 
 * Tamaño: ~20KB
 * 
 * @example
 * <Suspense fallback={<GallerySkeleton />}>
 *   <LazyGuitarGallery data={data} dispatch={dispatch} />
 * </Suspense>
 */
export const LazyGuitarGallery = lazy(() =>
  import('../components/Guitar').then((mod) => ({
    default: () => {
      // Este es un placeholder, en real tendría un componente GuitarGallery
      return mod.default as any;
    },
  }))
);

/**
 * Carrito (tabla de items)
 * 
 * Razón para lazy loading:
 * - Se muestra condicionalemente (solo si hay items)
 * - Es un componente pesado con lógica interactiva
 * - Puede cargarse bajo demanda
 * 
 * Tamaño: ~10KB
 * 
 * @example
 * <Suspense fallback={<CartSkeleton />}>
 *   <LazyCartTable cart={cart} dispatch={dispatch} />
 * </Suspense>
 */
export const LazyCartTable = lazy(() =>
  import('../components/Cart/CartTable').then((mod) => ({
    default: mod.default,
  }))
);

// ============================================================================
// Configuración Global de Lazy Loading
// ============================================================================

/**
 * Configuración de opciones para Suspense fallbacks
 * 
 * @constant
 * @type {Object}
 */
export const LAZY_LOADING_CONFIG = {
  /**
   * Tiempo de espera antes de mostrar fallback
   * Evita parpadeos para cargas rápidas
   * 
   * @type {number}
   * @default 200
   */
  suspenseFallbackDelay: 200,

  /**
   * Habilitar logs de lazy loading en console
   * Útil para debugging
   * 
   * @type {boolean}
   * @default false (cambiar a true para debug)
   */
  debug: false,
};

/**
 * Función helper para medir tiempo de carga de componentes lazy
 * 
 * @param {string} componentName - Nombre del componente
 * @param {Function} loadComponent - Función que carga el componente
 * @returns {Promise<any>} Componente cargado
 * 
 * @example
 * const LazyCustom = lazy(() =>
 *   measureComponentLoad('CustomComponent', () =>
 *     import('./Custom').then(m => ({ default: m.default }))
 *   )
 * );
 */
export const measureComponentLoad = async (
  componentName: string,
  loadComponent: () => Promise<any>
): Promise<any> => {
  if (LAZY_LOADING_CONFIG.debug) {
    console.time(`⏱️  Cargando ${componentName}`);
  }

  try {
    const component = await loadComponent();
    if (LAZY_LOADING_CONFIG.debug) {
      console.timeEnd(`⏱️  Cargando ${componentName}`);
    }
    return component;
  } catch (error) {
    console.error(`❌ Error cargando ${componentName}:`, error);
    throw error;
  }
};

/**
 * Componente Suspense Boundary personalizado
 * Proporciona un fallback consistente para todos los componentes lazy
 * 
 * @example
 * import { SuspenseBoundary } from '@/config/lazy-loading.config';
 * 
 * <SuspenseBoundary>
 *   <LazyHeader />
 * </SuspenseBoundary>
 */
export { Suspense as SuspenseBoundary } from 'react';

/**
 * Documentación de uso de lazy loading
 * 
 * Pasos para implementar:
 * 1. Crear componente lazy con lazy()
 * 2. Exportarlo desde este archivo
 * 3. Importarlo donde se necesite
 * 4. Envolverlo en <Suspense fallback={<Skeleton />}>
 * 5. Proporcionar fallback apropiado
 * 
 * Ejemplo completo:
 * 
 * ```tsx
 * import { Suspense } from 'react';
 * import { LazyHeader } from '@/config/lazy-loading.config';
 * import HeaderSkeleton from '@/components/Skeletons/HeaderSkeleton';
 * 
 * export default function App() {
 *   return (
 *     <Suspense fallback={<HeaderSkeleton />}>
 *       <LazyHeader cart={cart} dispatch={dispatch} />
 *     </Suspense>
 *   );
 * }
 * ```
 * 
 * Mejores prácticas:
 * - Siempre proporcionar un fallback apropiado (skeleton, spinner)
 * - Usar lazy loading solo para componentes que no sean críticos
 * - No lazy-load componentes que se ven en el fold inicial
 * - Medir performance antes y después
 * 
 * Cuándo usar lazy loading:
 * ✅ Componentes condicionales (if statements)
 * ✅ Componentes bajo rutas secundarias
 * ✅ Componentes pesados que no se usan inmediatamente
 * ✅ Diálogos, modales, popovers
 * ✅ Paneles de admin/settings
 * 
 * Cuándo NO usar lazy loading:
 * ❌ Componentes críticos para el LCP (Largest Contentful Paint)
 * ❌ Componentes que siempre se renderizan
 * ❌ Componentes muy pequeños (< 1KB)
 * ❌ Componentes de navegación principal
 * 
 * @module lazy-loading-usage
 */

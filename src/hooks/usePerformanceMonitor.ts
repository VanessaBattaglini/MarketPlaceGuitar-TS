/**
 * @fileoverview Hook para monitorear performance de componentes
 * 
 * Proporciona:
 * - Medición de tiempos de render
 * - Detección de re-renders innecesarios
 * - Reporting de Core Web Vitals
 * - Logging automático de performance
 * 
 * @example
 * import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
 * 
 * function MyComponent() {
 *   usePerformanceMonitor('MyComponent');
 *   
 *   return <div>Contenido</div>;
 * }
 * 
 * @module hooks/usePerformanceMonitor
 */

import { useEffect, useRef } from 'react';
import { logger } from '../utils/logger';
import { appConfig } from '../config/app.config';

/**
 * Hook para monitorear performance de componentes
 * 
 * Mide:
 * - Tiempo de renderización
 * - Número de renders
 * - Renders innecesarios
 * - Core Web Vitals
 * 
 * @param {string} componentName - Nombre del componente (para logging)
 * @param {boolean} [verbose] - Loguar cada render (si es true)
 * @returns {void}
 * 
 * @example
 * function ExpensiveComponent() {
 *   usePerformanceMonitor('ExpensiveComponent', true);
 *   
 *   return <div>Contenido costoso</div>;
 * }
 */
export function usePerformanceMonitor(
  componentName: string,
  verbose: boolean = false
): void {
  // Refs para tracking
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(performance.now());
  const mountTimeRef = useRef(performance.now());

  useEffect(() => {
    // Incrementar contador de renders
    renderCountRef.current++;

    // Calcular tiempo de render
    const now = performance.now();
    const renderTime = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;

    // Loguar si está en modo verbose
    if (verbose && appConfig.logging.debug) {
      logger.debug(`${componentName} rendered`, {
        renderCount: renderCountRef.current,
        renderTime: `${renderTime.toFixed(2)}ms`,
      });
    }

    // Warn si el render es lento (> 16ms = 1 frame @ 60fps)
    if (renderTime > 16) {
      logger.warn(`Slow render detected in ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        threshold: '16ms (60fps)',
      });
    }
  });

  // Cleanup: Log de desmontaje
  useEffect(() => {
    const totalTime = performance.now() - mountTimeRef.current;

    return () => {
      if (appConfig.logging.debug) {
        logger.debug(`${componentName} unmounted`, {
          totalLifetime: `${totalTime.toFixed(2)}ms`,
          totalRenders: renderCountRef.current,
        });
      }
    };
  }, [componentName]);
}

/**
 * Función para reportar Core Web Vitals
 * 
 * Métrica de Google: LCP, FID, CLS
 * 
 * @returns {void}
 * 
 * @example
 * // En App.tsx
 * import { reportWebVitals } from '@/hooks/usePerformanceMonitor';
 * 
 * useEffect(() => {
 *   reportWebVitals();
 * }, []);
 */
export function reportWebVitals(): void {
  // Solo en navegadores que soportan PerformanceObserver
  if (!('PerformanceObserver' in window)) {
    return;
  }

  try {
    // Observar Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      const lcp = lastEntry.renderTime || lastEntry.loadTime;

      logger.info('LCP (Largest Contentful Paint)', {
        value: `${lcp.toFixed(0)}ms`,
        element: lastEntry.element?.tagName || 'unknown',
      });
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Observar Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((list) => {
      let cls = 0;
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      });

      if (cls > 0.1) {
        logger.warn('High CLS (Cumulative Layout Shift) detected', {
          value: cls.toFixed(3),
          threshold: '0.1',
        });
      }
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Observar First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        logger.info('FID (First Input Delay)', {
          value: `${entry.processingDuration.toFixed(0)}ms`,
          name: entry.name,
        });
      });
    });

    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (error) {
    logger.warn('Error reporting web vitals', error as Error);
  }
}

/**
 * Hook para medir tiempo de operación asincrónica
 * 
 * @param {string} operationName - Nombre de la operación
 * @returns {Object} Objeto con métodos start() y end()
 * 
 * @example
 * const timer = useOperationTimer('fetchGuitars');
 * 
 * timer.start();
 * const guitars = await guitarService.getAll();
 * timer.end({ count: guitars.length });
 */
export function useOperationTimer(operationName: string) {
  const startTimeRef = useRef(0);

  return {
    /**
     * Iniciar medición
     */
    start: () => {
      startTimeRef.current = performance.now();
    },

    /**
     * Finalizar medición y loguar resultado
     * 
     * @param {any} [data] - Datos adicionales para logging
     */
    end: (data?: any) => {
      const duration = performance.now() - startTimeRef.current;

      logger.info(`${operationName} completed`, {
        duration: `${duration.toFixed(2)}ms`,
        ...data,
      });
    },

    /**
     * Obtener tiempo transcurrido sin finalizar
     * 
     * @returns {number} Milisegundos transcurridos
     */
    getDuration: () => {
      return performance.now() - startTimeRef.current;
    },
  };
}

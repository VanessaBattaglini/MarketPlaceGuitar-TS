/**
 * @fileoverview Hook personalizado para gestionar el tema (light/dark mode)
 * 
 * Características:
 * - Detecta preferencia del sistema operativo
 * - Permite cambio manual del usuario
 * - Persiste preferencia en localStorage
 * - Sincroniza con cambios del sistema
 * 
 * @example
 * const { isDark, toggleTheme } = useTheme()
 * 
 * @module useTheme
 */

import { useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark' | 'system'

/**
 * Hook para gestionar el tema de la aplicación
 * 
 * Maneja:
 * - Detección de preferencia del sistema
 * - Almacenamiento en localStorage
 * - Aplicación de clase al documento
 * - Sincronización con cambios del sistema
 * 
 * @returns {Object} Objeto con estado del tema y funciones
 * @returns {boolean} isDark - true si está en dark mode
 * @returns {Theme} theme - Tema actual ('light', 'dark', 'system')
 * @returns {Function} toggleTheme - Función para alternar entre light/dark
 * @returns {Function} setTheme - Función para establecer un tema específico
 * 
 * @example
 * const { isDark, toggleTheme, setTheme } = useTheme()
 * 
 * // Alternar entre light y dark
 * <button onClick={toggleTheme}>
 *   {isDark ? '☀️ Light' : '🌙 Dark'}
 * </button>
 * 
 * // Establecer tema específico
 * <button onClick={() => setTheme('system')}>Use System</button>
 */
export function useTheme() {
  const STORAGE_KEY = 'theme-preference'
  
  /**
   * Detecta si el sistema prefiere dark mode
   * 
   * @returns {boolean} true si el sistema está en dark mode
   */
  const getSystemTheme = useCallback((): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }, [])

  /**
   * Obtiene el tema guardado o la preferencia del sistema
   * 
   * @returns {boolean} true si debe usar dark mode
   */
  const getInitialTheme = useCallback((): boolean => {
    // Primero, revisar localStorage
    const saved = localStorage.getItem(STORAGE_KEY)
    
    if (saved === 'dark') return true
    if (saved === 'light') return false
    
    // Si no hay preferencia guardada, usar la del sistema
    return getSystemTheme()
  }, [getSystemTheme])

  const [isDark, setIsDark] = useState<boolean>(() => getInitialTheme())
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    return saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system'
  })

  /**
   * Aplica el tema al documento
   * 
   * Agrega/remueve clase 'dark' al elemento :root
   * También establece el color-scheme CSS
   * Fuerza repaint para aplicar cambios CSS
   * 
   * @param {boolean} dark - true para dark mode, false para light
   */
  const applyTheme = useCallback((dark: boolean) => {
    const root = document.documentElement
    
    if (dark) {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
    
    // Forzar repaint para que Bootstrap y otros estilos se apliquen
    root.style.filter = 'none'
    
    setIsDark(dark)
  }, [])

  /**
   * Establece el tema a un valor específico
   * 
   * @param {Theme} newTheme - 'light', 'dark', o 'system'
   * 
   * @example
   * setTheme('dark')
   * setTheme('system') // Usa la preferencia del SO
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
    
    if (newTheme === 'system') {
      applyTheme(getSystemTheme())
    } else {
      applyTheme(newTheme === 'dark')
    }
  }, [applyTheme, getSystemTheme])

  /**
   * Alterna entre light y dark mode
   * 
   * @example
   * <button onClick={toggleTheme}>Toggle Theme</button>
   */
  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark')
  }, [isDark, setTheme])

  /**
   * Efecto: Escucha cambios en la preferencia del sistema
   * 
   * Si el usuario está en modo 'system', se sincroniza automáticamente
   * Si el usuario ha seleccionado 'light' o 'dark', respeta su elección
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (theme === 'system') {
        applyTheme(e.matches)
      }
    }

    // Escuchar cambios
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, applyTheme])

  /**
   * Efecto: Aplicar tema inicial al montar
   */
  useEffect(() => {
    applyTheme(isDark)
  }, [applyTheme, isDark])

  return {
    isDark,
    theme,
    toggleTheme,
    setTheme,
  }
}

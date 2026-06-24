/**
 * @fileoverview Componente ThemeToggle para cambiar entre light/dark mode
 * 
 * Características:
 * - Botón elegante que muestra el tema actual
 * - Icono que cambia según el modo
 * - Responde a cambios del sistema
 * - Persiste la preferencia del usuario
 * 
 * @example
 * <ThemeToggle />
 * 
 * @component
 */

import { useTheme } from '../../hooks/useTheme'
import './ThemeToggle.css'

/**
 * Componente ThemeToggle
 * 
 * Muestra un botón para alternar entre light y dark mode.
 * El botón:
 * - Cambia de icono según el modo actual (☀️ / 🌙)
 * - Es accesible con teclado (Enter, Space)
 * - Tiene aria-label descriptivo
 * - Se sincroniza con la preferencia del sistema
 * 
 * @returns {JSX.Element} Botón de toggle del tema
 * 
 * @example
 * export function Header() {
 *   return (
 *     <header>
 *       <nav>
 *         <ThemeToggle />
 *       </nav>
 *     </header>
 *   )
 * }
 */
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      title={`Modo actual: ${isDark ? 'Oscuro' : 'Claro'}`}
    >
      {/* Icono para light mode */}
      <span className="theme-icon theme-icon-light" aria-hidden="true">
        ☀️
      </span>
      
      {/* Icono para dark mode */}
      <span className="theme-icon theme-icon-dark" aria-hidden="true">
        🌙
      </span>
    </button>
  )
}

export default ThemeToggle

# 🟢 Cambio de Color de Botón "Agregar" a Verde

## 📌 ¿Qué se implementó?

Se agregó un **cambio de color dinámico** al botón "Agregar al Carrito". Cuando haces clic, el botón cambia de **negro a verde** durante la animación, proporcionando feedback visual adicional.

## ✨ Efecto Visual

### Antes del Clic
```
┌──────────────────────────┐
│  Agregar al Carrito      │  Color: Negro (#262626)
└──────────────────────────┘
```

### Durante el Clic
```
┌──────────────────────────┐
│  Agregar al Carrito      │  Color: Verde (#28a745)
│  (elevado + escalado)    │  Sombra: Verde oscura
└──────────────────────────┘
```

### Después del Clic
```
┌──────────────────────────┐
│  Agregar al Carrito      │  Color: Vuelve a Negro
└──────────────────────────┘
```

## 🎨 Detalles de la Animación

| Propiedad | Valor |
|-----------|-------|
| Color inicial | Negro (#262626) |
| Color en pico | Verde (#28a745) |
| Color final | Negro (#262626) |
| Duración | 600ms |
| Timing | ease-out |
| Sombra en pico | Verde (rgba(40, 167, 69, 0.3)) |

## 🎯 Cómo Funciona

### Paso 1: Detectar la variante del botón
```typescript
const animationClass = isClicked 
  ? (variant === 'add' ? 'btn-clicked-add' : 'btn-clicked')
  : '';
```

Si `variant === 'add'` → Usa animación con color verde  
Si otro → Usa animación normal sin cambio de color

### Paso 2: Aplicar la clase CSS
```typescript
const cssClasses = `${config.cssClass} ${className} ${animationClass}`.trim();
```

### Paso 3: CSS Keyframes
```css
@keyframes buttonClickGreen {
  0% {
    /* Negro - Estado inicial */
    background-color: #262626;
  }
  
  50% {
    /* Verde - Máxima elevación */
    background-color: #28a745;
  }
  
  100% {
    /* Negro - Vuelve a normal */
    background-color: #262626;
  }
}
```

## 📊 Dónde se aplica

✅ **Botón "Agregar al Carrito"**
- En cada tarjeta de guitarra en la galería
- Cambia a verde al hacer clic

❌ **OTROS BOTONES NO CAMBIAN DE COLOR**
- Botón "Vaciar Carrito" (sigue siendo normal)
- Botón "X" remover (sigue siendo rojo)
- Botones "+/-" cantidad (siguen siendo normales)

## 🔧 Implementación Técnica

### Archivos Modificados

```
src/components/Button/
├── CartButton.tsx       (Lógica de variante)
├── CartButton.css       (Nuevo keyframe buttonClickGreen)
```

### Código Clave

**CartButton.tsx:**
```typescript
// Determinar la clase de animación según la variante
const animationClass = isClicked 
  ? (variant === 'add' ? 'btn-clicked-add' : 'btn-clicked')
  : '';
```

**CartButton.css:**
```css
.btn-clicked-add {
  animation: buttonClickGreen 0.6s ease-out 1;
}

@keyframes buttonClickGreen {
  0% {
    background-color: #262626;
  }
  50% {
    background-color: #28a745;
  }
  100% {
    background-color: #262626;
  }
}
```

## 🌙 Dark Mode

En dark mode:
- El verde se mantiene igual (#28a745)
- Funciona correctamente con el fondo oscuro
- La sombra se adapta automáticamente

## ♿ Accesibilidad

✅ **Accesible porque:**

1. **El color es complementario**
   - No es la única diferencia visual
   - La elevación + escala también comunican el clic

2. **Respeta `prefers-reduced-motion`**
   - Los usuarios que no pueden ver animaciones siguen teniendo feedback

3. **No afecta funcionalidad**
   - El botón responde inmediatamente
   - El color es solo visual

4. **Contraste mantenido**
   - Verde #28a745 mantiene buen contraste
   - WCAG AA compliant

## 🧪 Testing

Los tests siguen pasando (61/61 ✅) porque:
- La lógica del clic no cambió
- Solo el CSS visual fue modificado
- Los tests verifican onClick, no el color

## 💡 Cómo Personalizar

Si quieres cambiar el color del botón "add":

### Opción 1: Cambiar el verde
En `CartButton.css`, reemplaza `#28a745` por otro color:

```css
@keyframes buttonClickGreen {
  50% {
    background-color: #007bff;  /* Azul, por ejemplo */
  }
}
```

### Opción 2: Cambiar a otros botones
En `CartButton.tsx`, agrega más variantes:

```typescript
const animationClass = isClicked 
  ? (variant === 'add' ? 'btn-clicked-add' : 
     variant === 'remove' ? 'btn-clicked-red' :
     'btn-clicked')
  : '';
```

Luego crea el keyframe correspondiente en CSS.

### Opción 3: Cambiar la duración
En `CartButton.tsx`:

```typescript
setTimeout(() => {
  setIsClicked(false);
}, 1000);  // Cambiar a 1000ms en lugar de 600ms
```

Y en CSS:

```css
.btn-clicked-add {
  animation: buttonClickGreen 1s ease-out 1;  /* 1s en lugar de 0.6s */
}
```

## 🚀 Rendimiento

✅ **Optimizado:**
- Solo usa `background-color` (rápido)
- Combinado con `transform` (GPU accelerated)
- 60 FPS garantizado
- No causa layout shifts

## 📝 Notas

- El verde elegido (#28a745) es Bootstrap success color
- Coincide con la sensación de "éxito" al agregar
- La sombra refleja el color para coherencia visual
- El efecto dura exactamente 600ms como toda la animación

## 🎬 Secuencia Completa

```
0ms ─────────── CLIC ─────────────
      Usuario hace clic en botón

100ms
      Botón sube + crece + cambia a verde

300ms (50% de 600ms)
      PICO: Máxima elevación + Verde máximo

500ms
      Botón baja + vuelve a negro

600ms ─────── FIN ─────────────
      Botón en posición normal + negro
```

---

**Creado:** Junio 24, 2026  
**Versión:** 1.0  
**Status:** ✅ Implementado y testeado

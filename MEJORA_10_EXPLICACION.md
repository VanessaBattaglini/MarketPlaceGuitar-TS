# 🔧 Mejora 10: CI/CD y Quality Gates - Explicación en Español

## ¿Qué es la Mejora 10?

Es un sistema automático de **validación de código** que:
- ✅ Revisa tu código **ANTES** de confirmar cambios
- ✅ Revisa tu código **ANTES** de enviar a GitHub
- ✅ Revisa tu código automáticamente en GitHub

**Objetivo:** Evitar que código con errores llegue a producción.

---

## 🎯 ¿Para qué sirve?

Imagina que:
1. Escribes código con errores de sintaxis
2. Lo subes a GitHub
3. Todo el equipo lo descarga
4. La app no funciona en producción

**¡Con Mejora 10 esto no pasa!**

El código se valida automáticamente en 3 puntos:

```
Tu código
  ↓
[1] Pre-commit (antes de confirmar) ← AQUÍ
  ↓
Confirmado en local
  ↓
[2] Pre-push (antes de enviar a GitHub) ← AQUÍ
  ↓
Enviado a GitHub
  ↓
[3] GitHub Actions (validación en el servidor) ← AQUÍ
  ↓
Listo para producción ✅
```

---

## 🔍 Las 3 Capas de Validación

### CAPA 1: Pre-commit Hook (`.husky/pre-commit`)

**¿Cuándo se ejecuta?** Cuando haces: `git commit -m "..."`

**¿Qué valida?**
```bash
# 1. ESLint - Busca errores en el código
npm run lint

# 2. TypeScript - Busca errores de tipos
tsc --noEmit

# 3. Prettier - Formatea el código automáticamente
prettier --write
```

**Ejemplo:**
```bash
$ git commit -m "agregar botón"

# Se ejecuta automáticamente:
✓ ESLint: OK
✓ TypeScript: OK
✓ Prettier: OK
✓ Commit confirmado ✅
```

Si hay un error:
```bash
$ git commit -m "agregar botón"

# ESLint deteccionó un error:
❌ Error en src/Button.tsx línea 5
   Variable 'temp' no se usa

# El commit se BLOQUEA
# Debes arreglar el error y reintentar
```

---

### CAPA 2: Pre-push Hook (`.husky/pre-push`)

**¿Cuándo se ejecuta?** Cuando haces: `git push origin main`

**¿Qué valida?**
```bash
# 1. Construcción de la app
npm run build

# 2. Todos los tests
npm run test:run
```

**Ejemplo:**
```bash
$ git push origin main

# Se ejecuta automáticamente:
✓ Build: 124 módulos construidos
✓ Tests: 61/61 pasando
✓ Push enviado ✅
```

Si algo falla:
```bash
$ git push origin main

# Build falló:
❌ Error de compilación TypeScript
   Type 'string' no es compatible con 'number'

# El push se BLOQUEA
# Debes arreglar y reintentar
```

---

### CAPA 3: GitHub Actions (`.github/workflows/`)

**¿Cuándo se ejecuta?** Automáticamente cuando haces push a GitHub

**¿Qué valida?**

#### Workflow 1: test.yml
```bash
# 1. ESLint en toda la app
npm run lint

# 2. Todos los tests
npm run test:run -- --coverage

# 3. Sube reporte de cobertura
# (si está configurado Codecov)
```

#### Workflow 2: build.yml
```bash
# 1. TypeScript full check
tsc -b --noEmit

# 2. Build de producción
npm run build

# 3. Verifica tamaño del bundle
# (no debe ser > 500KB)
```

**¿Dónde veo los resultados?**
1. Ve a GitHub
2. Abre tu Pull Request
3. Baja hasta "Checks"
4. Ves el estado: ✅ PASSED o ❌ FAILED

---

## 📋 ¿Qué son los archivos creados?

### `.husky/` - Carpeta de Git Hooks

```
.husky/
├── pre-commit     ← Se ejecuta ANTES de hacer commit
└── pre-push       ← Se ejecuta ANTES de hacer push
```

**¿Qué hay dentro?**

#### pre-commit:
```bash
#!/bin/sh
# Pre-commit hook: Ejecuta linting en archivos modificados

echo "🔍 Revisando código..."

# Ejecuta eslint, typescript y prettier en los archivos que cambió
npx lint-staged

echo "✅ Validación completada!"
```

#### pre-push:
```bash
#!/bin/sh
# Pre-push hook: Ejecuta build y tests

echo "🧪 Compilando y testeando..."

# Compila la app
npm run build

# Ejecuta todos los tests
npm run test:run

echo "✅ ¡Listo para enviar!"
```

---

### `.github/workflows/` - Validación en GitHub

```
.github/workflows/
├── test.yml       ← Valida linting y tests
└── build.yml      ← Valida build y tamaño
```

**¿Qué hay dentro?**

#### test.yml:
```yaml
name: Tests on PR

# Se ejecuta cuando:
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Descarga el código
      - Instala Node.js 20
      - Descarga dependencias
      - Ejecuta ESLint
      - Ejecuta tests
      - Sube reporte de cobertura
```

#### build.yml:
```yaml
name: Build & Type Check

# Se ejecuta cuando:
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - Descarga el código
      - Instala Node.js 20
      - Descarga dependencias
      - TypeScript check
      - Vite build
      - Verifica tamaño del bundle
```

---

### `.github/QUALITY_GATES.md` - Documentación

Archivo que documenta:
- ¿Qué son los quality gates?
- ¿Cuáles son los estándares de calidad?
- ¿Cómo se configura GitHub?
- ¿Qué hacer si algo falla?

---

### `package.json` - Configuración de npm

Se agregó:
```json
{
  "scripts": {
    "prepare": "husky install"  // Instala Husky al clonar
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",        // Arregla errores de lint
      "tsc --noEmit"         // Verifica tipos
    ],
    "*.{js,jsx}": [
      "eslint --fix"
    ],
    "*.{json,css,md}": [
      "prettier --write"     // Formatea archivos
    ]
  }
}
```

---

## 🎬 Flujo Completo: Paso a Paso

### Escenario: Quieres agregar una nueva funcionalidad

#### PASO 1: Haces cambios en el código
```bash
# Editas un archivo
# Por ejemplo: src/Button.tsx
```

#### PASO 2: Confirmas cambios (Commit)
```bash
$ git add src/Button.tsx
$ git commit -m "feat: agregar botón nuevo"

# Se ejecuta automáticamente (pre-commit hook):
🔍 Revisando código...
  ✓ ESLint: sin errores
  ✓ TypeScript: sin errores
  ✓ Prettier: código formateado
✅ Validación completada!
[main 3a7f9e2] feat: agregar botón nuevo
 1 file changed, 20 insertions(+)
```

#### PASO 3: Envías cambios a GitHub (Push)
```bash
$ git push origin main

# Se ejecuta automáticamente (pre-push hook):
🧪 Compilando y testeando...
  ✓ Build: 124 módulos (760ms)
  ✓ Tests: 61/61 pasando
✅ ¡Listo para enviar!
Counting objects: 3, done.
Writing objects: 100% (3/3), 291 bytes | 0 bytes/s, done.
Total 3 (delta 2), reused 0 (delta 0)
To https://github.com/usuario/proyecto.git
   7b8108b..3a7f9e2  main -> main
```

#### PASO 4: GitHub valida automáticamente
```
En GitHub:
├─ Actions (arriba derecha)
│  ├─ test.yml → ✅ PASSED
│  └─ build.yml → ✅ PASSED
├─ Pull Request (si existe)
│  └─ All checks passed ✅
```

---

## ⚙️ ¿Cómo se Configura?

### Ya está configurado en el proyecto, pero si lo necesitas de nuevo:

#### 1. Instalar Husky
```bash
npm install --save-dev husky
npx husky install
```

#### 2. Crear pre-commit hook
```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

#### 3. Crear pre-push hook
```bash
npx husky add .husky/pre-push "npm run build && npm run test:run"
```

#### 4. Configurar lint-staged en package.json
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "tsc --noEmit"],
    "*.{js,jsx}": ["eslint --fix"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

#### 5. Crear workflows en .github/workflows/
```bash
mkdir -p .github/workflows
# Crear test.yml y build.yml
```

---

## 🚨 Si Algo Falla

### Caso 1: ESLint detecta errores

**Síntoma:**
```bash
$ git commit -m "agregar botón"
❌ ESLint error: Unused variable 'temp'
```

**Solución:**
```bash
# Arregla el error (quita la variable sin usar)
# Luego reintentar
$ git add .
$ git commit -m "agregar botón"  # Ahora sí funciona
```

### Caso 2: Tests fallan

**Síntoma:**
```bash
$ git push origin main
❌ Test failed: "Cart calculation incorrect"
```

**Solución:**
```bash
# Arregla el test localmente
$ npm run test:run -- --watch

# Corrige el código
$ git add .
$ git commit -m "fix: cart calculation"
$ git push origin main  # Ahora sí funciona
```

### Caso 3: Build falla

**Síntoma:**
```bash
$ git push origin main
❌ Build error: TypeScript error at line 5
   Type 'string' is not assignable to 'number'
```

**Solución:**
```bash
# Arregla el error de tipo
# Luego reintentar
$ npm run build  # Verifica localmente
$ git add .
$ git commit -m "fix: type error"
$ git push origin main  # Ahora sí funciona
```

---

## 🎯 Beneficios de la Mejora 10

| Beneficio | Explicación |
|-----------|-------------|
| **Previene errores** | No dejas subir código con errores |
| **Código limpio** | Formatea automáticamente |
| **Tests siempre OK** | No dejas pasar tests fallidos |
| **Team seguro** | Todos reciben código validado |
| **Confianza** | Sabes que lo que ves en main funciona |
| **Automatización** | Sin revisiones manuales repetitivas |
| **Documentación** | Todo está documentado en QUALITY_GATES.md |

---

## 📊 Comparativa: Antes vs Después

### ANTES (sin Mejora 10)
```
Escribes código
  ↓
Subes a GitHub sin validar
  ↓
El código puede tener errores
  ↓
Otros descargan código roto
  ↓
Producción se cae 😞
```

### DESPUÉS (con Mejora 10)
```
Escribes código
  ↓
Pre-commit valida ✅
  ↓
Pre-push valida ✅
  ↓
GitHub Actions valida ✅
  ↓
Solo código OK llega a main
  ↓
Producción siempre funciona 😊
```

---

## 🔗 Conexiones con Otras Mejoras

La Mejora 10 **depende de** y **funciona con**:

| Mejora | Conexión |
|--------|----------|
| **Mejora 5 (JSDoc)** | ESLint valida que haya documentación |
| **Mejora 6 (Config)** | Se valida la configuración en build |
| **Mejora 7 (Services)** | Tests validan los servicios |
| **Mejora 8 (Accessibility)** | ESLint valida ARIA labels |
| **Mejora 9 (Monitoring)** | Se valida que logger esté presente |
| **Mejora 10 (CI/CD)** | Todo se valida automáticamente ✅ |

---

## 📚 Documentación Relacionada

Lee estos archivos para más detalles:

1. **`.github/QUALITY_GATES.md`** - Estándares de calidad
2. **`Agent/06-CI-CD-Quality.md`** - Documentación técnica completa
3. **Archivos de hooks:**
   - `.husky/pre-commit`
   - `.husky/pre-push`
4. **Workflows:**
   - `.github/workflows/test.yml`
   - `.github/workflows/build.yml`

---

## ✅ Checklist: ¿Todo funciona?

- [x] Husky instalado: `ls -la .husky/`
- [x] Hooks creados: `cat .husky/pre-commit`
- [x] lint-staged en package.json: `grep "lint-staged" package.json`
- [x] Workflows en GitHub: `.github/workflows/test.yml` existe
- [x] Build sin errores: `npm run build` OK
- [x] Tests pasando: `npm run test:run` OK
- [x] ESLint OK: `npm run lint` OK

---

## 🎓 Resumen en Pocas Palabras

**Mejora 10 = Sistema automático de validación**

Hace 3 cosas:
1. **Pre-commit** → Valida ANTES de confirmar
2. **Pre-push** → Valida ANTES de enviar
3. **GitHub Actions** → Valida en el servidor

**Beneficio:** Código roto NUNCA llega a producción ✅

---

## 🆘 Preguntas Frecuentes

### P: ¿Por qué se demora al hacer commit?
**R:** Está ejecutando validaciones (eslint, tsc, prettier). Es normal. Toma segundos.

### P: ¿Puedo saltarme los hooks?
**R:** Sí, con `--no-verify`, pero NO lo hagas. Los hooks existen por una razón.

### P: ¿Qué pasa si falla un test?
**R:** No puedes hacer push. Debes arreglar el test localmente y reintentar.

### P: ¿Se ejecutan los workflows en local?
**R:** No, solo en GitHub cuando haces push.

### P: ¿Puedo modificar los hooks?
**R:** Sí, edita `.husky/pre-commit` o `.husky/pre-push` según necesites.

### P: ¿Qué es lint-staged?
**R:** Ejecuta linters/formatters SOLO en los archivos que modificaste (no en todo el proyecto).

---

**Mejora 10 Explicada ✅**

Ahora sabes qué es, cómo funciona, y por qué es importante.

¿Preguntas? Revisa `Agent/06-CI-CD-Quality.md` para detalles técnicos.

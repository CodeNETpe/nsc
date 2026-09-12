# AGENTS.md — Memoria del proyecto CodeNETpe/nsc

Reglas y contexto **permanente** para agentes que trabajen en este repositorio.
Deben aplicarse en **cada tarea**, sin excepción.

## 1. Tipo de proyecto
- Sitio web **estático**: solo HTML, CSS y JavaScript puro.
- **Sin** npm, `node_modules` ni proceso de build.
- Repositorio: `CodeNETpe/nsc`. Rama por defecto: `main`.

## 2. Estructura del repositorio
- `index.html` — página principal del sitio público.
- `css/` — hojas de estilo propias (`style.css`, `ecosistema.css`, `podcast.css`, etc.).
- `js/` — scripts propios.
- `assets/` — imágenes, vendors (AOS, Font Awesome) y otros recursos.
- `docentes/` — páginas auxiliares.
- No hay CI, workflows ni scripts de despliegue dentro del repositorio.

> Limitación: la exploración se centró en la sección "Ecosistema Digital" de `index.html` y su CSS; el inventario del resto del sitio puede ampliarse.

## 3. Comandos permitidos
- **No** ejecutar comandos de terminal (npm, node, etc.).
- **Excepción:** operaciones de **Git** (crear rama, commit, push, PR/merge vía API de GitHub).

## 4. Paleta de colores
- Azul marino: `#0a1628`, `#1a2a6c`
- Dorado: `#d4af37`, `#fbbf24`
- Blanco: `#ffffff`
- Gris: `#f1f5f9`

## 5. Estilo de diseño
- Minimalista, elegante, con abundante espacio en blanco.
- Usar el skill `frontend-design` para el diseño de UI cuando esté disponible.

## 6. Flujo de trabajo obligatorio (cada tarea)
1. Crear una rama descriptiva (`feature/nombre-del-cambio`). **Nunca trabajar en `main`.**
2. Editar los archivos necesarios (`.html`, `.css`, `.js` directamente).
3. Hacer commit con un mensaje descriptivo **en español**.
4. Hacer push de la rama a GitHub.
5. Crear un Pull Request hacia `main` usando la API de GitHub.
6. Fusionar el Pull Request en `main`.
7. Eliminar la rama feature después de fusionar.
8. Informar el hash del commit final en `main`.

Si algún paso falla: **detenerse y explicar el error exacto**.

## 7. Formato de entrega obligatorio
Cada tarea debe cerrar con tres secciones bien marcadas:
- **✅ Resumen** — qué se cambió (archivos y descripción breve) y hash del commit final en `main`.
- **📋 Comandos para actualizar el VPS** — bloque shell generado con el formato **exacto** de la sección 10, reemplazando todos los marcadores. Si solo se modificó documentación/configuración, escribir «No hay cambios que publicar en el VPS. Solo se actualizó documentación del agente.» y **no** entregar el bloque.
- **📊 Estado final** — PR fusionado en `main`, rama feature eliminada y lista de archivos del último commit.

## 8. Despliegue en el VPS
- Usuario de despliegue: `colegiocarmelinas` (no root).
- Clon git: `$HOME/repos/nsc`.
- Web root: `$HOME/htdocs/colegiocarmelinas.edu.pe`.
- Flujo: `git pull --ff-only origin main`, respaldo `.tar.gz` en `$HOME/backups/nsc/` y copia de archivos con `install` + verificación `cmp`.

## 9. Archivos publicables en el VPS
- **Nunca** incluir en el bloque "Comandos para actualizar el VPS" archivos de documentación o configuración del agente: `AGENTS.md`, `CLAUDE.md`, `README.md`, ni contenido de las carpetas `.opencode/`, `.agents/`, `.github/`.
- Incluir **solo archivos web reales**: `.html`, `.css`, `.js`, `.json`, `.png`, `.jpg`, `.svg`, `.webp`, `.ico`, `.woff`, `.woff2`.
- Si en la tarea solo se modificaron archivos de documentación/configuración, el entregable debe indicar exactamente: **No hay cambios que publicar en el VPS. Solo se actualizó documentación del agente.**

## 10. Formato exacto del bloque de comandos para el VPS
Usar **exactamente** este patrón, reemplazando todos los marcadores antes de entregarlo.

Marcadores:
- `ARCHIVO1 ARCHIVO2 ...` → archivos modificados (separados por espacio, sin comas). Incluir ruta completa si están en subcarpetas (ej. `css/style.css js/script.js index.html`).
- `HASH_COMMIT_FINAL` → hash completo del commit final en `main`.
- `DESCRIPCION_CORTA` → descripción breve en minúsculas con guiones (ej. `ecosistema-marcas`).
- `CADENA_VERIFICACION_1 CADENA_VERIFICACION_2` → cadenas únicas que deben aparecer en el HTML servido después del cambio (ej. `ecosistema-20260911-2 NotebookLM`).

```bash
(
  set -e
  trap 'echo "DETENIDO: comparte la salida antes de repetir comandos."' ERR
  R="$HOME/repos/nsc"
  WEB="$HOME/htdocs/colegiocarmelinas.edu.pe"

  if [ "$(id -un)" != "colegiocarmelinas" ]; then
    echo "Usa la terminal de colegiocarmelinas, no root."
    exit 1
  fi
  cd "$R"
  test "$(git rev-parse --show-toplevel)" = "$R"
  test "$(git branch --show-current)" = main
  test -z "$(git status --porcelain)"
  test "$(git remote get-url origin | tr '[:upper:]' '[:lower:]')" = "git@github.com:codenetpe/nsc.git"
  test "$(readlink -f "$WEB")" = "$WEB"
  test ! -L "$WEB/css" && test -w "$WEB/css" && test -w "$WEB"

  for F in ARCHIVO1 ARCHIVO2; do
    cmp -- "$R/$F" "$WEB/$F"
  done

  GIT_SSH_COMMAND="$(git config --local --get core.sshCommand)" git pull --ff-only origin main
  test "$(git rev-parse HEAD)" = "HASH_COMMIT_FINAL"

  B="$HOME/backups/nsc/antes-DESCRIPCION_CORTA-$(date +%Y%m%d-%H%M%S).tar.gz"
  (umask 077; mkdir -p "$HOME/backups/nsc"; tar -czf "$B" -C "$WEB" ARCHIVO1 ARCHIVO2)
  echo "RESPALDO: $B"

  T=""
  trap '[ -z "$T" ] || rm -f -- "$T"' EXIT
  for F in ARCHIVO1 ARCHIVO2; do
    T="$(mktemp "$(dirname "$WEB/$F")/.nsc-publicar-XXXXXX")"
    install -m 644 "$R/$F" "$T"
    mv -fT -- "$T" "$WEB/$F"
    T=""
    cmp -- "$R/$F" "$WEB/$F"
  done

  HTML="$(curl -fsSL --max-time 20 https://colegiocarmelinas.edu.pe/)"
  [[ "$HTML" == *CADENA_VERIFICACION_1* && "$HTML" == *CADENA_VERIFICACION_2* ]]

  echo "PUBLICADO: DESCRIPCION_CORTA"
  git log -1 --oneline
)
```

Reglas del formato:
1. **Nunca** incluir `AGENTS.md`, `CLAUDE.md`, `README.md` ni contenido de `.opencode/`, `.agents/`, `.github/`. Solo archivos web reales (ver sección 9).
2. **Cadenas de verificación:** elegir strings únicos presentes en el HTML servido **después** del cambio (cache-busting → cadena de versión; texto nuevo → palabra clave). Si el cambio **no** afecta a `index.html` (solo CSS/JS internos), **omitir** el bloque de `curl` y dejar solo `echo "PUBLICADO: ..."`.
3. **Idempotencia:** el `cmp` inicial debe fallar limpiamente en una segunda ejecución si los archivos ya están sincronizados.
4. **Solo documentación** → responder «No hay cambios que publicar en el VPS. Solo se actualizó documentación del agente.» y **no** entregar el bloque.
5. **Múltiples carpetas** → incluir la ruta completa en la lista `ARCHIVOS`.

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
- **📋 Comandos para actualizar el VPS** — bloque shell exacto con la lista de archivos modificados.
- **📊 Estado final** — PR fusionado en `main`, rama feature eliminada y lista de archivos del último commit.

## 8. Despliegue en el VPS
- Usuario de despliegue: `colegiocarmelinas` (no root).
- Clon git: `$HOME/repos/nsc`.
- Web root: `$HOME/htdocs/colegiocarmelinas.edu.pe`.
- Flujo: `git pull --ff-only origin main`, respaldo `.tar.gz` en `$HOME/backups/nsc/` y copia de archivos con `install` + verificación `cmp`.

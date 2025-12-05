# Turnos Futbol – Frontend

Interfaz de reservas con estética fintech construida sobre React + Vite. Incluye un sistema de diseño propio basado en Mantine, toasts nativos, microinteracciones y estado global con Zustand para soportar flujos de autenticación y gestión de turnos.

## Scripts

```bash
npm install      # instala dependencias
npm run dev      # entorno local con Vite
npm run build    # build optimizada
npm run preview  # sirve el build generado
```

## Stack principal

- React 19 + React Router 7
- Mantine Core / Modals / Notifications + Tabler Icons
- Zustand para sesión y datos de canchas
- Axios para consumir la API REST existente

## Decisiones de diseño

- **App shell**: Layout persistente con header blur, gradientes y contenedor centralizado (`src/components/layout/AppShellLayout.jsx`).
- **Navegación**: `Navbar` responsiva con drawer mobile, avatar contextual y acciones de sesión sincronizadas con `useSessionStore`.
- **Discovery UX**: `Inicio.jsx` incorpora hero, filtros dinámicos, tarjetas de canchas con badges + horarios y modal de reserva enriquecido (`ReservaForm.jsx`).
- **Flujos transaccionales**: Formularios de login/registro y consultas de reservas usan componentes Mantine, validaciones inline y toasts.
- **Admin dashboard**: Métricas, progreso y tabla de actividad reciente para preparar los futuros CRUDs.

La organización de estilos vive en `src/theme.js` (tokens tipográficos, paleta aurora/midnight/mint) y `src/styles/global.css` para el fondo, fuente y baseline visual.

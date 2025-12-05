# Picadito ⚽
Plataforma de gestión y reserva de canchas de fútbol en tiempo real.

Picadito surge como parte de mi día a día, buscando aplicar una arquitectura robusta para solucionar un problema cotidiano que tenemos todos los que jugamos al fútbol.

---

## 1. La Problemática

¿Alguna vez quisiste reservar una cancha y tuviste que mandar mensajes a 3 lugares distintos? Actualmente, la mayoría de los complejos deportivos siguen gestionando sus turnos con agenda de papel y WhatsApp.

**Para el jugador:**  
Es frustrante esperar a que el dueño te conteste si tiene lugar (a veces te clavan el visto y perdés el horario).

**Para el dueño:**  
Es un caos gestionar señas, cancelaciones y huecos libres manualmente mientras atienden el buffet.

Picadito elimina esa fricción: el jugador ve la disponibilidad en tiempo real, reserva y listo. El dueño puede seguir en tiempo real las reservas que hicieron a sus canchas mientras se encarga de otras tareas

---

## 2. Stack Tecnológico

### Frontend
- React + Vite  
  SPA rápida y flexible.
- Mantine UI  
  Componentes accesibles y consistentes.
- Zustand  
  Manejo de estado global simple y predecible.
- Axios  
  Cliente HTTP para la comunicación con el backend.
- React Toastify  
  Notificaciones claras y rápidas.

### Backend e Infraestructura
- Node.js + Express con TypeScript  
  Base robusta y tipada para servicios REST.
- Arquitectura por Capas  
  Separación clara de responsabilidades.
- SQLite  
  Persistencia ligera y confiable para el MVP.
- JWT  
  Autenticación basada en tokens.

---

## 3. Funcionalidades Clave

### Experiencia de Usuario
- Búsqueda de canchas con filtros por fecha y turno.
- Visualización en tiempo real del estado de cada reserva.
- Feedback inmediato mediante Toasts y Skeletons.
- Panel “Mis Reservas” con gestión completa del usuario.

### Seguridad y Gestión
- Registro y autenticación de usuarios.
- Roles diferenciados (Cliente / Administrador).
- Validación de disponibilidad en tiempo real para evitar doble reserva.

---

## 4. Sobre el Autor

Desarrollado por Fabrizzio Sana.  
Este proyecto refleja un enfoque orientado a diseño limpio, escalabilidad y una experiencia de usuario clara, combinando conocimientos de desarrollo Full Stack y arquitectura de software.

Todos los derechos reservados.
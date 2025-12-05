import { create } from "zustand";
import Cookies from "js-cookie"; // Necesitamos esto para leer el token

const USER_KEY = "turnos-user-data"; // Key para localStorage

export const useSessionStore = create((set, get) => ({
  user: null,
  token: null,
  hydrated: false,

  // 1. HYDRATE: Se ejecuta al cargar la app (F5)
  hydrate: () => {
    // Buscamos el token real en la cookie
    const token = Cookies.get("token");
    // Buscamos los datos del usuario en localStorage (para mostrar nombre, rol, etc)
    const storedUser = window.localStorage.getItem(USER_KEY);

    if (token && storedUser) {
      try {
        // Si ambos existen, restauramos la sesión
        set({ 
            user: JSON.parse(storedUser), 
            token: token, 
            hydrated: true 
        });
      } catch (error) {
        console.warn("Error al leer datos de usuario", error);
        // Si falla algo, limpiamos todo por seguridad
        get().logout();
      }
    } else {
      // Si falta el token (expiró) o el usuario, cerramos sesión
      get().logout();
    }
  },

  // 2. SET SESSION: Lo llama el Login.jsx
  setSession: ({ user, token }) => {
    if (user) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    // Nota: El Login.jsx ya seteó la cookie, pero actualizamos el estado interno
    set({ user, token, hydrated: true });
  },

  // 3. LOGOUT: Lo llama el Navbar.jsx
  logout: () => {
    Cookies.remove("token"); // Chau cookie
    window.localStorage.removeItem(USER_KEY); // Chau datos locales
    set({ user: null, token: null, hydrated: true });
  },

  // 4. ADMIN CHECK: Helper para rutas protegidas
  isAdmin: () => {
    const rol = get().user?.rol;
    // Validamos ambas formas por si el back manda "Admin" o "admin"
    return rol === "Admin" || rol === "admin";
  }
}));
import axios from "axios";
import Cookies from "js-cookie"; 

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json"
  }
});

// INTERCEPTOR: Antes de cada request, inyectamos el token si existe en la cookie
client.interceptors.request.use((config) => {
  const token = Cookies.get("token"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function request(method, url, data) {
  try {
    const response = await client({ method, url, data });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message ?? error.message;
    console.error(`clubApi error [${method.toUpperCase()} ${url}]:`, message);
    throw error;
  }
}

const clubApi = {
  canchas: {
    list: () => request("get", "/canchas"),
    get: (id) => request("get", `/canchas/${id}`),
    create: (payload) => request("post", "/canchas", payload),
    update: (id, payload) => request("put", `/canchas/${id}`, payload),
    remove: (id) => request("delete", `/canchas/${id}`),
    getTurnosDisponibles: (idCancha, fecha) => 
        request("get", `/canchas/${idCancha}/turnos-disponibles?fecha=${fecha}`)
  },
  turnos: {
    list: () => request("get", "/turnos"),
    listByCancha: (canchaId) => request("get", `/canchas/${canchaId}/turnos`),
    get: (id) => request("get", `/turnos/${id}`),
    create: (payload) => request("post", "/turnos", payload),
    update: (id, payload) => request("put", `/turnos/${id}`, payload),
    remove: (id) => request("delete", `/turnos/${id}`)
  },
  reservas: {
    list: () => request("get", "/reservas"),
    // NUEVO ENDPOINT: Listar reservas de un usuario específico
    listByUser: (userId) => request("get", `/reservas/turnos/${userId}`), 
    get: (id) => request("get", `/reservas/${id}`),
    create: (payload) => request("post", "/reservas", payload),
    update: (id, payload) => request("put", `/reservas/${id}`, payload),
    remove: (id) => request("delete", `/reservas/${id}`),
    cancel: (id) => request("delete", `/reservas/${id}`)
  },
  tiposCancha:{
    list: () => request("get", "/tipos-cancha"),
  },
  usuarios:{
    list: () => request("get", "/usuarios"),
    get: (id) => request("get", `/usuarios/${id}`),
    create: (payload) => request("post", "/usuarios", payload),
    update: (id, payload) => request("put", `/usuarios/${id}`, payload),
    remove: (id) => request("delete", `/usuarios/${id}`)
  },
  auth: {
    login: (email, password) => request("post", "/auth/login", { email, password }),
    register: (payload) => request("post", "/usuarios", payload) 
  },
  payments:{
    createPreference: (payload) => request("post", "/payments/crear", payload),
  }
};

export default clubApi;
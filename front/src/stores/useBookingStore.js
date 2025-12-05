import { create } from "zustand";
import clubApi from "../services/clubApi";
import { normalizeCanchaRecord } from "../utils/canchaUtils";

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
};

export const useBookingStore = create((set, get) => ({
  canchas: [],
  turnosByCancha: {},
  loading: false,
  error: null,
  selectedTurno: null,
  async fetchCanchas(force = false) {
    if (get().loading && !force) return;
    set({ loading: true, error: null });
    try {
      const rawCanchas = await clubApi.canchas.list();
      const canchas = toArray(rawCanchas).map((cancha) => normalizeCanchaRecord(cancha));
      const turnosEntries = await Promise.all(
        canchas.map(async (cancha) => {
          try {
            const rawTurnos = await clubApi.turnos.listByCancha(cancha.id);
            return [cancha.id, toArray(rawTurnos)];
          } catch (turnoError) {
            if (turnoError?.response?.status !== 404) {
              console.error(`Error al cargar turnos de la cancha ${cancha.id}`, turnoError);
            }
            return [cancha.id, []];
          }
        })
      );
      set({
        canchas,
        turnosByCancha: Object.fromEntries(turnosEntries),
        loading: false
      });
    } catch (error) {
      console.error("Error al cargar canchas", error);
      set({ error: "No pudimos cargar las canchas", loading: false });
    }
  },
  setSelectedTurno: (turno) => set({ selectedTurno: turno }),
  clearSelectedTurno: () => set({ selectedTurno: null }),
  removeTurnoFromCache: (turnoId) => {
    const { turnosByCancha } = get();
    const next = Object.fromEntries(
      Object.entries(turnosByCancha).map(([key, turnos]) => [
        key,
        (turnos || []).filter((turno) => turno.id !== turnoId)
      ])
    );
    set({ turnosByCancha: next });
  }
}));

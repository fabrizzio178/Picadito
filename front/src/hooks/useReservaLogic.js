import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import clubApi from '../services/clubApi';

export function useReservaLogic({ opened, initialDate, initialCanchaId, reservaToEdit }) {
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  const [canchas, setCanchas] = useState([]);
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  
  const isInitializing = useRef(false);

  const getFormattedDate = (date) => date ? dayjs(date).format("YYYY-MM-DD") : "";

  // Helper to load canchas
  const loadCanchas = async () => {
    try {
      const dataCanchas = await clubApi.canchas.list();
      const listaCanchas = Array.isArray(dataCanchas) ? dataCanchas : dataCanchas.data || [];
      return listaCanchas.map(c => ({ 
          value: String(c.id), 
          label: c.nombre,
          precio: c.precio 
      }));
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar datos iniciales");
      return [];
    }
  };

  // Helper to load turnos
  const loadTurnos = async (canchaId, dateStr, currentTurnoId) => {
    try {
        setLoadingTurnos(true);
        const data = await clubApi.canchas.getTurnosDisponibles(canchaId, dateStr);
        const lista = Array.isArray(data) ? data : data.data || [];
        
        const opciones = lista.map(t => ({
            value: String(t.id),
            label: `${(t.horaInicio||"").trim()} - ${(t.horaFin||"").trim()}`
        }));

        // If editing, ensure the current turno is in the list
        if (currentTurnoId) {
             const existe = opciones.find(op => op.value === currentTurnoId);
             if (!existe && reservaToEdit?.turno) {
                 const labelTurno = `${(reservaToEdit.turno.horaInicio||"").trim()} - ${(reservaToEdit.turno.horaFin||"").trim()}`;
                 opciones.push({ value: currentTurnoId, label: `${labelTurno} (Actual)` });
                 opciones.sort((a, b) => parseInt(a.value) - parseInt(b.value));
             }
        }
        return opciones;
    } catch (error) {
        console.error("Error buscando turnos", error);
        return [];
    } finally {
        setLoadingTurnos(false);
    }
  };

  return {
    loadingTurnos,
    canchas,
    setCanchas,
    turnosDisponibles,
    setTurnosDisponibles,
    loadCanchas,
    loadTurnos,
    getFormattedDate
  };
}

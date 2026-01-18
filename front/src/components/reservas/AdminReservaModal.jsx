import { useEffect, useState, useMemo, useRef } from "react";
import {
  Modal,
  Button,
  Stack,
  Select,
  Group,
  Text,
  LoadingOverlay
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { 
  IconClock, 
  IconSoccerField, 
  IconRefresh,
  IconCheck,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import clubApi from "../../services/clubApi";
import { useSessionStore } from "../../stores/useSessionStore";
import { useReservaLogic } from "../../hooks/useReservaLogic";
import ResponsiveDatePicker from "../ui/ResponsiveDatePicker"; // <-- NEW IMPORT

export default function AdminReservaModal({ 
    opened, 
    onClose, 
    onSuccess, 
    reservaToEdit = null,
    initialCanchaId = null, 
    initialDate = new Date() 
}) {
  const [loading, setLoading] = useState(false);
  const { 
      loadingTurnos, 
      canchas, 
      setCanchas, 
      turnosDisponibles, 
      setTurnosDisponibles, 
      loadCanchas, 
      loadTurnos, 
      getFormattedDate 
  } = useReservaLogic({ opened, initialDate, initialCanchaId, reservaToEdit });
  
  const isInitializing = useRef(false);
  const user = useSessionStore((state) => state.user);

  const form = useForm({
    initialValues: {
      fechaReserva: new Date(),
      idCancha: null,
      idTurno: null,
      idEstado: "2", 
      idUsuario: null // Para seleccionar usuario manualmente si se desea (futuro)
    },
    validate: {
      fechaReserva: (value) => (value ? null : "Fecha obligatoria"),
      idCancha: (value) => (value ? null : "Seleccioná una cancha"),
      idTurno: (value) => (value ? null : "Seleccioná un horario"),
      idEstado: (value) => (value ? null : "El estado es requerido"),
    },
  });

  const formFecha = form.values.fechaReserva;
  const formCancha = form.values.idCancha;
  const dateString = useMemo(() => getFormattedDate(formFecha), [formFecha, getFormattedDate]);

  // 1. Limpieza al cerrar
  useEffect(() => {
    if (!opened) {
       form.reset();
       setTurnosDisponibles([]);
       isInitializing.current = false;
    }
  }, [opened]);

  // 2. Carga Inicial
  useEffect(() => {
    if (opened) {
      const init = async () => {
        isInitializing.current = true;
        const loadedCanchas = await loadCanchas();
        setCanchas(loadedCanchas);

        let fechaInit = initialDate || new Date();
        let canchaInit = initialCanchaId ? String(initialCanchaId) : null;
        let turnoInit = null;
        let estadoInit = "2"; 
        
        if (reservaToEdit) {
            fechaInit = dayjs(reservaToEdit.fechaReserva).add(12, 'hours').toDate();
            canchaInit = String(reservaToEdit.idCancha);
            turnoInit = String(reservaToEdit.idTurno);
            estadoInit = String(reservaToEdit.idEstado);
        }

        form.setValues({
            fechaReserva: fechaInit,
            idCancha: canchaInit,
            idTurno: turnoInit,
            idEstado: estadoInit
        });

        if (canchaInit) {
             const fechaStr = getFormattedDate(fechaInit);
             const loadedTurnos = await loadTurnos(canchaInit, fechaStr, turnoInit);
             setTurnosDisponibles(loadedTurnos);
        }
        
        setTimeout(() => { isInitializing.current = false; }, 100);
      };
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, reservaToEdit, initialCanchaId]); 

  // 3. Buscador Reactivo
  useEffect(() => {
    if (!opened || isInitializing.current) return;
    if (!dateString || !formCancha) {
        setTurnosDisponibles([]);
        return;
    }

    const fetchTurnos = async () => {
        if (form.values.idTurno !== null) {
            form.setFieldValue('idTurno', null);
        }
        const loadedTurnos = await loadTurnos(formCancha, dateString, null);
        setTurnosDisponibles(loadedTurnos);
    };

    fetchTurnos();
  }, [dateString, formCancha, opened]); 

  const handleSubmit = async (values) => {
    if (!values.idTurno) {
        form.setFieldError('idTurno', 'Seleccioná un horario');
        return;
    }
    
    setLoading(true);
    
    try {
      const payload = {
        fechaReserva: dayjs(values.fechaReserva).format("YYYY-MM-DD"),
        idCancha: Number(values.idCancha),
        idUsuario: user?.id || 1, // Admin toma la reserva
        idEstado: Number(values.idEstado), 
        idTurno: Number(values.idTurno)
      };

      if (reservaToEdit) {
         await clubApi.reservas.update(reservaToEdit.id, payload);
         toast.success("Reserva actualizada", { position: "bottom-right", theme: "colored" });
      } else {
         await clubApi.reservas.create(payload);
         toast.success("Reserva creada correctamente", { position: "bottom-right", theme: "colored" });
      }
      
      onSuccess?.(); 
      onClose();

    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || "Error al procesar la reserva.";
      toast.error(msg, { position: "top-center", theme: "colored" });
    } finally {
        setLoading(false); 
    }
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={<Text fw={700} fz="lg">{reservaToEdit ? "Editar Reserva (Admin)" : "Nueva Reserva Manual"}</Text>}
      radius="xl"
      padding="xl"
      size="md"
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "xl", blur: 2 }} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <ResponsiveDatePicker
            label="¿Cuándo juegan?"
            placeholder="Seleccioná fecha"
            minDate={new Date()}
            {...form.getInputProps("fechaReserva")}
            onChange={(date) => form.setFieldValue("fechaReserva", date)}
            popperClassName="admin-datepicker-popper"
          />
          <style>{`
            .admin-datepicker-popper .react-datepicker__navigation {
                width: 24px !important;
                height: 24px !important;
                top: 8px !important;
            }
            .admin-datepicker-popper .react-datepicker__navigation-icon::before {
                width: 8px !important;
                height: 8px !important;
                border-width: 2px 2px 0 0 !important;
                top: 6px !important;
                border-color: #333 !important;
            }
            .admin-datepicker-popper {
                z-index: 2100 !important;
            }
          `}</style>
          <Select
            label="Cancha"
            placeholder="Seleccioná cancha"
            data={canchas}
            leftSection={<IconSoccerField size={18} />}
            radius="md"
            searchable
            nothingFoundMessage="No hay canchas disponibles"
            {...form.getInputProps("idCancha")}
          />
          <Select
            label="Horario"
            placeholder={!formCancha ? "Primero elegí una cancha" : loadingTurnos ? "Buscando horarios..." : "Seleccioná horario"}
            data={turnosDisponibles}
            disabled={!formCancha || loadingTurnos || !dateString}
            leftSection={loadingTurnos ? <IconRefresh size={18} className="mantine-rotate" /> : <IconClock size={18} />}
            radius="md"
            searchable
            nothingFoundMessage={formCancha ? "No hay turnos libres" : "..."}
            {...form.getInputProps("idTurno")}
          />
          
          <Select
            label="Estado"
            data={[
              { value: "3", label: "Confirmada (Verde)" },
              { value: "2", label: "En Seña (Amarillo)" },
              // { value: "4", label: "Cancelada (Libera Cupo)" }, <-- ELIMINADO
            ]}
            radius="md"
            {...form.getInputProps("idEstado")}
          />



          <Group justify="flex-end" mt="lg">
            <Button variant="subtle" color="red" radius="xl" onClick={onClose}>Cancelar</Button>
            <Button 
                type="submit" 
                color="turf" 
                radius="xl" 
                loading={loading} 
                disabled={!form.values.idTurno || loadingTurnos}
                rightSection={<IconCheck size={20}/>}
            >
              {reservaToEdit ? "Guardar Cambios" : "Crear Reserva"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

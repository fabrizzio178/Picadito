import { useEffect, useState, useMemo, useRef } from "react";
import {
  Modal,
  Button,
  Stack,
  Select,
  Group,
  Text,
  LoadingOverlay,
  Alert
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { 
  IconCalendar, 
  IconClock, 
  IconSoccerField, 
  IconInfoCircle,
  IconRefresh,
  IconCreditCard,
  IconCheck // Agregué el check para el admin
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import clubApi from "../../services/clubApi";
import { useSessionStore } from "../../stores/useSessionStore";

export default function ReservaModal({ 
    opened, 
    onClose, 
    onSuccess, 
    reservaToEdit = null,
    initialCanchaId = null, 
    initialDate = new Date() 
}) {
  const [loading, setLoading] = useState(false);
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  const [canchas, setCanchas] = useState([]);
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  
  const isInitializing = useRef(false);
  const user = useSessionStore((state) => state.user);

  const isAdmin = user?.rol === 'Admin' || user?.rol === 'admin';

  const form = useForm({
    initialValues: {
      fechaReserva: new Date(),
      idCancha: null,
      idTurno: null,
      idEstado: "2", 
    },
    validate: {
      fechaReserva: (value) => (value ? null : "Fecha obligatoria"),
      idCancha: (value) => (value ? null : "Seleccioná una cancha"),
      idTurno: (value) => (value ? null : "Seleccioná un horario"),
      idEstado: (value) => (value ? null : "El estado es requerido"),
    },
  });

  const getFormattedDate = (date) => date ? dayjs(date).format("YYYY-MM-DD") : "";

  // 1. Limpieza al cerrar
  useEffect(() => {
    if (!opened) {
       form.reset();
       setTurnosDisponibles([]);
       setLoadingTurnos(false);
       isInitializing.current = false;
    }
  }, [opened]);

  // 2. Carga Inicial
  useEffect(() => {
    if (opened) {
      const init = async () => {
        try {
          isInitializing.current = true; 
          setLoadingTurnos(true);

          const dataCanchas = await clubApi.canchas.list();
          const listaCanchas = Array.isArray(dataCanchas) ? dataCanchas : dataCanchas.data || [];
          
          setCanchas(listaCanchas.map(c => ({ 
              value: String(c.id), 
              label: c.nombre,
              precio: c.precio 
          })));

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

          if (canchaInit) {
             const fechaStr = getFormattedDate(fechaInit);
             const dataTurnos = await clubApi.canchas.getTurnosDisponibles(canchaInit, fechaStr);
             const listaTurnos = Array.isArray(dataTurnos) ? dataTurnos : dataTurnos.data || [];
             
             let opciones = listaTurnos.map(t => ({
               value: String(t.id),
               label: `${(t.horaInicio||"").trim()} - ${(t.horaFin||"").trim()}`
             }));

             if (reservaToEdit && turnoInit) {
                const existe = opciones.find(op => op.value === turnoInit);
                if (!existe && reservaToEdit.turno) {
                    const labelTurno = `${(reservaToEdit.turno.horaInicio||"").trim()} - ${(reservaToEdit.turno.horaFin||"").trim()}`;
                    opciones.push({ value: turnoInit, label: `${labelTurno} (Actual)` });
                    opciones.sort((a, b) => parseInt(a.value) - parseInt(b.value));
                }
             }
             setTurnosDisponibles(opciones);
          }

          form.setValues({
              fechaReserva: fechaInit,
              idCancha: canchaInit,
              idTurno: turnoInit,
              idEstado: estadoInit
          });

        } catch (error) {
          console.error(error);
          toast.error("Error al cargar datos iniciales");
        } finally {
          setLoadingTurnos(false);
          setTimeout(() => { isInitializing.current = false; }, 100);
        }
      };
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, reservaToEdit, initialCanchaId]); 

  const formFecha = form.values.fechaReserva;
  const formCancha = form.values.idCancha;
  const dateString = useMemo(() => getFormattedDate(formFecha), [formFecha]);

  // 3. Buscador Reactivo
  useEffect(() => {
    if (!opened || isInitializing.current) return;
    if (!dateString || !formCancha) {
        setTurnosDisponibles([]);
        return;
    }

    let isCancelled = false;

    const fetchTurnos = async () => {
        setLoadingTurnos(true);
        if (form.values.idTurno !== null) {
            form.setFieldValue('idTurno', null);
        }

        try {
            const data = await clubApi.canchas.getTurnosDisponibles(formCancha, dateString);
            const lista = Array.isArray(data) ? data : data.data || [];
            
            if (!isCancelled) {
                const opciones = lista.map(t => ({
                    value: String(t.id),
                    label: `${(t.horaInicio||"").trim()} - ${(t.horaFin||"").trim()}`
                }));
                setTurnosDisponibles(opciones);
            }
        } catch (error) {
            console.error("Error buscando turnos", error);
        } finally {
            if (!isCancelled) setLoadingTurnos(false);
        }
    };

    fetchTurnos();
    return () => { isCancelled = true; };
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
        // CORRECCIÓN CLAVE: Si es admin, usamos SU id para que no viaje null.
        // Después podés mejorar esto, pero para que ande YA, usá el del admin.
        idUsuario: user?.id || 1, 
        idEstado: reservaToEdit ? Number(values.idEstado) : 2, 
        idTurno: Number(values.idTurno)
      };

      // 1. EDICIÓN
      if (reservaToEdit) {
         await clubApi.reservas.update(reservaToEdit.id, payload);
         toast.success("Reserva actualizada", { position: "bottom-right", theme: "colored" });
         onSuccess?.(); 
         onClose();
         return; 
      } 
      
      // 2. CREACIÓN
      const response = await clubApi.reservas.create(payload);
      const reservaCreada = response.data || response; 
      
      // --- CAMINO ADMIN (SIMPLE) ---
      if (isAdmin) {
          toast.success("Reserva creada manualmente.", { position: "bottom-right", theme: "colored" });
          onSuccess?.(); // Recargar tabla
          onClose(); // Cerrar modal
          return; // FIN, no vamos a pago
      }

      // --- CAMINO CLIENTE (CON PAGO) ---
      toast.success("Reserva iniciada. Redirigiendo a MercadoPago...", { position: "top-center" });

      const canchaSeleccionada = canchas.find(c => String(c.value) === String(values.idCancha));
      const precioTotal = canchaSeleccionada?.precio || 63000; 

      const paymentPayload = {
          reservaId: reservaCreada.id, 
          totalAmount: precioTotal
      };

      const preference = await clubApi.payments.createPreference(paymentPayload);

      if (preference.initPoint) {
          setTimeout(() => {
              window.location.href = preference.initPoint;
          }, 1500);
      } else {
          throw new Error("No se recibió el link de pago");
      }

    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || "Error al procesar la reserva.";
      toast.error(msg, { position: "top-center", theme: "colored" });
      setLoading(false); 
    }
  };

  const isPreSelectedMode = !!initialCanchaId && !reservaToEdit;
  const isStatusDisabled = !reservaToEdit && !isAdmin;

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={<Text fw={700} fz="lg">{reservaToEdit ? "Editar Reserva" : "Nueva Reserva"}</Text>}
      radius="xl"
      padding="xl"
      size="md"
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "xl", blur: 2 }} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <DatePickerInput
            label="1. ¿Cuándo juegan?"
            placeholder="Seleccioná fecha"
            leftSection={<IconCalendar size={18} />}
            radius="md"
            minDate={new Date()}
            locale="es"
            valueFormat="DD [de] MMMM YYYY"
            allowDeselect={false}
            popoverProps={{ withinPortal: true, zIndex: 10000 }} 
            {...form.getInputProps("fechaReserva")}
          />
          <Select
            label="2. ¿En qué cancha?"
            placeholder="Seleccioná cancha"
            data={canchas}
            leftSection={<IconSoccerField size={18} />}
            radius="md"
            searchable
            nothingFoundMessage="No hay canchas disponibles"
            {...form.getInputProps("idCancha")}
            disabled={isPreSelectedMode}
          />
          <Select
            label="3. Horarios disponibles"
            placeholder={!formCancha ? "Primero elegí una cancha" : loadingTurnos ? "Buscando horarios..." : "Seleccioná horario"}
            data={turnosDisponibles}
            disabled={!formCancha || loadingTurnos || !dateString}
            leftSection={loadingTurnos ? <IconRefresh size={18} className="mantine-rotate" /> : <IconClock size={18} />}
            radius="md"
            searchable
            nothingFoundMessage={formCancha ? "No hay turnos libres" : "..."}
            {...form.getInputProps("idTurno")}
          />
          
          {!loadingTurnos && formCancha && dateString && turnosDisponibles.length === 0 && (
              <Alert variant="light" color="orange" title="Sin cupos" icon={<IconInfoCircle />}>
                  No quedan turnos disponibles para esta fecha.
              </Alert>
          )}

          <Select
            label="Estado"
            data={[
              { value: "3", label: "Confirmada (Pagada)" },
              { value: "2", label: "En Seña (Pendiente)" },
            ]}
            radius="md"
            {...form.getInputProps("idEstado")}
            disabled={isStatusDisabled}
          />

          {/* MENSAJE DE PAGO SOLO PARA CLIENTES */}
          {!reservaToEdit && !isAdmin && (
             <Alert variant="light" color="blue" radius="md" icon={<IconInfoCircle/>}>
                Al confirmar serás redirigido a MercadoPago para abonar la seña (10%).
             </Alert>
          )}

          <Group justify="flex-end" mt="lg">
            <Button variant="subtle" color="red" radius="xl" onClick={onClose}>Cancelar</Button>
            <Button 
                type="submit" 
                color="turf" 
                radius="xl" 
                loading={loading} 
                disabled={!form.values.idTurno || loadingTurnos}
                // Si es Admin, mostramos Check. Si es cliente, tarjeta.
                rightSection={
                    !reservaToEdit 
                    ? (isAdmin ? <IconCheck size={20}/> : <IconCreditCard size={20}/>) 
                    : null
                }
            >
              {reservaToEdit ? "Guardar Cambios" : (isAdmin ? "Crear Reserva" : "Pagar y Reservar")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
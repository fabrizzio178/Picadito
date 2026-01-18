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
// import { DatePickerInput } from "@mantine/dates"; // <-- REMOVED
import { useForm } from "@mantine/form";
import { 
  IconClock, 
  IconSoccerField, 
  IconRefresh,
  IconCreditCard,
  IconInfoCircle
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import clubApi from "../../services/clubApi";
import { useSessionStore } from "../../stores/useSessionStore";
import { useReservaLogic } from "../../hooks/useReservaLogic";
import ResponsiveDatePicker from "../ui/ResponsiveDatePicker"; // <-- NEW IMPORT

export default function ClientReservaModal({ 
    opened, 
    onClose, 
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
  } = useReservaLogic({ opened, initialDate, initialCanchaId });
  
  const isInitializing = useRef(false);
  const user = useSessionStore((state) => state.user);

  const form = useForm({
    initialValues: {
      fechaReserva: new Date(),
      idCancha: null,
      idTurno: null,
    },
    validate: {
      fechaReserva: (value) => (value ? null : "Fecha obligatoria"),
      idCancha: (value) => (value ? null : "Seleccioná una cancha"),
      idTurno: (value) => (value ? null : "Seleccioná un horario"),
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
        
        form.setValues({
            fechaReserva: fechaInit,
            idCancha: canchaInit,
            idTurno: null
        });

        if (canchaInit) {
             const fechaStr = getFormattedDate(fechaInit);
             const loadedTurnos = await loadTurnos(canchaInit, fechaStr, null);
             setTurnosDisponibles(loadedTurnos);
        }
        
        setTimeout(() => { isInitializing.current = false; }, 100);
      };
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialCanchaId]); 

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
        idUsuario: user?.id, 
        idEstado: 2, // Seña por defecto
        idTurno: Number(values.idTurno)
      };

      // 2. CREACIÓN
      const response = await clubApi.reservas.create(payload);
      const reservaCreada = response.data || response; 

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

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={<Text fw={700} fz="lg">Confirmá tu turno</Text>}
      radius="xl"
      padding="xl"
      size="md"
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "xl", blur: 2 }} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
            <Alert variant="light" color="blue" radius="md" icon={<IconInfoCircle/>}>
                Al confirmar serás redirigido a MercadoPago para abonar la seña (10%).
            </Alert>

          <ResponsiveDatePicker
            label="¿Cuándo juegan?"
            placeholder="Seleccioná fecha"
            minDate={new Date()}
            {...form.getInputProps("fechaReserva")}
            // react-datepicker devuelve fecha directa, mantine form lo maneja
            onChange={(date) => form.setFieldValue("fechaReserva", date)}
          />

          <Select
            label="¿En qué cancha?"
            placeholder="Seleccioná cancha"
            data={canchas}
            leftSection={<IconSoccerField size={18} />}
            radius="md"
            searchable
            nothingFoundMessage="No hay canchas disponibles"
            {...form.getInputProps("idCancha")}
          />
          <Select
            label="Horarios disponibles"
            placeholder={!formCancha ? "Primero elegí una cancha" : loadingTurnos ? "Buscando horarios..." : "Seleccioná horario"}
            data={turnosDisponibles}
            disabled={!formCancha || loadingTurnos || !dateString}
            leftSection={loadingTurnos ? <IconRefresh size={18} className="mantine-rotate" /> : <IconClock size={18} />}
            radius="md"
            searchable
            nothingFoundMessage={formCancha ? "No hay turnos libres" : "..."}
            {...form.getInputProps("idTurno")}
          />

          <Group justify="flex-end" mt="lg">
            <Button variant="subtle" color="gray" radius="xl" onClick={onClose}>Cancelar</Button>
            <Button 
                type="submit" 
                color="turf" 
                radius="xl" 
                loading={loading} 
                disabled={!form.values.idTurno || loadingTurnos}
                rightSection={<IconCreditCard size={20}/>}
            >
              Pagar y Reservar
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

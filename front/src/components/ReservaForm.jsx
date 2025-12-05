import { useEffect, useState } from "react";
import { Box, Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCircleCheck, IconCircleX, IconClockHour4, IconSoccerField } from "@tabler/icons-react";
import { crearReserva, verificarTurnoOcupado } from "../services/reservaService";
import { useBookingStore } from "../stores/useBookingStore";

export default function ReservaForm({ opened, onClose, turno }) {
  const [form, setForm] = useState({ nombre: "", mail: "", telefono: "" });
  const [loading, setLoading] = useState(false);
  const removeTurnoFromCache = useBookingStore((state) => state.removeTurnoFromCache);

  useEffect(() => {
    if (!opened) {
      setForm({ nombre: "", mail: "", telefono: "" });
      setLoading(false);
    }
  }, [opened]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.currentTarget.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!turno) return;
    setLoading(true);

    try {
      const ocupado = await verificarTurnoOcupado(turno.id);
      if (ocupado) {
        notifications.show({
          title: "Turno ocupado",
          message: "Lo sentimos, alguien tomó ese horario segundos antes.",
          color: "yellow",
          icon: <IconClockHour4 size={18} />
        });
        onClose();
        return;
      }

      await crearReserva({
        cliente: { ...form },
        turnoId: turno.id,
        estado: "confirmada"
      });

      removeTurnoFromCache(turno.id);
      notifications.show({
        title: "Reserva confirmada",
        message: `Reservamos ${turno.fecha} ${turno.hora} para vos`,
        color: "mint",
        icon: <IconCircleCheck size={18} />
      });
      onClose();
    } catch (error) {
      console.error("Error al crear la reserva", error);
      notifications.show({
        title: "No pudimos reservar",
        message: "Revisá los datos e intentá nuevamente",
        color: "red",
        icon: <IconCircleX size={18} />
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      radius="xl"
      title="Confirmá tu turno"
      centered
      styles={{
        title: { fontWeight: 700, color: "var(--mantine-color-turf-8)" },
        content: { backgroundColor: "#fdfefb" }
      }}
    >
      {turno ? (
        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            <Group
              align="flex-start"
              justify="space-between"
              gap={{ base: "md", md: "xl" }}
              wrap="wrap"
            >
              <Stack gap={4} w={{ base: "100%", md: "auto" }}>
                <Text c="dimmed" fz="sm">
                  Último paso para que la pelota empiece a rodar
                </Text>
                <Group gap="md" wrap="wrap">
                  <InfoPill label="Cancha" value={turno.cancha?.nombre} />
                  <InfoPill label="Fecha" value={turno.fecha} />
                  <InfoPill label="Horario" value={turno.hora} />
                </Group>
              </Stack>
              <MiniPitchNote />
            </Group>

            <TextInput
              label="Nombre y apellido"
              placeholder="Nombre del capitán"
              required
              value={form.nombre}
              onChange={handleChange("nombre")}
            />
            <TextInput
              label="Correo electrónico"
              placeholder="nombre@club.com"
              type="email"
              required
              value={form.mail}
              onChange={handleChange("mail")}
            />
            <TextInput
              label="Teléfono de contacto"
              placeholder="11 2222 3333"
              required
              value={form.telefono}
              onChange={handleChange("telefono")}
            />

            <Group justify="flex-end" mt="md" gap="sm" wrap="wrap">
              <Button variant="subtle" onClick={onClose} disabled={loading} w={{ base: "100%", sm: "auto" }}>
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={loading}
                radius="xl"
                color="turf"
                w={{ base: "100%", sm: "auto" }}
              >
                Confirmar reserva
              </Button>
            </Group>
          </Stack>
        </form>
      ) : (
        <Text c="dimmed">Elegí un turno disponible para continuar.</Text>
      )}
    </Modal>
  );
}

function InfoPill({ label, value }) {
  return (
    <Stack gap={0}>
      <Text fz={12} c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text fw={600}>{value || "-"}</Text>
    </Stack>
  );
}

function MiniPitchNote() {
  return (
    <Stack
      gap={4}
      align="center"
      w={{ base: "100%", sm: "auto" }}
      style={{ maxWidth: 240, marginLeft: "auto" }}
    >
      <Box
        style={{
          width: 120,
          height: 80,
          borderRadius: "18px",
          border: "2px solid rgba(31,162,58,0.4)",
          background: "linear-gradient(150deg, #1fa23a, #0f7c2a)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Box
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.2) 3px, transparent 3px, transparent 20px)"
          }}
        />
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.9)",
            transform: "translate(-50%, -50%)"
          }}
        />
      </Box>
      <Group gap={4}>
        <IconSoccerField size={16} color="#1b8032" />
        <Text fz="xs" c="dimmed">
          Compartimos la dirección exacta antes del partido
        </Text>
      </Group>
    </Stack>
  );
}

import { Badge, Box, Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconClockHour4 } from "@tabler/icons-react";
import { getTipoDisplay, getUbicacionLabel } from "../utils/canchaUtils";

export default function CanchaCard({ cancha, turnos = [], onReservar }) {
  const upcoming = turnos.slice(0, 4);
  const tipoRaw = cancha?.tipoLabel ?? cancha?.tipo;
  const tipoDisplay = getTipoDisplay(tipoRaw);
  const tipoTag = tipoDisplay
    ? tipoDisplay.toLowerCase().includes("jugador")
      ? tipoDisplay
      : `${tipoDisplay} jugadores`
    : "Formato";
  const ubicacionDisplay = getUbicacionLabel(cancha?.ubicacionLabel ?? cancha?.ubicacion);

  return (
    <Card
      radius="xl"
      p="lg"
      withBorder
      style={{
        borderColor: "rgba(23,128,50,0.2)",
        background: "linear-gradient(120deg, rgba(255,255,255,0.95), rgba(232, 250, 236, 0.9))",
        boxShadow: "0 24px 45px rgba(19, 85, 36, 0.12)",
        transition: "transform 200ms ease, box-shadow 200ms ease"
      }}
    >
      <Group
        align="flex-start"
        justify="space-between"
        gap={{ base: "md", md: "xl" }}
        wrap="wrap"
      >
        <Stack gap={6} flex={1}>
          <Group gap="xs">
            <Text fz={24} fw={700} c="turf.8">
              {cancha.nombre}
            </Text>
            <Badge color="turf" variant="light" radius="md">
              {tipoTag}
            </Badge>
          </Group>
          <Text fz="sm" c="dimmed">
            {ubicacionDisplay || "Te compartimos la dirección exacta al confirmar"}
          </Text>
        </Stack>
        <MiniPitch />
      </Group>

      <Stack gap="sm" mt="lg">
        {upcoming.length === 0 && <Text c="dimmed">Sin turnos abiertos en este momento.</Text>}

        {upcoming.map((turno) => (
          <Group
            key={turno.id}
            justify="space-between"
            px="md"
            py="sm"
            style={{
              borderRadius: "18px",
              border: "1px solid rgba(0,0,0,0.06)",
              background: "rgba(31,162,58,0.05)"
            }}
          >
            <Group gap="sm">
              <Box
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #dff7e3, #b9efc2)",
                  display: "grid",
                  placeItems: "center"
                }}
              >
                <IconClockHour4 size={20} color="#1b8032" />
              </Box>
              <Stack gap={0}>
                <Text fw={600}>{turno.fecha}</Text>
                <Text fz="sm" c="dimmed">
                  {turno.hora}
                </Text>
              </Stack>
            </Group>
            <Button radius="xl" color="turf" variant="light" onClick={() => onReservar(turno)}>
              Reservar
            </Button>
          </Group>
        ))}

        {turnos.length > upcoming.length && (
          <Text fz="sm" c="dimmed">
            +{turnos.length - upcoming.length} horarios más
          </Text>
        )}
      </Stack>
    </Card>
  );
}

function MiniPitch() {
  return (
    <Box
      style={{
        width: 140,
        height: 110,
        borderRadius: "24px",
        border: "2px solid rgba(31,162,58,0.4)",
        background: "linear-gradient(165deg, #4ad45a 0%, #0f7c2a 100%)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 18px 30px rgba(19, 85, 36, 0.35)",
        animation: "turfPulse 12s ease-in-out infinite",
        flexShrink: 0,
        marginTop: 6
      }}
    >
      <Lines />
      <Box
        style={{
          position: "absolute",
          inset: "18% 15%",
          border: "2px solid rgba(255,255,255,0.8)",
          borderRadius: "18px"
        }}
      />
      <Box
        style={{
          position: "absolute",
          inset: "65% 30%",
          border: "2px solid rgba(255,255,255,0.8)",
          borderRadius: "16px"
        }}
      />
      <Box
        style={{
          position: "absolute",
          inset: "15% 30%",
          border: "2px solid rgba(255,255,255,0.8)",
          borderRadius: "16px"
        }}
      />
      <Box
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.9)",
          transform: "translate(-50%, -50%)"
        }}
      />
    </Box>
  );
}

function Lines() {
  return (
    <Box
      style={{
        position: "absolute",
        inset: 0,
        background:
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.15) 4px, transparent 4px, transparent 24px)"
      }}
    />
  );
}

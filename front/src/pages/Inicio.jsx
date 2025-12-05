import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core";
import { IconBallFootball, IconRefresh, IconSearch, IconSoccerField } from "@tabler/icons-react";
import { useBookingStore } from "../stores/useBookingStore";
import CanchaCard from "../components/CanchaCard";
import ReservaForm from "../components/ReservaForm";

export default function Inicio() {
  const [query, setQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");
  const canchas = useBookingStore((state) => state.canchas);
  const turnosByCancha = useBookingStore((state) => state.turnosByCancha);
  const loading = useBookingStore((state) => state.loading);
  const fetchCanchas = useBookingStore((state) => state.fetchCanchas);
  const setSelectedTurno = useBookingStore((state) => state.setSelectedTurno);
  const selectedTurno = useBookingStore((state) => state.selectedTurno);
  const clearSelectedTurno = useBookingStore((state) => state.clearSelectedTurno);

  useEffect(() => {
    fetchCanchas();
  }, [fetchCanchas]);

  const uniqueSizes = useMemo(() => {
    const tipos = new Set(canchas.map((cancha) => cancha.tipo));
    return ["all", ...tipos];
  }, [canchas]);

  const metrics = useMemo(() => {
    const totalTurnos = Object.values(turnosByCancha).reduce(
      (acc, turnos) => acc + (turnos?.length || 0),
      0
    );
    const theoreticalCapacity = Math.max(1, canchas.length * 12);
    const occupancy = Math.min(100, Math.round((totalTurnos / theoreticalCapacity) * 100));
    return {
      totalCanchas: canchas.length,
      totalTurnos,
      occupancy
    };
  }, [canchas.length, turnosByCancha]);

  const filteredCanchas = useMemo(() => {
    return canchas.filter((cancha) => {
      const matchesQuery =
        cancha.nombre.toLowerCase().includes(query.toLowerCase()) ||
        cancha.ubicacion.toLowerCase().includes(query.toLowerCase());
      const matchesSize = sizeFilter === "all" || cancha.tipo === sizeFilter;
      return matchesQuery && matchesSize;
    });
  }, [canchas, query, sizeFilter]);

  const handleReservar = (turno, cancha) => {
    setSelectedTurno({ ...turno, cancha });
  };

  return (
    <Stack gap="xl">
      <SimpleGrid
        cols={{ base: 1, md: 2 }}
        spacing={{ base: "lg", lg: "xl" }}
        verticalSpacing={{ base: "xl", lg: "xl" }}
      >
        <Stack gap="md" flex={1} miw={0}>
          <Badge color="white" variant="light" radius="md" maw={220}>
            Turno libre = partido asegurado
          </Badge>
          <Title order={1} c="turf.8">
            Organizá tu próxima juntada en una sola pantalla
          </Title>
          <Text c="dimmed" maw={520}>
            Descubrí canchas disponibles, elegí horario y confirmá al toque. Sin vueltas, sin llamadas, sin esperas.
          </Text>
          <Group gap="md" wrap="wrap">
            <TextInput
              placeholder="Buscar por nombre"
              leftSection={<IconSearch size={16} />}
              size="md"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              w={{ base: "100%", sm: 360 }}
              radius="xl"
            />
            <Group gap="xs" wrap="wrap" w={{ base: "100%", lg: "auto" }}>
              {uniqueSizes.map((size) => (
                <Button
                  key={size}
                  variant={sizeFilter === size ? "filled" : "light"}
                  size="sm"
                  radius="xl"
                  color={sizeFilter === size ? "turf" : "gray"}
                  onClick={() => setSizeFilter(size)}
                >
                  {size === "all" ? "Todas" : `${size} jugadores`}
                </Button>
              ))}
            </Group>
            <Button
              variant="subtle"
              leftSection={<IconRefresh size={16} />}
              onClick={() => fetchCanchas(true)}
              color="turf"
              w={{ base: "100%", sm: "auto" }}
            >
              Refrescar listado
            </Button>
          </Group>
        </Stack>
        <PitchPreview />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={{ base: "md", md: "lg" }}>
        <StatCard label="Canchas activas" value={metrics.totalCanchas} icon={<IconSoccerField size={18} />} />
        <StatCard label="Turnos hoy" value={metrics.totalTurnos} icon={<IconBallFootball size={18} />} />
        <StatCard label="Equipos confirmados" value={`${metrics.occupancy}%`} icon={<IconBallFootball size={18} />} suffix="del día" />
      </SimpleGrid>

      <Stack gap="lg">
        {loading &&
          Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} height={220} radius="xl" opacity={0.4} animate />
          ))}

        {!loading && filteredCanchas.length === 0 && (
          <Card radius="xl" p="xl" withBorder ta="center">
            <Stack gap="xs" align="center">
              <IconSoccerField size={48} color="#1fa23a" />
              <Title order={3}>No encontramos canchas con esos filtros</Title>
              <Text c="dimmed">Probá otro horario o cambiá la cantidad de jugadores.</Text>
            </Stack>
          </Card>
        )}

        {filteredCanchas.map((cancha) => (
          <CanchaCard
            key={cancha.id}
            cancha={cancha}
            turnos={turnosByCancha[cancha.id] || []}
            onReservar={(turno) => handleReservar(turno, cancha)}
          />
        ))}
      </Stack>

      <ReservaForm opened={Boolean(selectedTurno)} turno={selectedTurno} onClose={clearSelectedTurno} />
    </Stack>
  );
}

function StatCard({ label, value, icon, suffix }) {
  return (
    <Card
      radius="xl"
      p="lg"
      withBorder
      style={{
        borderColor: "rgba(31,162,58,0.2)",
        background: "linear-gradient(135deg, rgba(243, 251, 239, 0.95), rgba(211, 242, 216, 0.8))"
      }}
    >
      <Stack gap={6}>
        <Group gap={6}>
          {icon}
          <Text fz="xs" tt="uppercase" c="dimmed" fw={600}>
            {label}
          </Text>
        </Group>
        <Text fz={32} fw={700} c="turf.8">
          {value}
        </Text>
        {suffix && (
          <Text fz="sm" c="dimmed">
            {suffix}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

function PitchPreview() {
  return (
    <Card
      className="pitch-preview-card"
      radius="xl"
      p="lg"
      withBorder
      style={{
        width: "100%",
        maxWidth: 360,
        flex: "1 1 280px",
        background: "linear-gradient(150deg, #37c65b 0%, #1b8032 100%)",
        boxShadow: "0 28px 55px rgba(13, 83, 33, 0.35)",
        animation: "turfPulse 10s ease-in-out infinite"
      }}
    >
      <Stack gap="sm" align="center">
        <Text fw={600} c="white">
          Cancha destacada de hoy
        </Text>
        <Box
          style={{
            width: "100%",
            aspectRatio: "4 / 5",
            borderRadius: "24px",
            border: "2px solid rgba(255,255,255,0.7)",
            position: "relative",
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.12) 6px, transparent 6px, transparent 40px)",
            overflow: "hidden"
          }}
        >
          <Box
            style={{
              position: "absolute",
              inset: "18% 20%",
              border: "2px solid rgba(255,255,255,0.8)",
              borderRadius: "18px"
            }}
          />
          <Box
            style={{
              position: "absolute",
              inset: "45% 5%",
              height: 2,
              background: "rgba(255,255,255,0.9)"
            }}
          />
          <Box
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 70,
              height: 70,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.8)",
              transform: "translate(-50%, -50%)"
            }}
          />
        </Box>
        <Text c="white" fz="sm" ta="center">
          Mostramos una cancha destacada y te compartimos la dirección exacta al confirmar el turno.
        </Text>
      </Stack>
    </Card>
  );
}

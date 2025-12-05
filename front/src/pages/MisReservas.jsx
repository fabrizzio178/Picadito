import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify"; // <--- IMPORTAMOS TOASTIFY
import {
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Center,
  ThemeIcon,
  Container,
  Grid,
  Divider,
  Skeleton,
  Box
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { 
  IconTrash, 
  IconCalendarEvent, 
  IconClock, 
  IconMapPin, 
  IconInfoCircle, 
  IconSoccerField,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import clubApi from "../services/clubApi";
import { useSessionStore } from "../stores/useSessionStore";

// Configuración de fecha en español
dayjs.locale("es");

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSessionStore((state) => state.user);

  useEffect(() => {
    if (user?.id) {
      fetchMisReservas();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMisReservas = async () => {
    setLoading(true);
    try {
      const data = await clubApi.reservas.listByUser(user.id);
      const lista = Array.isArray(data) ? data : [];
      lista.sort((a, b) => new Date(b.fechaReserva) - new Date(a.fechaReserva));
      setReservas(lista);
    } catch (error) {
      console.error("Error al cargar", error);
      // Usamos toastify para el error de carga también
      toast.error("No pudimos cargar tus partidos. Intentá recargar la página.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    // Mantenemos el MODAL de Mantine porque te gustó la UX
    modals.openConfirmModal({
      title: <Text fw={700}>Cancelar reserva</Text>,
      centered: true,
      children: (
        <Text size="sm" c="dimmed">
          ¿Seguro que querés cancelar? Esta acción liberará el turno inmediatamente para otros jugadores.
        </Text>
      ),
      labels: { confirm: "Sí, cancelar turno", cancel: "No, volver" },
      confirmProps: { color: "red", variant: "filled" },
      cancelProps: { variant: "subtle" },
      onConfirm: async () => {
        try {
          await clubApi.reservas.cancel(id);
          setReservas((prev) => prev.filter((r) => r.id !== id));
          
          // --- AQUÍ ESTÁ LA MAGIA DE TOASTIFY ---
          toast.success("Reserva cancelada correctamente", {
            position: "bottom-right", // O donde prefieras
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });

        } catch (error) {
          console.error("Error al cancelar", error);
          toast.error("Ocurrió un error al intentar cancelar. Intentá más tarde.");
        }
      }
    });
  };

  // Helper para colores según estado
  const getStatusColor = (estado) => {
    const e = estado?.toLowerCase() || "";
    if (e.includes("confirm") || e.includes("pagada")) return "green"; 
    if (e.includes("seña") || e.includes("pendiente")) return "yellow";
    if (e.includes("cancel")) return "red";
    return "gray";
  };

  if (!user) {
    return (
      <Center h={400}>
        <Stack align="center">
          <ThemeIcon size={80} radius="100%" color="gray.2">
            <IconInfoCircle size={40} color="gray" />
          </ThemeIcon>
          <Title order={3} c="dark.8">Iniciá sesión</Title>
          <Text c="dimmed" ta="center" maw={300}>
            Para ver tu agenda de partidos necesitas ingresar a tu cuenta.
          </Text>
          <Button component={Link} to="/login" variant="filled" color="turf" mt="md" radius="xl" size="md">
            Ir al Login
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Container size="xl" pb="xl" pt="sm">
      <Stack gap="xl">
        {/* Cabecera */}
        <Group justify="space-between" align="end">
          <Stack gap={0}>
            <Title order={2} c="turf.9">Mis reservas</Title>
            <Text c="dimmed">Administrá tus próximos partidos.</Text>
          </Stack>
        </Group>

        {loading ? (
          /* SKELETON LOADING */
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 3 }} order={{ base: 2, md: 1 }}>
               <Skeleton height={200} radius="xl" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 9 }} order={{ base: 1, md: 2 }}>
               <SimpleGrid cols={{ base: 1, xl: 2 }}>
                  <Skeleton height={160} radius="xl" mb="md" />
                  <Skeleton height={160} radius="xl" mb="md" />
                  <Skeleton height={160} radius="xl" mb="md" />
               </SimpleGrid>
            </Grid.Col>
          </Grid>
        ) : reservas.length === 0 ? (
          /* Estado Vacío */
          <Card radius="xl" p={50} withBorder ta="center" bg="gray.0" style={{ borderStyle: 'dashed', borderColor: '#dee2e6' }}>
            <Stack align="center" gap="lg">
              <ThemeIcon size={80} radius="100%" color="gray.1">
                 <IconCalendarEvent size={40} color="#adb5bd" />
              </ThemeIcon>
              <div>
                  <Text fw={800} size="xl" c="dark.7">Sin partidos programados</Text>
                  <Text c="dimmed">Tu agenda está libre. ¿Qué tal un partido hoy?</Text>
              </div>
              <Button component={Link} to="/" color="turf" radius="xl" size="md" leftSection={<IconSoccerField size={20}/>}>
                Buscar Cancha
              </Button>
            </Stack>
          </Card>
        ) : (
          /* Grilla con contenido */
          <Grid gutter="xl">
            
            {/* COLUMNA LATERAL (CTA) */}
            <Grid.Col span={{ base: 12, md: 4, lg: 3 }} order={{ base: 2, md: 1 }}>
              <Card 
                radius="xl" 
                p="lg" 
                withBorder 
                bg="turf.0" 
                style={{ borderColor: 'var(--mantine-color-turf-2)' }}
              >
                <Stack gap="md" align="start">
                  <Group>
                    <ThemeIcon size={42} radius="md" color="turf" variant="light">
                      <IconSoccerField size={24} />
                    </ThemeIcon>
                    <Text fw={700} c="turf.9">Nueva Reserva</Text>
                  </Group>
                  <Text c="turf.8" size="sm" lh={1.5}>
                    ¿Te quedaste con ganas de más? Buscá horario para la revancha ahora mismo.
                  </Text>
                  <Button component={Link} to="/" fullWidth color="turf" radius="xl">
                    Reservar cancha
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
            
            {/* LISTA DE RESERVAS */}
            <Grid.Col span={{ base: 12, md: 8, lg: 9 }} order={{ base: 1, md: 2 }}>
              <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
                {reservas.map((reserva) => {
                  const estadoColor = getStatusColor(reserva.estado?.nombre);
                  
                  return (
                    <Card 
                      key={reserva.id} 
                      radius="lg" 
                      p="lg" 
                      withBorder 
                      shadow="sm"
                      style={{ 
                        borderLeft: `6px solid var(--mantine-color-${estadoColor}-filled)`,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Stack gap="md">
                        {/* Header: Cancha y Estado */}
                        <Group justify="space-between" align="start" wrap="nowrap">
                          <Box>
                            <Text fw={800} size="lg" lineClamp={1} c="dark.8" title={reserva.cancha?.nombre}>
                              {reserva.cancha?.nombre || "Cancha sin nombre"}
                            </Text>
                            <Group gap={6} c="dimmed" mt={2}>
                               <IconMapPin size={14} style={{ marginTop: -2 }} />
                               <Text size="xs" fw={500} lineClamp={1}>
                                 {reserva.cancha?.ubicacion || "Ubicación central"}
                               </Text>
                            </Group>
                          </Box>
                          <Badge color={estadoColor} variant="light" radius="sm" size="md">
                            {reserva.estado?.nombre || "Estado"}
                          </Badge>
                        </Group>

                        {/* Info Principal: Fecha y Hora */}
                        <Card withBorder radius="md" p="sm" bg="gray.0" style={{ border: 'none', backgroundColor: '#f8f9fa' }}>
                            <Group justify="space-between" grow>
                                <Group gap="xs">
                                    <ThemeIcon variant="white" size="md" radius="md" c={estadoColor}>
                                        <IconCalendarEvent size={20} />
                                    </ThemeIcon>
                                    <Box>
                                      <Text size="xs" c="dimmed" lh={1}>FECHA</Text>
                                      <Text size="sm" fw={700} c="dark.8">
                                          {dayjs(reserva.fechaReserva).format("ddd DD/MM")}
                                      </Text>
                                    </Box>
                                </Group>
                                
                                <Divider orientation="vertical" />
                                
                                <Group gap="xs" justify="flex-end">
                                    <Box style={{ textAlign: 'right' }}>
                                      <Text size="xs" c="dimmed" lh={1}>HORARIO</Text>
                                      <Text size="sm" fw={700} c="dark.8">
                                          {reserva.turno?.horaInicio ? reserva.turno.horaInicio.slice(0,5) : "--:--"} hs
                                      </Text>
                                    </Box>
                                    <ThemeIcon variant="white" size="md" radius="md" c={estadoColor}>
                                        <IconClock size={20} />
                                    </ThemeIcon>
                                </Group>
                            </Group>
                        </Card>

                        {/* Footer: Acciones */}
                        <Group justify="flex-end" pt={4}>
                          <Button
                            color="red"
                            variant="subtle"
                            size="xs"
                            radius="xl"
                            leftSection={<IconTrash size={14} />}
                            onClick={() => handleDelete(reserva.id)}
                            disabled={estadoColor === 'red'}
                          >
                            Cancelar turno
                          </Button>
                        </Group>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Grid.Col>
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
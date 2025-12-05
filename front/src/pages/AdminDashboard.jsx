import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
  Box,
  ActionIcon
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { modals } from "@mantine/modals"; // <--- IMPORTAMOS MODALS
import {
  IconRefresh,
  IconSoccerField,
  IconUsersGroup,
  IconTrophy,
  IconLayoutDashboard,
  IconCalendar,
  IconEdit,
  IconTrash,
  IconAlertTriangle // Ya no lo usamos en toast, pero puede servir para el modal
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "dayjs/locale/es";

import CanchaManager from "../components/admin/CanchaManager";
import ReservaModal from "../components/admin/ReservaModal";
import clubApi from "../services/clubApi";

dayjs.locale("es");

// --- HELPERS (Iguales) ---
const toPlainText = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object") {
    const candidate = value.nombre ?? value.label ?? value.descripcion ?? value.title ?? value.text ?? value.value ?? value.codigo ?? value.slug ?? value.id;
    if (candidate !== undefined && candidate !== null) return toPlainText(candidate, fallback);
  }
  return fallback;
};

const slugify = (value) =>
  toPlainText(value).normalize("NFD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").toLowerCase();

const ensureArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
};

const normalizeReservaRecord = (record = {}) => {
  const estadoLabel = toPlainText(record.estado?.nombre, "Disponible");
  const estadoValue = slugify(estadoLabel);
  
  const clienteNombre = toPlainText(record.usuario?.nombre, "Sin nombre");
  const clienteTelefono = toPlainText(record.usuario?.telefono, "-"); 

  const canchaNombre = toPlainText(record.cancha?.nombre, "-");
  const fecha = toPlainText(record.fechaReserva, record.turno?.fecha || "-");
  const hora = record.turno ? `${record.turno.horaInicio} - ${record.turno.horaFin}` : "-";

  return {
    ...record,
    estadoLabel,
    estadoValue,
    fechaRaw: fecha,
    cliente: { nombre: clienteNombre, telefono: clienteTelefono }, 
    raw: record, 
    turno: { fecha, hora, cancha: { nombre: canchaNombre } }
  };
};

// --- COMPONENTE PRINCIPAL ---

export default function AdminDashboard() {
  const [reservas, setReservas] = useState([]);
  const [cantidadCanchas, setCanchas] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [editingReserva, setEditingReserva] = useState(null);
  const [reservaModalOpen, setReservaModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("admin-dashboard-tab") || "resumen";
  });

  const [fechaFiltro, setFechaFiltro] = useState(new Date());
  const isMobile = useMediaQuery("(max-width: 48em)");

  const handleTabChange = (val) => {
    setActiveTab(val);
    localStorage.setItem("admin-dashboard-tab", val);
  };

  const loadReservas = async () => {
    setLoading(true);
    try {
      const data = await clubApi.reservas.list();
      setReservas(ensureArray(data).map(normalizeReservaRecord));
    } catch (error) {
      console.error("Error al cargar reservas", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCanchas = async () => {
    setLoading(true);
    try {
      const data = await clubApi.canchas.list();
      setCanchas(ensureArray(data).length);
    } catch (error) {
      console.error("Error al cargar canchas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservas();
    loadCanchas();
  }, []);

  useEffect(() => {
    if (activeTab === 'resumen') {
        loadReservas();
    }
  }, [activeTab]);

  // --- LÓGICA DE BORRADO ACTUALIZADA ---
  const confirmDeleteReserva = (id) => {
    modals.openConfirmModal({
      title: <Text fw={700}>Eliminar reserva</Text>,
      centered: true,
      children: (
        <Text size="sm" c="dimmed">
          ¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer y liberará el turno.
        </Text>
      ),
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
      confirmProps: { color: "red", variant: "filled" },
      cancelProps: { variant: "subtle" },
      onConfirm: async () => {
        try {
            await clubApi.reservas.remove(id);
            toast.success("Reserva eliminada correctamente", { position: "bottom-right", theme: "colored" });
            loadReservas();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar reserva");
        }
      }
    });
  };

  const handleEditReserva = (reserva) => {
      setEditingReserva(reserva.raw); 
      setReservaModalOpen(true);
  };

  const reservasDelDia = useMemo(() => {
    if (!fechaFiltro) return reservas;
    const fechaSeleccionadaStr = dayjs(fechaFiltro).format("YYYY-MM-DD");
    return reservas.filter((r) => {
      const fechaReserva = dayjs(r.fechaRaw);
      return fechaReserva.isValid() && fechaReserva.format("YYYY-MM-DD") === fechaSeleccionadaStr;
    });
  }, [reservas, fechaFiltro]);

  const metrics = useMemo(() => {
    const total = reservasDelDia.length;
    const totalTurnosDia = cantidadCanchas * 5;
    const confirmadas = reservasDelDia.filter(r => r.estadoValue.includes("reserv")).length;
    const canceladas = reservasDelDia.filter(r => r.estadoValue.includes("cancel")).length;
    const pendientes = reservasDelDia.filter(r => r.estadoValue.includes("sena") || r.estadoValue.includes("seña")).length;
    const ocupacion = totalTurnosDia === 0 ? 0 : Math.round((confirmadas / totalTurnosDia) * 100);
    const disponible = Math.max(0, totalTurnosDia - (confirmadas + pendientes));

    return { total, confirmadas, canceladas, pendientes, ocupacion, disponible };
  }, [reservasDelDia, cantidadCanchas]);

  return (
    <Box pb="xl">
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        radius="xl"
        variant="pills"
        mt={{ base: 0, md: -30 }}
      >
        <Tabs.List style={{ flexWrap: 'wrap' }}>
          <Tabs.Tab value="resumen" leftSection={<IconLayoutDashboard size={18} />}>
            Tablero
          </Tabs.Tab>
          <Tabs.Tab value="canchas" leftSection={<IconSoccerField size={18} />}>
            Canchas
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="resumen" pt="sm">
          <Stack gap="xl">
            <Stack gap="md" align="stretch">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={2} fz={{ base: 20, sm: 26 }}>Tablero del club</Title>
                  <Text c="dimmed" fz="sm">Gestión diaria de turnos.</Text>
                </div>
              </Group>
              <Group align="center" gap="sm" style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-end' }}>
                <DatePickerInput
                  leftSection={<IconCalendar size={16} stroke={1.5} />}
                  placeholder="Fecha"
                  value={fechaFiltro}
                  onChange={setFechaFiltro}
                  minDate={new Date()}
                  locale="es"
                  valueFormat="DD [de] MMMM"
                  size={isMobile ? "xs" : "sm"}
                  type="default"
                  radius="md"
                  w={isMobile ? "100%" : 220}
                  clearable={false}
                  popoverProps={{ shadow: "xl", position: "bottom-start", withinPortal: true }}
                />
                <Button variant="light" size="sm" leftSection={<IconRefresh size={16} />} loading={loading} onClick={loadReservas} style={{ height: isMobile ? 30 : 36 }} fullWidth={isMobile}>
                  Actualizar
                </Button>
              </Group>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
              <MetricCard label="Reservas del día" value={metrics.total} icon={<IconUsersGroup size={20} />} />
              <MetricCard label="Confirmadas" value={metrics.confirmadas} accent="green" />
              <MetricCard label="Pendientes" value={metrics.pendientes} accent="yellow" />
              <MetricCard label="Turnos Libres" value={metrics.disponible} accent="blue" />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
              <PitchLoadCard ocupacion={metrics.ocupacion} />
              <KeyInsightsCard metrics={metrics} />
            </SimpleGrid>

            <Card radius="xl" p={{ base: "md", sm: "xl" }} withBorder>
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <IconSoccerField size={24} />
                  <div>
                    <Text fw={600} fz={{ base: "sm", sm: "md" }}>Agenda del {dayjs(fechaFiltro).format("DD/MM")}</Text>
                    <Text fz="xs" c="dimmed">Turnos visualizados</Text>
                  </div>
                </Group>
                <Badge color="mint" variant="light">{reservasDelDia.length}</Badge>
              </Group>
              
              <Box style={{ overflowX: 'auto', width: '100%' }}> 
                <Table 
                    verticalSpacing="sm" 
                    highlightOnHover 
                    striped 
                    layout={isMobile ? "auto" : "fixed"}
                    style={{ minWidth: isMobile ? 600 : '100%' }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: '25%' }}>Cliente</Table.Th>
                      <Table.Th style={{ width: '20%' }}>Teléfono</Table.Th>
                      <Table.Th style={{ width: '20%' }}>Cancha</Table.Th>
                      <Table.Th style={{ width: '20%' }}>Horario</Table.Th>
                      <Table.Th style={{ width: '20%' }}>Estado</Table.Th>
                      <Table.Th style={{ width: '15%', textAlign: 'center' }}>Acciones</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {reservasDelDia.length === 0 && (
                      <Table.Tr>
                        <Table.Td colSpan={6}><Text c="dimmed" ta="center" py="xl">Sin reservas hoy.</Text></Table.Td>
                      </Table.Tr>
                    )}
                    {reservasDelDia.map((reserva) => (
                      <Table.Tr key={reserva.id}>
                        <Table.Td><Text fz="sm" fw={500} truncate>{reserva.cliente?.nombre || "Sin nombre"}</Text></Table.Td>
                        
                        <Table.Td><Text fz="sm" truncate>{reserva.cliente?.telefono || "-"}</Text></Table.Td>
                        
                        <Table.Td><Text fz="sm" truncate>{reserva.turno?.cancha?.nombre || "-"}</Text></Table.Td>
                        <Table.Td>{reserva.turno?.hora || "-"}</Table.Td>
                        <Table.Td>
                          <Badge color={badgeColorByState(reserva.estadoValue)} radius="lg" variant="light" size="sm">
                            {reserva.estadoLabel}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                            <Group gap="xs" justify="center" wrap="nowrap">
                                <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => handleEditReserva(reserva)}>
                                    <IconEdit size={18} />
                                </ActionIcon>
                                {/* Usamos la nueva función confirmDeleteReserva */}
                                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => confirmDeleteReserva(reserva.id)}>
                                    <IconTrash size={18} />
                                </ActionIcon>
                            </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Box>
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="canchas" pt="xl">
          <CanchaManager onRedirectToTablero={() => handleTabChange('resumen')} />
        </Tabs.Panel>
      </Tabs>

      <ReservaModal 
        opened={reservaModalOpen}
        onClose={() => {
            setReservaModalOpen(false);
            setEditingReserva(null); 
        }}
        reservaToEdit={editingReserva}
        onSuccess={() => {
            loadReservas();
        }}
      />
    </Box>
  );
}

// ... Sub-componentes (iguales) ...
function MetricCard({ label, value, icon, accent = "mint" }) {
  return (
    <Card radius="xl" p="lg" withBorder>
      <Stack gap={6}>
        <Group gap="xs">
          {icon}
          <Text fz="xs" tt="uppercase" c="dimmed" fw={600}>{label}</Text>
        </Group>
        <Text fw={700} fz={32}>{value}</Text>
        <Progress value={100} size="xs" color={accent} radius="xl" />
      </Stack>
    </Card>
  );
}

function PitchLoadCard({ ocupacion }) {
  const disponible = Math.max(0, 100 - ocupacion);
  const pitchStyle = { position: "relative", width: "100%", height: 140, borderRadius: 20, border: "1px solid rgba(26,104,66,0.25)", background: "linear-gradient(100deg, #d3f7d0 0%, #b8f0ba 45%, #e3fbe0 100%)", overflow: "hidden" };
  const midLineStyle = { position: "absolute", top: 0, left: "50%", width: 2, height: "100%", background: "rgba(26,104,66,0.4)", transform: "translateX(-50%)" };
  const centerCircleStyle = { position: "absolute", top: "50%", left: "50%", width: 70, height: 70, borderRadius: "50%", border: "1px solid rgba(26,104,66,0.4)", transform: "translate(-50%, -50%)" };
  const boxStyle = (side) => ({ position: "absolute", [side]: 10, top: 25, width: 40, height: 90, border: "1px solid rgba(26,104,66,0.4)", borderRadius: side === "left" ? "16px 0 0 16px" : "0 16px 16px 0" });

  return (
    <Card radius="xl" p="lg" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <div><Text fz="sm" c="dimmed">Pulso del césped</Text><Text fw={600}>Uso del día de hoy</Text></div>
          <Badge color="mint" radius="xl">{ocupacion}%</Badge>
        </Group>
        <div style={pitchStyle} aria-hidden="true"><div style={midLineStyle} /><div style={centerCircleStyle} /><div style={boxStyle("left")} /><div style={boxStyle("right")} /></div>
        <Group justify="space-between" gap="lg">
          <Stack gap={0}><Text fz="sm" c="dimmed">Ocupada</Text><Text fw={600}>{ocupacion}%</Text></Stack>
          <Stack gap={0}><Text fz="sm" c="dimmed">Libre</Text><Text fw={600}>{disponible}%</Text></Stack>
        </Group>
      </Stack>
    </Card>
  );
}

function KeyInsightsCard({ metrics }) {
  const insights = [
    { label: "Confirmadas", value: `${metrics.confirmadas} listos`, hint: "Listos para jugar" },
    { label: "Pendientes", value: `${metrics.pendientes} por aprobar`, hint: "A pagar seña" },
    { label: "Turnos Libres", value: `${metrics.disponible} disponibles`, hint: "Para reservar" }
  ];
  return (
    <Card radius="xl" p="lg" withBorder>
      <Stack gap="sm">
        <Group gap="xs"><IconTrophy size={20} /><div><Text fz="sm" c="dimmed">Insights</Text><Text fw={600}>Jugadas claves</Text></div></Group>
        <Stack gap="md">
          {insights.map((insight) => (
            <div key={insight.label}>
              <Group justify="space-between"><Text fw={600}>{insight.label}</Text><Text c="mint.7">{insight.value}</Text></Group>
              <Text fz="xs" c="dimmed">{insight.hint}</Text>
            </div>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}

function badgeColorByState(estado) {
  const value = (estado ?? "").toLowerCase();
  if (value.includes("disponible") || value.includes("confirm")) return "blue";
  if (value.includes("en") || value.includes("sena") || value.includes("seña")) return "yellow";
  if (value.includes("confirmada") || value.includes("confir") || value.includes("reserv")) return "green";
  return "gray";
}
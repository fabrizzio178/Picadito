import { useCallback, useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title
} from "@mantine/core";
import { modals } from "@mantine/modals"; // <--- IMPORTAMOS MODALS DE MANTINE
import { 
  IconDeviceFloppy, 
  IconEdit, 
  IconPlus, 
  IconRefresh, 
  IconSoccerField, 
  IconTrash,
  IconCalendarPlus
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { toast } from "react-toastify"; 
import clubApi from "../../services/clubApi";
import ReservaModal from "./ReservaModal";

const emptyForm = { id: null, nombre: "", ubicacion: "", precio: 0, idTipo: null };

export default function CanchaManager({ onRedirectToTablero }) {
  const [canchas, setCanchas] = useState([]);
  const [tiposCancha, setTiposCancha] = useState([]); 
  const [form, setForm] = useState(emptyForm);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [saving, setSaving] = useState(false);
  const [reservaModalOpened, setReservaModalOpened] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [canchasData, tiposData] = await Promise.all([
        clubApi.canchas.list(),
        clubApi.tiposCancha.list()
      ]);
      const listaCanchas = Array.isArray(canchasData) ? canchasData : canchasData.data || [];
      const listaTipos = Array.isArray(tiposData) ? tiposData : tiposData.data || [];
      setCanchas(listaCanchas);
      setTiposCancha(listaTipos);
    } catch (error) {
      console.error("Error cargando datos", error);
      notifications.show({ title: "Error de conexión", message: "No pudimos cargar la información del club.", color: "red" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (selectedId) {
      const found = canchas.find((c) => c.id === selectedId);
      if (found) {
        setForm({
          id: found.id,
          nombre: found.nombre,
          ubicacion: found.ubicacion,
          precio: found.precio,
          idTipo: String(found.idTipo) 
        });
      }
    } else {
      setForm(emptyForm);
    }
  }, [selectedId, canchas]);

  const tiposOptions = tiposCancha.map(t => ({ value: String(t.id), label: t.nombre }));

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre,
        ubicacion: form.ubicacion,
        precio: Number(form.precio),
        idTipo: Number(form.idTipo)
      };
      if (form.id) {
        await clubApi.canchas.update(form.id, payload);
        toast.success("Cancha actualizada correctamente", { position: "bottom-right", theme: "colored" });
      } else {
        await clubApi.canchas.create(payload);
        toast.success("Cancha creada con éxito", { position: "bottom-right", theme: "colored" });
      }
      setForm(emptyForm);
      setSelectedId(null);
      loadData(); 
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar la cancha");
    } finally {
      setSaving(false);
    }
  };

  // --- LÓGICA DE BORRADO CON MODAL MANTINE ---
  const confirmDelete = (id) => {
    modals.openConfirmModal({
      title: <Text fw={700}>Eliminar cancha</Text>,
      centered: true,
      children: (
        <Text size="sm" c="dimmed">
          ¿Estás seguro de eliminar esta cancha? Esta acción no se puede deshacer y podría afectar reservas históricas.
        </Text>
      ),
      labels: { confirm: "Sí, eliminar", cancel: "Cancelar" },
      confirmProps: { color: "red", variant: "filled" },
      cancelProps: { variant: "subtle" },
      onConfirm: async () => {
        try {
            await clubApi.canchas.remove(id);
            setCanchas((prev) => prev.filter((c) => c.id !== id));
            if (selectedId === id) { setSelectedId(null); setForm(emptyForm); }
            
            toast.success("Cancha eliminada", { theme: "colored", autoClose: 2000, position: "bottom-right" });
        } catch (error) {
            console.error(error);
            toast.error("No se pudo eliminar la cancha", { theme: "colored" });
        }
      }
    });
  };

  return (
    <>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={3}>Gestioná tus canchas</Title>
            <Text c="dimmed" maw={520}>Administrá las propiedades y precios de tus espacios.</Text>
          </div>
          <Group gap="xs">
            <Button variant="filled" color="turf" radius="xl" leftSection={<IconCalendarPlus size={18} />} onClick={() => setReservaModalOpened(true)}>
              Nueva Reserva
            </Button>
            <Button variant="light" color="blue" radius="xl" leftSection={<IconRefresh size={16} />} onClick={loadData} loading={loading}>
              Sincronizar
            </Button>
            <Button leftSection={<IconPlus size={16} />} variant="default" radius="xl" onClick={() => { setSelectedId(null); setForm(emptyForm); }}>
              Limpiar form
            </Button>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
          {loading && canchas.length === 0 && Array.from({ length: 3 }).map((_, index) => (
              <Card key={`skeleton-${index}`} radius="xl" withBorder p="lg"><Skeleton height={100} radius="md" animate /></Card>
          ))}
          {!loading && canchas.length === 0 && <Text c="dimmed" ta="center" py="xl">No hay canchas cargadas.</Text>}
          {canchas.map((cancha) => (
            <Card key={cancha.id} radius="xl" withBorder p="lg" style={{ borderColor: selectedId === cancha.id ? 'var(--mantine-color-turf-5)' : undefined, borderWidth: selectedId === cancha.id ? 2 : 1 }}>
              <Stack gap="sm">
                <Group justify="space-between" align="flex-start">
                  <Group gap="sm">
                    <ThemeIcon radius="xl" size="lg" color="mint" variant="light"><IconSoccerField size={20} /></ThemeIcon>
                    <div><Text fw={700}>{cancha.nombre}</Text><Text fz="xs" c="dimmed">{cancha.ubicacion}</Text></div>
                  </Group>
                  <Badge color="blue" variant="light">{tiposCancha.find(t => t.id === cancha.idTipo)?.nombre || "Cancha"}</Badge>
                </Group>
                <Group justify="space-between" align="center" mt="xs">
                    <Text fw={700} fz="xl" c="turf">${Number(cancha.precio).toLocaleString()}</Text>
                    <Group gap="xs">
                        <ActionIcon variant="light" color="blue" radius="xl" onClick={() => setSelectedId(cancha.id)}><IconEdit size={18} /></ActionIcon>
                        
                        {/* BOTÓN DE ELIMINAR CON NUEVO MODAL */}
                        <ActionIcon variant="light" color="red" radius="xl" onClick={() => confirmDelete(cancha.id)}><IconTrash size={18} /></ActionIcon>
                    </Group>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        <Paper radius="xl" withBorder p="xl" component="form" onSubmit={handleSubmit}>
          <Stack gap="lg">
            <Group justify="space-between" align="flex-end">
              <div>
                <Title order={4}>{form.id ? "Editando cancha" : "Nueva cancha"}</Title>
                <Text c="dimmed" fz="sm">Ingresá los datos básicos para disponibilizar la cancha.</Text>
              </div>
              <Button type="submit" color="turf" leftSection={<IconDeviceFloppy size={16} />} loading={saving} radius="xl">
                {form.id ? "Actualizar" : "Crear Cancha"}
              </Button>
            </Group>
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <TextInput label="Nombre" placeholder="Ej. Cancha 1" value={form.nombre} onChange={(e) => handleFieldChange("nombre", e.currentTarget.value)} required radius="md" />
                  <TextInput label="Ubicación" placeholder="Dirección física" value={form.ubicacion} onChange={(e) => handleFieldChange("ubicacion", e.currentTarget.value)} required radius="md" />
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <Select label="Tipo de cancha" data={tiposOptions} value={form.idTipo} onChange={(val) => handleFieldChange("idTipo", val)} placeholder="Seleccioná formato" radius="md" required searchable nothingFoundMessage="No hay tipos disponibles" />
                  <NumberInput label="Precio por turno" value={form.precio} onChange={(val) => handleFieldChange("precio", val)} thousandSeparator prefix="$" radius="md" min={0} required />
                </Stack>
              </Grid.Col>
            </Grid>
          </Stack>
        </Paper>
      </Stack>

      <ReservaModal 
        opened={reservaModalOpened} 
        onClose={() => setReservaModalOpened(false)}
        onSuccess={() => {
           loadData(); 
           if(onRedirectToTablero) onRedirectToTablero();
        }}
      />
    </>
  );
}
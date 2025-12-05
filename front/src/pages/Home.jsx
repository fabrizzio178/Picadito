import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  ThemeIcon,
  AspectRatio,
  Image,
  Overlay,
  Center,
  Loader
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconSoccerField,
  IconArrowRight,
  IconTrophy
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import clubApi from "../services/clubApi";
import { useSessionStore } from "../stores/useSessionStore";
import ReservaModal from "../components/admin/ReservaModal"; 

export default function Home() {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpened, { open, close }] = useDisclosure(false);
  const [preSelectedCancha, setPreSelectedCancha] = useState(null);
  const [fechaFiltro, setFechaFiltro] = useState(new Date());

  const user = useSessionStore((state) => state.user);
  const navigate = useNavigate(); 

  // 1. Efecto de Redirección (HOOK)
  useEffect(() => {
    if (user?.rol === "Admin" || user?.rol === "admin") {
        navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  // 2. Efecto de Carga de Canchas (HOOK - MOVIDO ARRIBA)
  useEffect(() => {
    const fetchCanchas = async () => {
      try {
        const data = await clubApi.canchas.list();
        const lista = Array.isArray(data) ? data : data.data || [];
        setCanchas(lista);
      } catch (error) {
        console.error("Error cargando canchas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCanchas();
  }, []);

  // 3. Memo de Métricas (HOOK - MOVIDO ARRIBA)
  const metrics = useMemo(() => {
    return {
      totalCanchas: canchas.length,
    };
  }, [canchas]);

  // --- AHORA SÍ: LOGICA DE RENDERIZADO CONDICIONAL ---
  // Si es admin, retornamos el loader. Como ya pasaron todos los hooks, React no se queja.
  if (user?.rol === "Admin" || user?.rol === "admin") {
      return (
        <Center h="100vh">
             <Loader color="turf" type="dots" />
        </Center>
      );
  }

  const handleReservar = (canchaId = null) => {
    if (!user) {
        toast.info("Iniciá sesión para reservar tu cancha ⚽", {
            position: "bottom-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
        });
        navigate("/login"); 
        return; 
    }

    setPreSelectedCancha(canchaId); 
    open();
  };

  return (
    <Box 
        pb="xl" 
        style={{ 
            background: "transparent", 
            minHeight: "100vh"
        }}
    >
      <Container 
        size="xl" 
        mt={{ base: 20, md: -90 }} 
      > 
        
        {/* --- SECCIÓN PRINCIPAL (HERO + MAPA) --- */}
        <Grid gutter={{ base: 30, md: 50 }} align="center" mb={60}>
          
          {/* IZQUIERDA: Textos y Acción */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md" align="flex-start">
              <Badge 
                variant="filled" 
                color="turf" 
                size="lg" 
                radius="md"
              >
                {user ? `¡Buenas, ${user.nombre}!` : "Turno libre = Partido asegurado"}
              </Badge>
              
              <Title order={1} fz={{ base: 32, md: 54 }} fw={800} lh={1.1} c="turf.9">
                Organizá tu próximo partido <br />
                <Text span c="turf.7" inherit>en una sola pantalla</Text>
              </Title>
              
              <Text c="dark.9" fz="lg" maw={520} fw={500} style={{ textShadow: "0 1px 10px rgba(255,255,255,0.5)" }}>
                Descubrí canchas disponibles, elegí horario y confirmá al toque. 
                Sin vueltas, sin llamadas, sin esperas.
              </Text>

              {/* Buscador Rápido (Fecha) */}
              <Card 
                radius="xl" 
                withBorder 
                p="sm" 
                mt="md" 
                w={{ base: '100%', sm: 'auto' }} 
                style={{ 
                    borderColor: 'rgba(46,194,72,0.4)', 
                    backgroundColor: "rgba(255,255,255,0.8)", 
                    backdropFilter: "blur(8px)"
                }}
              >
                  {/* Layout Responsivo: Fecha expandible + Botón */}
                  <Stack gap="sm" visibleFrom="xs" style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <DatePickerInput
                        placeholder="¿Cuándo juegan?"
                        leftSection={<IconCalendar size={18} />}
                        variant="unstyled"
                        size="md"
                        value={fechaFiltro}
                        onChange={setFechaFiltro}
                        minDate={new Date()}
                        locale="es"
                        style={{ flex: 1, paddingLeft: 10 }}
                    />
                    <Button 
                        size="md" 
                        radius="xl" 
                        color="turf" 
                        variant="gradient" 
                        gradient={{ from: 'turf', to: 'green', deg: 105 }}
                        onClick={() => handleReservar(null)} 
                        rightSection={<IconArrowRight size={18} />}
                    >
                        Reservar ahora
                    </Button>
                  </Stack>

                  {/* Versión Mobile: Vertical puro */}
                  <Stack gap="sm" hiddenFrom="xs">
                      <DatePickerInput
                        placeholder="¿Cuándo juegan?"
                        leftSection={<IconCalendar size={18} />}
                        size="md"
                        radius="xl"
                        value={fechaFiltro}
                        onChange={setFechaFiltro}
                        minDate={new Date()}
                        locale="es"
                        w="100%"
                    />
                    <Button 
                        fullWidth
                        size="md" 
                        radius="xl" 
                        color="turf" 
                        variant="gradient" 
                        gradient={{ from: 'turf', to: 'green', deg: 105 }}
                        onClick={() => handleReservar(null)}
                    >
                        Reservar ahora
                    </Button>
                  </Stack>
              </Card>
            </Stack>
          </Grid.Col>

          {/* DERECHA: Mapa */}
          <Grid.Col span={{ base: 12, md: 5 }}>
              <ClubLocationCard />
          </Grid.Col>
        </Grid>

        {/* --- MÉTRICAS --- */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb={50}>
            <StatCard 
                label="Canchas activas" 
                value={metrics.totalCanchas} 
                icon={<IconSoccerField size={22} />} 
            />
            <StatCard 
                label="Horarios Club" 
                value="18:00 - 23:00" 
                icon={<IconClock size={22} />} 
                suffix="Abierto hoy"
            />
             <StatCard 
                label="Superficie" 
                value="Sintético" 
                icon={<IconTrophy size={22} />} 
                suffix="Calidad FIFA" 
            />
        </SimpleGrid>

        {/* --- LISTADO DE CANCHAS --- */}
        <Stack gap="lg">
            <Group justify="space-between" align="end">
                <div>
                    <Title order={2} c="turf.9">Nuestras Canchas</Title>
                    <Text c="dark.6">Elegí donde vas a tirar magia hoy</Text>
                </div>
            </Group>

            {loading ? (
                 <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                    {[1, 2, 3].map(i => <Skeleton key={i} height={280} radius="xl" />)}
                 </SimpleGrid>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                    {canchas.map((cancha) => (
                        <CanchaCard 
                            key={cancha.id} 
                            cancha={cancha} 
                            onReservar={() => handleReservar(cancha.id)} 
                        />
                    ))}
                    {canchas.length === 0 && (
                        <Text c="dimmed" fs="italic">No hay canchas cargadas en el sistema.</Text>
                    )}
                </SimpleGrid>
            )}
        </Stack>

      </Container>

      {/* MODAL DE RESERVA */}
      <ReservaModal 
        opened={modalOpened} 
        onClose={() => {
            close();
            setPreSelectedCancha(null);
        }} 
        initialCanchaId={preSelectedCancha}
        initialDate={fechaFiltro}
      />
    </Box>
  );
}

// --- COMPONENTES UI (Se mantienen igual) ---

function StatCard({ label, value, icon, suffix }) {
  return (
    <Card
      radius="xl"
      p="lg"
      withBorder
      style={{
        borderColor: "rgba(31,162,58,0.2)",
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(10px)"
      }}
    >
      <Stack gap={6}>
        <Group gap={8} c="turf.9">
          {icon}
          <Text fz="xs" tt="uppercase" fw={800} lts={1}>
            {label}
          </Text>
        </Group>
        <Group align="baseline" gap="xs">
            <Text fz={28} fw={700} c="dark.9" lh={1}>
            {value}
            </Text>
            {suffix && (
            <Text fz="xs" c="dark.5" fw={600}>
                {suffix}
            </Text>
            )}
        </Group>
      </Stack>
    </Card>
  );
}

function ClubLocationCard() {
    return (
        <Card 
            radius="xl" 
            p={0} 
            withBorder 
            shadow="lg" 
            h={{ base: 300, md: 380 }}
            style={{ 
                border: "4px solid rgba(255,255,255,0.7)",
                overflow: 'hidden', 
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                background: "transparent"
            }}
        >
            <Box pos="relative" h="100%" w="100%">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1701.363504144671!2d-64.18790462988561!3d-31.476694940717373!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432a375843903bb%3A0xcfd77623804b2b0!2sLa%20Liga%20Del%20Sur!5e0!3m2!1ses-419!2sar!4v1764729550724!5m2!1ses-419!2sar" 
                    width="600" 
                    height="450" 
                    style={{ border: 0, width: '100%', height: '100%' }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                
                <Box 
                    style={{ 
                        position: 'absolute', 
                        bottom: 16, 
                        left: 16, 
                        right: 16, 
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    }}
                >
                    <Group justify="space-between">
                        <div>
                            <Text fw={700} size="sm" c="dark.9">Ubicación del Club</Text>
                            <Text size="xs" c="dimmed">Av. Valparaíso 5100</Text>
                        </div>
                        <ThemeIcon radius="xl" size="md" color="turf" variant="light">
                            <IconMapPin size={18} />
                        </ThemeIcon>
                    </Group>
                </Box>
            </Box>
        </Card>
    );
}

function CanchaCard({ cancha, onReservar }) {
    // MAPEO DIRECTO: ID de la cancha -> URL de la foto
    const imagesById = {
        1: "https://media.puntal.com.ar/p/48e2ade629e77b5f51c8d0bb1a38c877/adjuntos/279/imagenes/001/376/0001376243/219cb6d9-53e8-465b-b972-d4fd7658c864jpg.jpg", // Cancha 1
        2: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=800&auto=format&fit=crop", // Cancha 2
        3: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=612,h=464,fit=crop/m2Wp524VRVHLRGW0/img-20240731-wa0074-Aq2vyDV0k2cr2pz1.jpg"  // CANCHA 3 (La Real)
    };

    // Imagen por defecto por si creas una Cancha 4, 5, etc. y no le definiste foto arriba
    const defaultImage = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiKUOCQnRvKgTZupnQn8OM_AvCACMYaW4ea29U5zhIufwHgdAVE-6DFktenE-TAgHFObDT7Ddns2CREIx2O_GfYu9HdH42tZt7zIChiMioLbPeX4-dg3vse4NcaAOr7MM_sPOUCPOwmyEM/s1600/photo.jpeg";

    // Seleccionamos la imagen según el ID
    const imageSrc = imagesById[cancha.id] || defaultImage;

    return (
        <Card 
            radius="xl" 
            withBorder 
            padding={0} 
            style={{ 
                transition: 'all 0.3s ease', 
                cursor: 'pointer',
                overflow: 'hidden', 
                backgroundColor: 'rgba(255,255,255,0.6)', 
                backdropFilter: 'blur(8px)',
                borderColor: "rgba(46,194,72,0.15)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <Card.Section>
                <AspectRatio ratio={16/10}>
                    <Image 
                        src={imageSrc} 
                        alt={cancha.nombre}
                        fit="cover"
                        h="100%"
                    />
                    <Overlay gradient="linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(20,60,30,0.4) 100%)" opacity={1} zIndex={1} />
                </AspectRatio>
            </Card.Section>

            <Stack gap="xs" p="lg">
                <Group justify="space-between" align="center">
                    <Text fw={700} fz="lg" c="dark.9">{cancha.nombre}</Text>
                    <Badge color="turf" variant="light" radius="sm">Fútbol 7</Badge>
                </Group>

                <Text size="sm" c="dark.6" lineClamp={2} h={40}>
                    {cancha.descripcion || "Cancha de césped sintético con iluminación LED."}
                </Text>

                <Group gap={6} c="turf.8" mb={4}>
                      <IconMapPin size={14} />
                      <Text size="xs" fw={600}>{cancha.ubicacion || "Predio Central"}</Text>
                </Group>

                <Button 
                    fullWidth 
                    radius="xl" 
                    color="turf" 
                    onClick={onReservar}
                    variant="filled"
                    mt="xs"
                >
                    Ver Horarios
                </Button>
            </Stack>
        </Card>
    )
}
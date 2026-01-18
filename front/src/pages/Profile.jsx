import { 
  Avatar, 
  Badge, 
  Button, 
  Card, 
  Container, 
  Grid, 
  Group, 
  Paper, 
  Progress, 
  Rating, 
  SimpleGrid, 
  Stack, 
  Text, 
  Textarea, 
  ThemeIcon, 
  Title 
} from "@mantine/core";
import { 
  IconBallFootball, 
  IconMapPin, 
  IconCalendar,
  IconMedal, 
  IconStar, 
  IconTrophy 
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { toast } from "react-toastify";
import { useSessionStore } from "../stores/useSessionStore";

export default function Profile() {
  const user = useSessionStore((state) => state.user);

  // Stats Mockeadas
  const stats = [
    { label: "Partidos Jugados", value: "12", icon: IconBallFootball, color: "blue" },
    { label: "Cancha Favorita", value: "Cancha 1", icon: IconMapPin, color: "turf" },
    { label: "Valoración", value: "4.8", icon: IconStar, color: "yellow" },
  ];

  const reviewForm = useForm({
    initialValues: { rating: 0, comment: "" },
    validate: {
        rating: (value) => (value === 0 ? "Seleccioná una puntuación" : null),
        comment: (value) => (value.length < 5 ? "Dejanos un comentario más largo" : null),
    }
  });

  const handleSubmitReview = (values) => {
      // Aquí iría la lógica de backend real
      toast.success("¡Gracias por tu opinión!", { position: "top-center", theme: "colored" });
      reviewForm.reset();
  };

  if (!user) return <Text>Iniciá sesión para ver tu perfil.</Text>;

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        
        {/* HEADER PERFIL */}
        <Paper radius="xl" p="xl" withBorder bg="var(--mantine-color-gray-0)">
          <Group>
            <Avatar size={80} radius="xl" color="turf" variant="filled">
              {user.nombre?.[0]?.toUpperCase()}
            </Avatar>
            <Stack gap={0} style={{ flex: 1 }}>
              <Title order={3}>{user.nombre} {user.apellido}</Title>
              <Text c="dimmed">{user.email}</Text>
              <Group mt="xs">
                 <Badge variant="dot" color="green">Activo</Badge>
                 <Badge variant="light" color="blue">{user.rol}</Badge>
              </Group>
            </Stack>
          </Group>
        </Paper>

        {/* STATS */}
        <SimpleGrid cols={{ base: 1, xs: 3 }}>
           {stats.map((stat) => (
             <Card key={stat.label} radius="lg" withBorder padding="md">
               <Group justify="space-between" align="flex-start">
                 <Stack gap={0}>
                   <Text c="dimmed" size="xs" tt="uppercase" fw={700}>{stat.label}</Text>
                   <Text fw={700} size="xl">{stat.value}</Text>
                 </Stack>
                 <ThemeIcon variant="light" color={stat.color} radius="md" size="lg">
                    <stat.icon size={22} />
                 </ThemeIcon>
               </Group>
             </Card>
           ))}
        </SimpleGrid>

        {/* NIVEL / GAMIFICATION (Visual Only) */}
        <Card radius="lg" withBorder>
            <Group justify="space-between" mb="xs">
                <Group gap="xs">
                    <IconTrophy size={20} color="orange" />
                    <Text fw={600}>Nivel: Semiprofesional</Text>
                </Group>
                <Text size="sm" c="dimmed">350 / 500 XP</Text>
            </Group>
            <Progress value={70} color="orange" size="lg" radius="xl" striped animated />
            <Text size="xs" c="dimmed" mt="xs" ta="center">¡Jugá 3 partidos más para subir de nivel!</Text>
        </Card>

        {/* REVIEW SECTION */}
        <Stack gap="md">
            <Title order={4}>Tu último partido</Title>
            <Card radius="lg" withBorder>
                <Stack gap="md">
                    <Group justify="space-between">
                        <Group>
                            <ThemeIcon color="gray" variant="light"><IconCalendar size={18}/></ThemeIcon>
                            <Text size="sm" fw={500}>18 de Enero 2026 - 20:00hs</Text>
                        </Group>
                        <Badge color="turf">Jugado</Badge>
                    </Group>
                    <Text size="sm">Cancha 2 - Sintético</Text>
                    
                    <form onSubmit={reviewForm.onSubmit(handleSubmitReview)}>
                        <Stack gap="sm" bg="gray.0" p="md" style={{ borderRadius: "var(--mantine-radius-md)" }}>
                            <Text size="sm" fw={600}>¿Qué te pareció la cancha?</Text>
                            <Rating size="lg" {...reviewForm.getInputProps('rating')} />
                            <Textarea 
                                placeholder="La cancha estaba impecable, pero..." 
                                autosize 
                                minRows={2}
                                {...reviewForm.getInputProps('comment')}
                            />
                            <Button type="submit" variant="light" color="dark" radius="xl" disabled={!reviewForm.isDirty()}>
                                Enviar reseña
                            </Button>
                        </Stack>
                    </form>
                </Stack>
            </Card>
        </Stack>
      </Stack>
    </Container>
  );
}

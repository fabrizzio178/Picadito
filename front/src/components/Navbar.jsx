import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  Group,
  Menu,
  Paper,
  Stack,
  Text
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBallFootball,
  IconChevronDown,
  IconLogout,
  IconMenu2,
  IconShield,
  IconSoccerField,
  IconLayoutDashboard,
  IconCalendar,
  IconUser
} from "@tabler/icons-react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; 
import { useSessionStore } from "../stores/useSessionStore";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpened, { toggle, close }] = useDisclosure(false);
  
  const user = useSessionStore((state) => state.user);
  const logoutSession = useSessionStore((state) => state.logout); 
  const hydrate = useSessionStore((state) => state.hydrate);

  // Verificamos si es admin
  const isAdmin = user?.rol === "Admin" || user?.rol === "admin";

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    Cookies.remove("token");
    if(logoutSession) logoutSession();
    close();
    navigate("/login");
  };

  return (
    <Box px={{ base: "xs", md: "xl" }} py={{ base: 25, md: "sm" }}>
      <Paper
        radius="xl"
        px={{ base: "md", md: "xl" }}
        py={{ base: 4, md: "sm" }}
        withBorder
        style={{
          borderColor: "rgba(46, 194, 72, 0.2)",
          background: "linear-gradient(120deg, rgba(248, 255, 249, 0.95), rgba(226, 248, 228, 0.95))",
          boxShadow: "0 22px 55px rgba(19, 85, 36, 0.12)",
          backdropFilter: "blur(8px)",
          transition: "box-shadow 200ms ease, transform 200ms ease",
          width: "100%",
          marginTop: -2 
        }}
      >
        <Group justify="space-between" align="center" gap={{ base: "xs", md: "xl" }} wrap="nowrap">
          {/* --- LOGO --- */}
          <Group gap="xs" wrap="nowrap">
            <Paper
              radius="xl"
              p={4} 
              withBorder
              style={{
                borderColor: "rgba(23, 128, 50, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <IconBallFootball size={20} color="#1b8032" />
            </Paper>
            <Box>
              <Text fw={700} fz={{ base: "md", md: "lg" }} c="turf.8" lh={1.2}>
                Picadito
              </Text>
              <Text fz="xs" c="dimmed" visibleFrom="xs">
                Armá tu partido en minutos
              </Text>
            </Box>
            <Badge color="turf" variant="light" radius="sm" visibleFrom="sm">
              Valpa Club
            </Badge>
          </Group>

          {/* --- MENÚ DESKTOP (BOTONES EN ORDEN) --- */}
          <Group gap="sm" visibleFrom="md">
            
            {/* Solo mostramos Reservar y Mis Turnos si NO es admin */}
            {!isAdmin && (
              <>
                {/* 1. Reservar Cancha (Principal) */}
                <Button
                  component={Link}
                  to="/"
                  leftSection={<IconSoccerField size={18} />}
                  radius="xl"
                  color="turf"
                  variant="gradient"
                >
                  Reservar cancha
                </Button>

                {/* 2. Mis Turnos */}
                <Button
                  component={Link}
                  to="/mis-reservas"
                  leftSection={<IconCalendar size={18} />}
                  radius="xl"
                  variant={isActive("/mis-reservas") ? "filled" : "light"} 
                  color="turf"
                >
                  Mis turnos
                </Button>
              </>
            )}

            {/* 3. Panel Admin (Visible solo para Admin) */}
            {isAdmin && (
              <Button
                component={Link}
                to="/admin"
                leftSection={<IconLayoutDashboard size={18} />}
                radius="xl"
                variant="light"
                color="dark" // Fondo grisaceo suave para diferenciarlo
              >
                Panel Admin
              </Button>
            )}
          </Group>

          {/* --- USER MENU / MOBILE TOGGLE --- */}
          <Group gap="xs" wrap="nowrap">
            {user ? (
              <Menu shadow="md" width={230} withArrow>
                <Menu.Target>
                  <Button 
                    variant="light" 
                    color="turf" 
                    radius="xl" 
                    px={{ base: 6, xs: "md" }}
                    rightSection={<IconChevronDown size={16} style={{ display: 'var(--mantine-visible-from-xs)' }} />}
                  >
                    <Group gap="xs">
                      <Avatar radius="xl" size={26} color="turf">
                        {user?.nombre?.[0]?.toUpperCase() || "U"}
                      </Avatar>
                      <Box visibleFrom="xs">
                        <Text fz="sm" fw={600}>
                          {user.nombre}
                        </Text>
                      </Box>
                    </Group>
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Tu sesión ({user.rol})</Menu.Label>
                  <Menu.Item leftSection={<IconShield size={16} />} disabled>
                    {user.email || user.mail || "--"}
                  </Menu.Item>
                  
                  <Menu.Item component={Link} to="/profile" leftSection={<IconUser size={16} />}>
                    Mi Perfil
                  </Menu.Item>
                  
                  {isAdmin && (
                    <Menu.Item component={Link} to="/admin" leftSection={<IconLayoutDashboard size={16} />}>
                      Panel admin
                    </Menu.Item>
                  )}
                  
                  <Menu.Divider />
                  <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                    Salir
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group gap="xs" visibleFrom="md">
                <Button component={Link} to="/login" variant="subtle" color="turf" radius="xl">
                  Ingresar
                </Button>
                <Button component={Link} to="/register" color="turf" radius="xl">
                  Crear cuenta
                </Button>
              </Group>
            )}

            <ActionIcon size="lg" radius="xl" variant="light" color="turf" hiddenFrom="md" style={{ display: 'none' }}>
              {/* BURGER MENU REMOVED - Replaced by MobileNavbar */}
            </ActionIcon>
          </Group>
        </Group>
      </Paper>
    </Box>
  );
}
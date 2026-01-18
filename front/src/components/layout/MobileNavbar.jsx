import { ActionIcon, Group, Paper, Stack, Text, useMantineTheme } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { 
  IconSoccerField, 
  IconCalendar, 
  IconUser, 
  IconLayoutDashboard 
} from "@tabler/icons-react";
import { useSessionStore } from "../../stores/useSessionStore";

export default function MobileNavbar() {
  const location = useLocation();
  const theme = useMantineTheme();
  const user = useSessionStore((state) => state.user);

  if (!user) return null; // Si no hay usuario, no mostramos barra (o mostramos login/register?)

  const isAdmin = user?.rol === "Admin" || user?.rol === "admin";
  const isActive = (path) => location.pathname === path;

  // Items de navegación
  const navItems = [
    { label: "Reservar", icon: IconSoccerField, path: "/", show: !isAdmin },
    { label: "Mis Turnos", icon: IconCalendar, path: "/mis-reservas", show: !isAdmin },
    { label: "Panel", icon: IconLayoutDashboard, path: "/admin", show: isAdmin },
    { label: "Perfil", icon: IconUser, path: "/profile", show: true } // Futura página
  ];

  return (
    <Paper
      hiddenFrom="md"
      radius={0}
      withBorder
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        borderTop: `1px solid ${theme.colors.gray[2]}`,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.03)"
      }}
      p="xs"
    >
      <Group justify="space-around" align="center" gap={0}>
        {navItems.filter(item => item.show).map((item) => {
            const active = isActive(item.path);
            const color = active ? theme.colors.turf[6] : theme.colors.gray[6];
            
            return (
              <Stack 
                key={item.label} 
                gap={2} 
                align="center" 
                style={{ cursor: "pointer", width: "60px" }}
                onClick={() => { /* Navegación handled by Link wrapper */ }}
              >
                 <ActionIcon 
                    component={Link} 
                    to={item.path}
                    variant="subtle" 
                    color={active ? "turf" : "gray"} 
                    size="lg" 
                    radius="xl"
                  >
                    <item.icon size={26} stroke={active ? 2.5 : 1.5} />
                 </ActionIcon>
                 <Text size="10px" fw={active ? 700 : 500} c={color}>
                    {item.label}
                 </Text>
              </Stack>
            );
        })}
      </Group>
    </Paper>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Badge, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { IconArrowRight, IconLock } from "@tabler/icons-react";
import { toast } from "react-toastify"; // Usamos Toastify
import Cookies from "js-cookie"; // Para guardar el token
import clubApi from "../services/clubApi";
import { useSessionStore } from "../stores/useSessionStore";

export default function Login() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // 1. Llamada al back
      const data = await clubApi.auth.login(mail, password);
      
      // La respuesta es { token: "...", usuario: { ... } }
      const { token, usuario } = data;

      // 2. Guardamos token en Cookie (expira en 7 días, por ejemplo)
      Cookies.set("token", token, { expires: 7, secure: true, sameSite: 'strict' });

      // 3. Guardamos usuario en el Store de Zustand (para mostrar nombre en navbar, etc)
      setSession({ user: usuario, token: token });

      toast.success(`¡Hola de nuevo, ${usuario.nombre}!`, {
        position: "bottom-right",
        theme: "colored"
      });

      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Email o contraseña incorrectos", {
        position: "top-center",
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack align="center" py="xl">
      <Paper
        radius="xl"
        p="xl"
        withBorder
        maw={460}
        w="100%"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(224, 248, 228, 0.9))",
          borderColor: "rgba(46,194,72,0.2)",
          boxShadow: "0 26px 50px rgba(19,85,36,0.12)"
        }}
      >
        <Stack gap="md">
          <div>
            <Badge color="turf" variant="light" radius="sm">
              Equipo organizado
            </Badge>
            <Title order={2} mt="xs">
              Ingresá y armá tu partido
            </Title>
            <Text c="dimmed">Tu panel muestra las canchas y sus turnos. Podrás seguir tus turnos en tiempo real.</Text>
          </div>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Correo electrónico"
                placeholder="patricio@club.com"
                type="email"
                required
                value={mail}
                onChange={(event) => setMail(event.currentTarget.value)}
              />
              <PasswordInput
                label="Contraseña"
                placeholder="••••••••"
                required
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                leftSection={<IconLock size={16} />}
              />
              
              <Button
                type="submit"
                radius="xl"
                loading={loading}
                rightSection={<IconArrowRight size={18} />}
                color="turf"
                variant="gradient"
              >
                Ingresar
              </Button>
            </Stack>
          </form>
          <Text fz="sm" c="dimmed">
            ¿No tenés cuenta? <Link to="/register">Crear cuenta</Link>
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
}
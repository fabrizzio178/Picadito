import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Button, Paper, PasswordInput, Stack, Text, TextInput, Title, SimpleGrid } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { toast } from "react-toastify"; 
import clubApi from "../services/clubApi"; 

export default function Register() {
  const [form, setForm] = useState({ 
    nombre: "", 
    apellido: "", 
    telefono: "", 
    mail: "", 
    password: "" 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- FIX AQUÍ ---
  const handleChange = (field) => (event) => {
    // Extraemos el valor ANTES de entrar al estado
    const value = event.currentTarget.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  // ----------------

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.mail, 
        password: form.password,
        // telefono: form.telefono, 
        rol: "Cliente" 
    };

    try {
      await clubApi.auth.register(payload);
      
      toast.success("¡Cuenta creada! Ya podés iniciar sesión.", {
        position: "bottom-right",
        theme: "colored"
      });
      
      navigate("/login");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Error al registrarte.";
      toast.error(errorMsg, {
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
          background: "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(222, 249, 231, 0.9))",
          borderColor: "rgba(46,194,72,0.2)",
          boxShadow: "0 26px 50px rgba(19,85,36,0.12)"
        }}
      >
        <Stack gap="md">
          <div>
            <Badge color="turf" variant="light" radius="sm">
              Nuevo equipo
            </Badge>
            <Title order={2} mt="xs">
              Creá tu perfil de jugador
            </Title>
            <Text c="dimmed">Para reservar canchas y guardar tus partidos.</Text>
          </div>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <SimpleGrid cols={2} spacing="xs">
                  <TextInput
                    label="Nombre"
                    placeholder="Lionel"
                    required
                    value={form.nombre}
                    onChange={handleChange("nombre")}
                    leftSection={<IconUser size={16} />}
                  />
                  <TextInput
                    label="Apellido"
                    placeholder="Messi"
                    required
                    value={form.apellido}
                    onChange={handleChange("apellido")}
                  />
              </SimpleGrid>

              <TextInput
                label="Correo electrónico"
                placeholder="leo@seleccion.com"
                type="email"
                required
                value={form.mail}
                onChange={handleChange("mail")}
              />
              <TextInput
                label="Teléfono"
                placeholder="351..."
                value={form.telefono}
                onChange={handleChange("telefono")}
              />
              <PasswordInput
                label="Contraseña"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={handleChange("password")}
              />
              <Button type="submit" radius="xl" loading={loading} color="turf" variant="gradient">
                Registrarme
              </Button>
            </Stack>
          </form>
          <Text fz="sm" c="dimmed">
            ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
}
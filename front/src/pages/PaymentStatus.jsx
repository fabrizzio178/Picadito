import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Container, Card, Text, Title, Button, Stack, ThemeIcon, Loader, Center } from "@mantine/core";
import { IconCheck, IconX, IconAlertCircle, IconArrowRight } from "@tabler/icons-react";
import { useSessionStore } from "../stores/useSessionStore";

export default function PaymentStatus({ status }) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const user = useSessionStore((state) => state.user);

    // Recuperamos datos de la URL que manda MP (payment_id, etc)
    const paymentId = searchParams.get("payment_id");
    const externalReference = searchParams.get("external_reference"); // Tu ID de reserva

    // Configuración según el estado
    const config = {
        success: {
            color: "green",
            icon: <IconCheck size={50} />,
            title: "¡Reserva Confirmada!",
            message: `Tu pago se acreditó correctamente. La reserva #${externalReference || ""} ya es tuya.`,
            buttonText: "Ver mis reservas"
        },
        failure: {
            color: "red",
            icon: <IconX size={50} />,
            title: "El pago falló",
            message: "Hubo un problema con el pago. La reserva quedó pendiente.",
            buttonText: "Volver a intentar"
        },
        pending: {
            color: "orange",
            icon: <IconAlertCircle size={50} />,
            title: "Pago en proceso",
            message: "Estamos procesando tu pago. Te avisaremos cuando se acredite.",
            buttonText: "Ir al inicio"
        }
    }[status];

    return (
        <Container size="sm" h="50vh" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card shadow="xl" radius="xl" p={50} withBorder style={{ textAlign: "center", width: "100%" }}>
                <Stack align="center" gap="lg">
                    <ThemeIcon 
                        size={100} 
                        radius="100%" 
                        color={config.color} 
                        variant="light"
                    >
                        {config.icon}
                    </ThemeIcon>

                    <Title order={2} c="dark.9">{config.title}</Title>
                    
                    <Text c="dimmed" size="lg" maw={400} mx="auto">
                        {config.message}
                    </Text>

                    {paymentId && status === 'success' && (
                        <Text size="sm" c="dimmed" fs="italic">
                            ID de operación: {paymentId}
                        </Text>
                    )}

                    <Button 
                        component={Link} 
                        to="/mis-reservas" 
                        size="md" 
                        radius="xl" 
                        color={config.color}
                        mt="md"
                        rightSection={<IconArrowRight size={20}/>}
                    >
                        {config.buttonText}
                    </Button>
                </Stack>
            </Card>
        </Container>
    );
}
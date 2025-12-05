import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
// import { Notifications } from "@mantine/notifications"; // <-- Si ya no usas las de Mantine, podés quitar o comentar esto
import { ToastContainer } from "react-toastify"; // 1. Importamos el contenedor
import "react-toastify/dist/ReactToastify.css"; // 2. Importamos los estilos obligatorios
import "@mantine/core/styles.css";
import App from "./App.jsx";
import theme from "./theme.js";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light" withGlobalStyles>
      <ModalsProvider>
        {/* <Notifications position="top-right" limit={4} /> */}
        
        {/* 3. Colocamos el ToastContainer aquí para que funcione en toda la app */}
        <ToastContainer />
        
        <App />
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>
);
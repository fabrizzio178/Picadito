import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@mantine/core/styles.css";
import App from "./App.jsx";
import theme from "./theme.js";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light" withGlobalStyles>
      <ModalsProvider>
        <ToastContainer />
        <App />
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>
);
import { AppShell, Container } from "@mantine/core";
import Navbar from "../Navbar.jsx";

export default function AppShellLayout({ children }) {
  return (
    <AppShell
      padding={{ base: "lg", md: "xl" }}
      header={{ height: 88, collapsedHeight: 72 }}
      styles={{
        main: {
          background: "transparent",
          paddingTop: "calc(96px + var(--mantine-spacing-md))",
          paddingBottom: "3rem",
          "@media (maxWidth: 62em)": {
            paddingTop: "calc(80px + var(--mantine-spacing-sm))",
            paddingBottom: "2.5rem"
          },
          "@media (maxWidth: 48em)": {
            paddingTop: "calc(72px + var(--mantine-spacing-sm))",
            paddingBottom: "2rem"
          }
        }
      }}
    >
      <AppShell.Header className="app-header" style={{ boxShadow: "0 12px 30px rgba(19, 85, 36, 0.12)" }}>
        <Navbar />
      </AppShell.Header>
      <AppShell.Main>
        <Container size="responsive" px={{ base: "sm", md: "lg" }}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

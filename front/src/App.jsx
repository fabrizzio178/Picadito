import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppShellLayout from "./components/layout/AppShellLayout.jsx";
import Inicio from "./pages/Inicio.jsx";
import MisReservas from "./pages/MisReservas.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Home from "./pages/Home.jsx";
import PaymentStatus from "./pages/PaymentStatus.jsx";

export default function App() {
  return (
    <Router>
      <AppShellLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mis-reservas" element={<MisReservas />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/api/pagos/success" element={<PaymentStatus status="success" />} />
          <Route path="/api/pagos/failure" element={<PaymentStatus status="failure" />} />
          <Route path="/api/pagos/pending" element={<PaymentStatus status="pending" />} />

        </Routes>
      </AppShellLayout>
    </Router>
  );
}

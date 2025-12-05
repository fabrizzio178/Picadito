import express from 'express';
import cors from 'cors';
import { sequelize } from './config/db';

// entidades
import CanchaRoutes from './routes/CanchaRoutes';
import ReservaRoutes from './routes/ReservaRoutes';
import TurnoRoutes from './routes/TurnoRoutes';
import TipoCanchaRoutes from './routes/TipoCanchaRoutes';
import UsuarioRoutes from './routes/UsuarioRoutes';
import AuthRoutes from './routes/AuthRoutes';
import PaymentRoutes from './routes/PaymentRoutes';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Rutas
app.use('/api/v1/canchas', CanchaRoutes)
app.use('/api/v1/reservas', ReservaRoutes);
app.use('/api/v1/turnos', TurnoRoutes);
app.use('/api/v1/tipos-cancha', TipoCanchaRoutes);
app.use('/api/v1/usuarios', UsuarioRoutes);
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/payments', PaymentRoutes);


// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, async () => {
  await sequelize.authenticate();
  console.log(`Server is running on port ${PORT}`);
});
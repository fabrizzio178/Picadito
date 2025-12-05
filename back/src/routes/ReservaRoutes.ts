import express, { Request, Response } from 'express';
import ReservaService  from '../services/ReservaService';
import ReservaRepository from '../repositories/ReservaRepository';

const router = express.Router();
const reservaRepo = new ReservaRepository();
const reservaService = new ReservaService(reservaRepo);

router.get("/", async (req: Request, res: Response) => {
    try{
        const reservas = await reservaService.consultarReservas();
        if(reservas.length === 0){
            return res.status(404).json({ message: "No reservas found" });
        }
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reservas" });
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const reserva = await reservaService.consultarReservaPorId(id);
    if (reserva) {
        res.json(reserva);
    } else {
        res.status(404).json({ message: "Reserva not found" });
    }
});

router.post("/", async (req: Request, res: Response) => {
    const reservaData = req.body;
    try {
        const newReserva = await reservaService.crearReserva(reservaData);
        res.status(201).json(newReserva);
    } catch (error: any) {
        console.error("Error creating reserva:", error);
        res.status(500).json({
            message: "Error creating reserva",
            error: error.message || error.toString()
        });    
    }
});

router.put("/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const reservaData = req.body;
    try {
        const updatedReserva = await reservaService.actualizarReserva(id, reservaData);
        if (updatedReserva) {
            res.json(updatedReserva);
        }
        else {
            res.status(404).json({ message: "Reserva not found" });
        }
    } catch (error: any) {
        console.error("Error updating reserva:", error);
        res.status(500).json({
            message: "Error updating reserva",
            error: error.message || error.toString()
        });
    }
});

router.delete("/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
        const deleted = await reservaService.eliminarReserva(id);
        if (deleted) {
            res.json({ message: "Reserva deleted successfully" });
        } else {
            res.status(404).json({ message: "Reserva not found" });
        }
    } catch (error: any) {
        console.error("Error deleting reserva:", error);
        res.status(500).json({
            message: "Error deleting reserva",
            error: error.message || error.toString()
        });
    }
});

// Específicos

router.get("/turnos/:usuarioId", async (req: Request, res: Response) => {
    const usuarioId = parseInt(req.params.usuarioId, 10);
    try {
        const reservas = await reservaService.consultarReservasPorUsuarioId(usuarioId);
        if (reservas.length === 0) {
            return res.status(404).json({ message: "No reservas found for this usuarioId" });
        }
        res.json(reservas);
    } catch (error: any) {
        console.error("Error fetching reservas by usuarioId:", error);
        res.status(500).json({
            message: "Error fetching reservas by usuarioId",
            error: error.message || error.toString()
        });
    }
});

export default router;
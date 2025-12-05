import express from "express";
import TurnoService from "../services/TurnoService";
import TurnoRepository from "../repositories/TurnoRepository";

const router = express.Router();
const turnoRepo = new TurnoRepository();
const turnoService = new TurnoService(turnoRepo);

router.get("/", async (req, res) => {
    try {
        const turnos = await turnoService.consultarTurnos();
        if (turnos.length === 0) {
            return res.status(404).json({ message: "No turnos found" });
        }
        res.json(turnos);
    } catch (error) {
        res.status(500).json({ message: "Error fetching turnos" });
    }
});

router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const turno = await turnoService.consultarTurnoPorId(id);
    if (turno) {
        res.json(turno);
    } else {
        res.status(404).json({ message: "Turno not found" });
    }
});

export default router;
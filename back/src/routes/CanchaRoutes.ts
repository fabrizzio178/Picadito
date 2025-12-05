import express, { Request, Response } from 'express';
import  CanchaService  from '../services/CanchaService';
import CanchaRepository from '../repositories/CanchaRepository';

const router = express.Router();
const canchaRepo = new CanchaRepository();
const canchaService = new CanchaService(canchaRepo);

router.get("/", async (req: Request, res: Response) => {
    const canchas = await canchaService.consultarCanchas();
    res.json(canchas);
});

router.get("/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const cancha = await canchaService.consultarCanchaPorId(id);
    if (cancha) {
        res.json(cancha);
    } else {
        res.status(404).json({ message: "Cancha not found" });
    }
});

router.post("/", async (req: Request, res: Response) => {
    const canchaData = req.body;
    const newCancha = await canchaService.crearCancha(canchaData);
    res.status(201).json(newCancha);
});

router.put("/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const canchaData = req.body;
    const updated = await canchaService.actualizarCancha(id, canchaData);
    if (updated) {
        res.json({ message: "Cancha updated successfully" });
    } else {
        res.status(404).json({ message: "Cancha not found" });
    }
});

router.delete("/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const deleted = await canchaService.eliminarCancha(id);
    if (deleted) {
        res.json({ message: "Cancha deleted successfully" });
    }
    else {
        res.status(404).json({ message: "Cancha not found" });
    }
});


router.get("/:id/turnos-disponibles", async (req: Request, res: Response) => {
    const idCancha = parseInt(req.params.id, 10);
    const fechaParam = req.query.fecha as string;

    if (!fechaParam) {
        return res.status(400).json({ message: "Fecha query parameter is required" });
    }

    const fecha = new Date(fechaParam);
    if (isNaN(fecha.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
    }

    try {
        const turnosDisponibles = await canchaService.obtenerTurnosDisponibles(idCancha, fecha);
        if(!turnosDisponibles){
            return  res.status(404).json({ message: "Turnos not available for the given date" });
        }
        res.json(turnosDisponibles);
    } catch (error) {
        console.error("Error al obtener turnos disponibles:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default router;
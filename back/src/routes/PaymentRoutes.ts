import PaymentService from "../services/PaymentService";
import express, { Request, Response } from "express";
import ReservaService from "../services/ReservaService";
import ReservaRepository from "../repositories/ReservaRepository";
const router = express.Router();

const reservaRepo = new ReservaRepository();
const reservaService = new ReservaService(reservaRepo);

router.post("/crear", async (req: Request, res: Response) => {
    try{
        const { reservaId, totalAmount } = req.body;

        if(!reservaId || !totalAmount){
            return res.status(400).json({ message: "reservaId and totalAmount are required" });
        }

        const result = await PaymentService.createPaymentPreference(reservaId, totalAmount);

        res.status(200).json(result);
    } catch(error){
        console.error("Error creating payment preference:", error);
        res.status(500).json({ message: "Error creating payment preference" });
    }
});

router.post("/webhook", async (req: Request, res: Response) => {
    try{
        const query = req.query; // MP manda datos en el query string o body según la versión, revisá ambos
        // Nota: A veces viene en req.body dependiendo de la config de express.
        const data = req.body.data ? req.body : req.query;

        console.log("Webhook received:", data);

        const result = await PaymentService.receiveWebHook(data);

        if (result && result.status === 'approved'){
            await reservaService.actualizarEstadoReserva(result.reservaId, 3); // Asumiendo que 3 es el estado "pagado"
            console.log(`Reserva ${result.reservaId} actualizada a pagado.`);
        }

        res.status(200).json({ message: "Webhook processed" });

    } catch(error){
        console.error("Error processing webhook:", error);
        res.status(500).json({ message: "Error processing webhook" });
    }
});


// Rutas GET para redirección
router.get("/success", (req: Request, res: Response) => {
    const queryParams = new URLSearchParams(req.query as any).toString();
    // Redirigimos al Frontend (localhost:5173) a la ruta que definiste en App.jsx
    res.redirect(`http://localhost:5173/api/pagos/success?${queryParams}`);
});

router.get("/failure", (req: Request, res: Response) => {
    const queryParams = new URLSearchParams(req.query as any).toString();
    res.redirect(`http://localhost:5173/api/pagos/failure?${queryParams}`);
});

router.get("/pending", (req: Request, res: Response) => {
    const queryParams = new URLSearchParams(req.query as any).toString();
    res.redirect(`http://localhost:5173/api/pagos/pending?${queryParams}`);
});

export default router;
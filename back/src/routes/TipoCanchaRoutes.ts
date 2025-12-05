import express from "express";
import TipoCanchaService from "../services/TipoCanchaService";

const router = express.Router();
const tipoCanchaService = new TipoCanchaService();

router.get("/", async (req, res) => {
    const tiposCanchas = await tipoCanchaService.consultarTiposCanchas();
    res.json(tiposCanchas);
});

export default router;
import { Request, Response, Router } from "express";
import AuthService from "../services/AuthService";

const router = Router();
const authService = new AuthService();

router.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const result = await authService.login(email, password);
        res.json(result);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
})

export default router;
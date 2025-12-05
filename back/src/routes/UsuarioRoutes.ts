import express, {Request, Response} from "express";
import UsuarioService from "../services/UsuarioService";
import UsuarioRepository from "../repositories/UsuariosRepository";

const router = express.Router();
const usuarioRepo = new UsuarioRepository();
const usuarioService = new UsuarioService(usuarioRepo);

router.get("/", async (req: Request, res: Response) => {
    try {
        const usuarios = await usuarioService.consultarUsuarios();
        if (usuarios.length === 0) {
            return res.status(404).json({ message: "No usuarios found" });
        }
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: "Error fetching usuarios" });
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const usuario = await usuarioService.consultarUsuarioPorId(id);
    if (usuario) {
        res.json(usuario);
    } else {
        res.status(404).json({ message: "Usuario not found" });
    }
});

router.post("/", async (req: Request, res: Response) => {
    try {
        const nuevoUsuario = await usuarioService.crearUsuario(req.body);

        const {password, ...usuarioSinPassword} = nuevoUsuario.toJSON();

        res.status(201).json(usuarioSinPassword);
    } catch (error) {
        console.error("Error al crear el usuario:", error);

        if (error instanceof Error){
            return  res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: "Error creating usuario" });
    }
});

router.put("/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
        const actualizado = await usuarioService.actualizarUsuario(id, req.body);
        if (actualizado) {
            res.json({ message: "Usuario updated successfully" });
        }
        else {
            res.status(404).json({ message: "Usuario not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating usuario" });
    }
});

router.delete("/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
        const eliminado = await usuarioService.eliminarUsuario(id);
        if (eliminado) {
            res.json({ message: "Usuario deleted successfully" });
        } else {
            res.status(404).json({ message: "Usuario not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting usuario" });
    }
});


export default router;

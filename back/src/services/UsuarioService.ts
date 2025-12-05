import Usuarios from "../entities/Usuarios";
import UsuarioRepository, { UsuarioCreation } from "../repositories/UsuariosRepository";

export default class UsuarioService {
    private usuarioRepo: UsuarioRepository;

    constructor(usuarioRepo: UsuarioRepository) {
        this.usuarioRepo = usuarioRepo;
    }

    async consultarUsuarios(): Promise<Usuarios[]> {
        return await this.usuarioRepo.findAll();
    }

    async consultarUsuarioPorId(id: number): Promise<Usuarios | null> {
        return await this.usuarioRepo.findById(id);
    }

    async crearUsuario(usuarioData: UsuarioCreation): Promise<Usuarios> {
        return await this.usuarioRepo.create(usuarioData);
    }

    async actualizarUsuario(id: number, usuarioData: Partial<Usuarios>): Promise<boolean> {
        return await this.usuarioRepo.update(id, usuarioData);
    }

    async eliminarUsuario(id: number): Promise<boolean> {
        return await this.usuarioRepo.delete(id);
    }

    async cambiarPassword(id: number, oldPassword: string, newPassword: string): Promise<{ message: string }> {
        return await this.usuarioRepo.changePassword(id, oldPassword, newPassword);
    }



}
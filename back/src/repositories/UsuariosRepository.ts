import Usuarios, { UsuariosCreationAttributes } from "../entities/Usuarios";
import IRepositoryBase from "./IRepositoryBase";
import bcrypt from "bcrypt";

export type UsuarioCreation = UsuariosCreationAttributes;

export default class UsuarioRepository implements IRepositoryBase<Usuarios, UsuarioCreation>{
    async findAll(): Promise<Usuarios[]> {
        return await Usuarios.findAll();
    }

    async findById(id: number): Promise<Usuarios | null> {
        return await Usuarios.findByPk(id);
    }

    async create(item: UsuarioCreation): Promise<Usuarios> {
        if(!item.password) throw new Error("Password is required");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(item.password, salt);
        item.password = hashedPassword;

        if(item.email){
            const existingUser = await Usuarios.findOne({ where: { email: item.email } });
            if(existingUser){
                throw new Error("Email already in use");
            }
        }

        if(item.telefono){
            const existingPhone = await Usuarios.findOne({ where: { telefono: item.telefono } });
            if(existingPhone){
                throw new Error("Phone number already in use");
            }
        }
        return await Usuarios.create(item);
    }

    async update(id: number, item: Partial<Usuarios>): Promise<boolean> {
        const [updatedRows] = await Usuarios.update(item, { where: { id } });
        return updatedRows > 0;
    }

    async delete(id: number): Promise<boolean> {
        const deletedRows = await Usuarios.destroy({ where: { id } });
        return deletedRows > 0;
    }

    async changePassword(id:number, oldPassword:string, newPassword:string): Promise<{message: string}> {
        const usuario = await this.findById(id);
        if (!usuario) throw new Error("Usuario not found");

        const sonIguales = await bcrypt.compare(oldPassword, usuario.password);
        if (!sonIguales) throw new Error("Old password does not match");

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);
        usuario.password = hashedNewPassword;

        await this.update(id, { password: usuario.password });
        return { message: "Password changed successfully" };
    }
}
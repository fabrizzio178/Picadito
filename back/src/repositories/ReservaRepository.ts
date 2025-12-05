import Reservas, { ReservasCreationAttributes } from "../entities/Reservas";
import IRepositoryBase from "./IRepositoryBase";

export type ReservaCreation = ReservasCreationAttributes;

export default class ReservaRepository implements IRepositoryBase<Reservas, ReservaCreation> {
    async findAll(): Promise<Reservas[]> {
        return await Reservas.findAll({ include: ['usuario', 'estado' , 'cancha', 'turno'] });
    }

    async findById(id: number): Promise<Reservas | null> {
        return await Reservas.findByPk(id);
    }

    async create(item: ReservaCreation): Promise<Reservas> {
        return await Reservas.create(item);
    }

    async update(id: number, item: Partial<Reservas>): Promise<boolean> {
        const [updatedRows] = await Reservas.update(item, { where: { id } });
        return updatedRows > 0;
    }

    async delete(id: number): Promise<boolean> {
        const deletedRows = await Reservas.destroy({ where: { id } });
        return deletedRows > 0;
    }

    async getReservasByUsuarioId(usuarioId: number): Promise<Reservas[]> {
        return await Reservas.findAll({ where: { idUsuario: usuarioId  }, include: ['usuario', 'estado' , 'cancha', 'turno'] });
    }
}
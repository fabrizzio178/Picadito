import Cancha, { CanchaCreationAttributes } from "../entities/Cancha";
import IRepositoryBase from "./IRepositoryBase";

export type CanchaCreation = CanchaCreationAttributes;

export default class CanchaRepository implements IRepositoryBase<Cancha, CanchaCreation> {

    async findAll(): Promise<Cancha[]> {
        return await Cancha.findAll();
    }

    async findById(id: number): Promise<Cancha | null> {
        return await Cancha.findByPk(id);
    }

    async create(item: CanchaCreation): Promise<Cancha> {
        return await Cancha.create(item);
    }

    async update(id: number, item: Partial<Cancha>): Promise<boolean> {
        const [updatedRows] = await Cancha.update(item, { where: { id } });
        return updatedRows > 0;
    }

    async delete(id: number): Promise<boolean> {
        const deletedRows = await Cancha.destroy({ where: { id } });
        return deletedRows > 0;
    }
}

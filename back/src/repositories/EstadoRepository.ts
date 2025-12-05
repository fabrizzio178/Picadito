import Estado from "../entities/Estado";

export default class EstadoRepository{
    async findAll(): Promise<Estado[]> {
        return await Estado.findAll();
    }

    async findById(id: number): Promise<Estado | null> {
        return await Estado.findByPk(id);
    }
}
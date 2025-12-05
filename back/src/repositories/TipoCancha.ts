import TipoCancha from "../entities/TipoCancha";

export default class TipoCanchaRepository{
    async findAll(): Promise<TipoCancha[]> {
        return await TipoCancha.findAll();
    }

    async findById(id: number): Promise<TipoCancha | null> {
        return await TipoCancha.findByPk(id);
    }
}
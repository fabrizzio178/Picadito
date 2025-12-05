import Turnos from "../entities/Turnos";

export default class TurnoRepository{
    async findAll(): Promise<Turnos[]> {
        return await Turnos.findAll();
    }

    async findById(id: number): Promise<Turnos | null> {
        return await Turnos.findByPk(id);
    }
}
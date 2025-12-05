import { Op } from "sequelize";
import Cancha, { CanchaCreationAttributes } from "../entities/Cancha";
import Reservas from "../entities/Reservas";
import Turnos from "../entities/Turnos";
import CanchaRepository from "../repositories/CanchaRepository";

export default class CanchaService{
    private canchaRepository: CanchaRepository;

    constructor(canchaRepo: CanchaRepository){
        this.canchaRepository = canchaRepo;
    }

    async consultarCanchas(): Promise<Cancha[]>{
        return await this.canchaRepository.findAll();
    }

    async consultarCanchaPorId(id: number): Promise<Cancha | null>{
        return await this.canchaRepository.findById(id);
    }

    async crearCancha(canchaData: CanchaCreationAttributes): Promise<Cancha>{
        return await this.canchaRepository.create(canchaData);
    }

    async actualizarCancha(id: number, canchaData: Partial<Cancha>): Promise<boolean>{
        return await this.canchaRepository.update(id, canchaData);
    }

    async eliminarCancha(id: number): Promise<boolean>{
        return await this.canchaRepository.delete(id);
    }

    async obtenerTurnosDisponibles(idCancha: number, fecha: Date): Promise<any[]> {
        const fechaStr = fecha.toISOString().split("T")[0]; // YYYY-MM-DD

        const todosLosTurnos = await Turnos.findAll();

        const estadosQueBloquean = [2, 3]; // en_seña, reservada

        const reservasBloqueantes = await Reservas.findAll({
            where: {
                idCancha,
                fechaReserva: fechaStr,
                idEstado: {
                    [Op.in]: estadosQueBloquean
                }
            }
        });

        const turnosOcupados = reservasBloqueantes.map(r => r.idTurno);

        return todosLosTurnos.filter(
            turno => !turnosOcupados.includes(turno.id)
        );
    }



}
import TurnoRepository from "../repositories/TurnoRepository";


export default class TurnoService{
    private turnoRepo: TurnoRepository;

    constructor(turnoRepo: TurnoRepository){
        this.turnoRepo = turnoRepo;
    }

    async consultarTurnos(): Promise<any[]>{
        return await this.turnoRepo.findAll();
    }

    async consultarTurnoPorId(id: number): Promise<any | null>{
        return await this.turnoRepo.findById(id);
    }
}
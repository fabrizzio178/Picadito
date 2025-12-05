import TipoCancha from "../entities/TipoCancha";
import TipoCanchaRepository from "../repositories/TipoCancha";


export default class TipoCanchaService{
    private tipoCanchaRepository: TipoCanchaRepository;

    constructor(){
        this.tipoCanchaRepository = new TipoCanchaRepository();
    }

    async consultarTiposCanchas(): Promise<TipoCancha[]>{
        try{
            return await this.tipoCanchaRepository.findAll();
        } catch (error) {
            console.error("Error fetching tipos canchas:", error);
            throw error;
        }
    }
}
import { ReservaDTO } from "../dto/ReservaDTO";
import Cancha from "../entities/Cancha";
import Estado from "../entities/Estado";
import Reservas, {ReservasCreationAttributes} from "../entities/Reservas";
import Turnos from "../entities/Turnos";
import Usuarios from "../entities/Usuarios";
import ReservaRepository from "../repositories/ReservaRepository";

interface ReservaPayload extends ReservasCreationAttributes{
    cliente?: {
        nombre: string;
        email?: string;
        telefono: string;
    }
}

export default class ReservaService{
    private reservaRepository: ReservaRepository;

    constructor(reservaRepo: ReservaRepository){
        this.reservaRepository = reservaRepo;
    }

    async consultarReservas(): Promise<ReservaDTO[]>{
        try{
            const reservas = await this.reservaRepository.findAll();

            return reservas.map(reserva => ({
                id: reserva.id,
                fechaReserva: reserva.fechaReserva,
                idUsuario: reserva.idUsuario,
                idCancha: reserva.idCancha,
                idEstado: reserva.idEstado,
                idTurno: reserva.idTurno,
                usuario: {
                    id: reserva.usuario.id,
                    nombre: reserva.usuario.nombre,
                    apellido: reserva.usuario.apellido,
                    email: reserva.usuario.email,
                    telefono: reserva.usuario.telefono,
                    rol: reserva.usuario.rol
                },
                estado: reserva.estado,
                cancha: reserva.cancha,
                turno: reserva.turno
            }))


        } catch (error){
            console.error("Error fetching reservas:", error);
            throw error;
        }
    }

    async consultarReservaPorId(id: number): Promise<Reservas | null>{
        return await this.reservaRepository.findById(id);
    }

    async crearReserva(reservaData: ReservaPayload): Promise<Reservas> {
        const { fechaReserva, idCancha, idUsuario, idEstado, idTurno, cliente } = reservaData;

        // Validar que la fecha sea correcta
        if (!fechaReserva || isNaN(new Date(fechaReserva).getTime())) {
            throw new Error(`Fecha inválida: ${fechaReserva}`);
        }

        // Verificar claves foráneas
        const usuario = await Usuarios.findByPk(idUsuario);
        if (!usuario) throw new Error(`Usuario con id ${idUsuario} no existe`);

        const estado = await Estado.findByPk(idEstado);
        if (!estado) throw new Error(`Estado con id ${idEstado} no existe`);

        const cancha = await Cancha.findByPk(idCancha);
        if (!cancha) throw new Error(`Cancha con id ${idCancha} no existe`);

        const turno = await Turnos.findByPk(idTurno);
        if (!turno) throw new Error(`Turno con id ${idTurno} no existe`);

        // Todo validado, crear reserva
        try {
            const nuevaReserva = await this.reservaRepository.create({
                fechaReserva,
                idCancha,
                idUsuario,
                idEstado,
                idTurno
            });
            return nuevaReserva;
        } catch (error) {
            console.error("Error creating reserva:", error);
            throw error;
        }
    }

    async actualizarReserva(id: number, reservaData: Partial<Reservas>): Promise<boolean>{
        return await this.reservaRepository.update(id, reservaData);
    }

    async eliminarReserva(id: number): Promise<boolean>{
        return await this.reservaRepository.delete(id);
    }

    async consultarReservasPorUsuarioId(usuarioId: number): Promise<ReservaDTO[]> {
        try {
            const reservas = await this.reservaRepository.getReservasByUsuarioId(usuarioId);

            return reservas.map(reserva => ({
                id: reserva.id,
                fechaReserva: reserva.fechaReserva,
                idUsuario: reserva.idUsuario,
                idCancha: reserva.idCancha,
                idEstado: reserva.idEstado,
                idTurno: reserva.idTurno,
                usuario: {
                    id: reserva.usuario.id,
                    nombre: reserva.usuario.nombre,
                    apellido: reserva.usuario.apellido,
                    email: reserva.usuario.email,
                    rol: reserva.usuario.rol,
                    telefono: reserva.usuario.telefono
                },
                estado: reserva.estado,
                cancha: reserva.cancha,
                turno: reserva.turno
            }));
        } catch (error) {
            console.error("Error fetching reservas by usuarioId:", error);
            throw error;
        }
    }

    async actualizarEstadoReserva(id: number, idEstado: number): Promise<boolean> {
        return await this.reservaRepository.update(id, { idEstado });
    }

}
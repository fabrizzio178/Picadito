export interface ReservaDTO {
  id: number;
  fechaReserva: Date;
  idUsuario: number;
  idEstado: number;
  idCancha: number;
  idTurno: number;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  };
  estado: {
    id: number;
    nombre: string;
  };
  cancha: {
    id: number;
    nombre: string;
    ubicacion: string;
    precio: number;
    idTipo: number;
  };
  turno: {
    id: number;
    horaInicio: string;
    horaFin: string;
  };
}

import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import Usuarios from "./Usuarios";
import Estado from "./Estado";
import Cancha from "./Cancha";
import { Optional } from "sequelize";
import Turnos from "./Turnos";

export interface ReservasAttributes {
    id: number;
    fechaReserva: Date;
    idCancha: number;
    idUsuario: number;
    idEstado: number;
    idTurno: number;
}

export type ReservasCreationAttributes = Optional<ReservasAttributes, "id">;

@Table({
    tableName: "Reservas",
    timestamps: false,
})
export default class Reservas extends Model<ReservasAttributes, ReservasCreationAttributes> implements ReservasAttributes {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    })
    id!: number;

    @Column({
        type: DataType.DATEONLY,
        allowNull: false,
        field: "fecha_reserva"
    })
    fechaReserva!: Date;


    @ForeignKey(() => Usuarios)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "usuarioId"
    })
    idUsuario!: number;

    @ForeignKey(() => Estado)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "estadoId"
    })
    idEstado!: number;

    @ForeignKey(() => Cancha)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "canchaId"
    })
    idCancha!: number;

    @ForeignKey(() => Turnos)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "turnoId"
    })
    idTurno!: number;

    @BelongsTo(() => Usuarios, "idUsuario")
    usuario!: Usuarios;

    @BelongsTo(() => Estado, "idEstado")
    estado!: Estado;

    @BelongsTo(() => Cancha, "idCancha")
    cancha!: Cancha;

    @BelongsTo(() => Turnos, "idTurno")
    turno!: Turnos;

}
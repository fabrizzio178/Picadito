import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "Turnos",
    timestamps: false,
})
export default class Turnos extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    })
    id!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "hora_inicio"
    })
    horaInicio!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "hora_fin"
    })
    horaFin!: string;

}
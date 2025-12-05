import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "TipoCancha",
    timestamps: false,
})
export default class TipoCancha extends Model {
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
        field: "nombreTipo"
    })
    nombre!: string;

}
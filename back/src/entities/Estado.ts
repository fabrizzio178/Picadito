import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "Estado",
    timestamps: false,
})
export default class Estado extends Model {
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
    })
    nombre!: string;
}
import { Optional } from "sequelize";
import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import TipoCancha from "./TipoCancha";

export interface CanchaAttributes {
    id: number;
    nombre: string;
    ubicacion: string;
    precio: number;
    idTipo: number;
}

export type CanchaCreationAttributes = Optional<CanchaAttributes, "id">;

@Table({
    tableName: "Cancha",
    timestamps: false,
})
export default class Cancha extends Model<CanchaAttributes, CanchaCreationAttributes> implements CanchaAttributes {
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

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    ubicacion!: string;

    @Column({
        type: DataType.REAL,
        allowNull: false,
    })
    precio!: number;

    @ForeignKey(() => TipoCancha)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    idTipo!: number;

    @BelongsTo(() => TipoCancha, "idTipo")
    tipoCancha!: TipoCancha;


}
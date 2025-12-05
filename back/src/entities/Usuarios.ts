import { Optional } from "sequelize";
import { Table, Column, Model, DataType } from "sequelize-typescript";

export interface UsuariosAttributes {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    rol: string;
    telefono: string;
}

export type UsuariosCreationAttributes = Optional<UsuariosAttributes, "id">;

@Table({
    tableName: "Usuarios",
    timestamps: false,
})

export default class Usuarios extends Model<UsuariosAttributes, UsuariosCreationAttributes> implements UsuariosAttributes {
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
    apellido!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'contraseña'
    })
    password!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    rol!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: "telefono"
    })
    telefono!: string;

}
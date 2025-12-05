import { Sequelize  } from "sequelize-typescript";
import Cancha from "../entities/Cancha";
import TipoCancha from "../entities/TipoCancha";
import Estado from "../entities/Estado";
import Reservas from "../entities/Reservas";
import Usuarios from "../entities/Usuarios";

import path from "path";
import Turnos from "../entities/Turnos";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.resolve(__dirname, "../data/futbolito.db"),
  models: [
    Cancha,
    TipoCancha,
    Reservas,
    Turnos,
    Estado,
    Usuarios
  ],
  logging: console.log,
  
});
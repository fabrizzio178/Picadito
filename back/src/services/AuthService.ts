import Usuarios from "../entities/Usuarios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default class AuthService {
  async login(email: string, password: string) {
    const usuario = await Usuarios.findOne({ where: { email } });

    if (!usuario) {
      throw new Error("Invalid email or password");
    }

    const sonIguales = await bcrypt.compare(password, usuario.password);
    if (!sonIguales) {
      throw new Error("Invalid email or password");
    }

    const accessToken = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "3h" }
    );

    return {
      token: accessToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
      },
    };
  }
 // los logouts se hacen del front, porque borra el token guardado de la cookie. 

}

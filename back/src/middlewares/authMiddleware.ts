import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function verificarToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const tokenParts = token.split(" ")[1];

  try {
    const decoded = jwt.verify(
      tokenParts,
      process.env.JWT_SECRET || "defaultsecret"
    ) as any;

    req.user = {
      id: decoded.id,
      rol: decoded.rol,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function verificarRol(rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "No user information found" });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        message: "Access forbidden: insufficient permissions",
      });
    }

    next();
  };
}

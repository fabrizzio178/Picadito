declare namespace Express {
    export interface Request {
        user?: {
            id: number;
            rol: string;
        };
    }
}
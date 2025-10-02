import { ObjectId } from "mongodb";

export class Calificacion {
    constructor(
        public consulta: ObjectId,
        public valoracion: number
    ) {}
}
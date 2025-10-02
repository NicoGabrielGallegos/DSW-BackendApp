import { ObjectId } from "mongodb";

export class Calificacion {
    constructor(
        public consulta: ObjectId,
        public valoracion: number,
        public _id?: ObjectId,
    ) {}
}
import { ObjectId } from "mongodb";

export class Consulta {
    constructor(
        public dictado: ObjectId,
        public horaInicio: Date,
        public horaFin: Date,
        public estado: string,
        public _id?: ObjectId,
    ) {}
}
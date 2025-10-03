import { ObjectId } from "mongodb";

export enum EstadoConsulta {
    Programada = "Programada",
    Realizada = "Realizada",
    Cancelada = "Cancelada"
}

export class Consulta {
    constructor(
        public dictado: ObjectId,
        public horaInicio: Date,
        public horaFin: Date,
        public estado: string,
        public _id?: ObjectId,
    ) {}
}
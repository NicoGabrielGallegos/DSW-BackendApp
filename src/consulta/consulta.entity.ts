import { ObjectId } from "mongodb";
import { Dictado } from "../dictado/dictado.entity.js";

export enum EstadoConsulta {
    Programada = "Programada",
    Realizada = "Realizada",
    Cancelada = "Cancelada"
}

export class Consulta {
    constructor(
        public dictado: ObjectId | Dictado,
        public horaInicio: Date,
        public horaFin: Date,
        public estado: string,
        public _id?: ObjectId,
    ) {}
}
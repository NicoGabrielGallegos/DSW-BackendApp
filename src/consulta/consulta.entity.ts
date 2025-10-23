import { ObjectId } from "mongodb";
import { Dictado } from "../dictado/dictado.entity.js";
import { DateFilter } from "../shared/types/DateFilter.js";

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

export interface ConsultaFilter {
    dictado?: ObjectId,
    horaInicio?: DateFilter
    horaFin?: DateFilter,
    estado?: string
}
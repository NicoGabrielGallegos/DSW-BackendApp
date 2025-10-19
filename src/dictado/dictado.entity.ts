import { ObjectId } from "mongodb";
import { Docente } from "../docente/docente.entity.js";
import { Materia } from "../materia/materia.entity.js";

export class Dictado {
    constructor(
        public docente: ObjectId | Docente,
        public materia: ObjectId | Materia,
        public _id?: ObjectId,
    ) {}
}
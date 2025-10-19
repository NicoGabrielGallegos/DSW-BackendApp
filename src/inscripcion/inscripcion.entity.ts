import { ObjectId } from "mongodb";
import { Alumno } from "../alumno/alumno.entity.js";
import { Consulta } from "../consulta/consulta.entity.js";

export class Inscripcion {
    constructor(
        public alumno: ObjectId | Alumno,
        public consulta: ObjectId | Consulta,
        public _id?: ObjectId,
    ) {}
}
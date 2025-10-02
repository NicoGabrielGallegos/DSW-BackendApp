import { ObjectId } from "mongodb";

export class Inscripcion {
    constructor(
        public alumno: ObjectId,
        public consulta: ObjectId,
        public _id?: ObjectId,
    ) {}
}
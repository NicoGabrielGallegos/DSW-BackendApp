import { ObjectId } from "mongodb";

export class Docente {
    constructor(
        public legajo: string,
        public nombre: string,
        public apellido: string,
        public correo: string,
        public _id?: ObjectId,
    ) {}
}
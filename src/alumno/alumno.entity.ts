import { ObjectId } from "mongodb";

export class Alumno {
    constructor(
        public legajo: string,
        public nombre: string,
        public apellido: string,
        public correo: string,
        public password: string,
        public _id?: ObjectId,
    ) {}
}
import { ObjectId } from "mongodb";
import crypto from "node:crypto"

export class Alumno {
    constructor(
        public legajo: string,
        public nombre: string,
        public apellido: string,
        public correo: string,
        public _id?: ObjectId,
    ) {}
}
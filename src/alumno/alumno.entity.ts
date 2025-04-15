import crypto from "node:crypto"

export class Alumno {
    constructor(
        public nombre:string,
        public apellido:string,
        public correo:string,
        public legajoAlumno:crypto.UUID = crypto.randomUUID()
    ) {}
}
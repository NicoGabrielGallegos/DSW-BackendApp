import { ObjectId } from "mongodb";

export enum Permiso {
    CRUD_ALUMNO = 1,
    CRUD_DOCENTE,
    CRUD_MATERIA,
    CRUD_DICTADO,
    CRUD_CONSULTA,
    CRUD_INSCRIPCION,
}

export class Administrador {
    constructor(
        public nombre: string,
        public apellido: string,
        public correo: string,
        public password: string,
        public permisos: Permiso[],
        public _id?: ObjectId,
    ) {}
}
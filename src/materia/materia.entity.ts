import { ObjectId } from "mongodb";

export class Materia {
    constructor(
        public descripcion: string,
        public _id?: ObjectId,
    ) {}
}
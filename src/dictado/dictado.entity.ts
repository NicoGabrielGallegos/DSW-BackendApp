import { ObjectId } from "mongodb";

export class Dictado {
    constructor(
        public docente: ObjectId,
        public materia: ObjectId,
        public _id?: ObjectId,
    ) {}
}
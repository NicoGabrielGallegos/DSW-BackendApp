import { Repository } from "../shared/repository.js";
import { Alumno } from "./alumno.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId } from "mongodb";
import { Inscripcion } from "../inscripcion/inscripcion.entity.js";

const alumnos = db.collection<Alumno>("alumnos")
const inscripciones = db.collection<Inscripcion>("inscripciones")

export class AlumnoRepository implements Repository<Alumno> {

    public async findAll(): Promise<Alumno[] | undefined> {
        return await alumnos.find().toArray()
    }

    public async findOne(filter: { id: string }): Promise<Alumno | undefined> {
        const _id = new ObjectId(filter.id)
        return await alumnos.findOne({ _id }) || undefined
    }

    public async add(item: Alumno): Promise<Alumno | undefined> {
        item._id = (await alumnos.insertOne(item)).insertedId
        return item
    }

    public async update(filter: { id: string }, item: Alumno): Promise<Alumno | undefined> {
        const _id = new ObjectId(filter.id)
        return (
            await alumnos.findOneAndUpdate({ _id },
                { $set: item },
                { returnDocument: "after" })
        ) || undefined
    }

    public async delete(filter: { id: string }): Promise<Alumno | undefined> {
        const _id = new ObjectId(filter.id)
        return await alumnos.findOneAndDelete({ _id }) || undefined
    }

    public async findOneByFilter(filter: { legajo?: string, nombre?: string, apellido?: string, correo?: string }): Promise<Alumno | undefined> {
        return await alumnos.findOne(filter) || undefined
    }

    public async findAllByFilter(filter: { legajo?: string, nombre?: string, apellido?: string, correo?: string }): Promise<Alumno[] | undefined> {
        return await alumnos.find(filter).toArray() || undefined
    }

    public async findAllByConsulta(filter: { consulta: ObjectId }): Promise<Alumno[]> {
        const alumnosByConsulta: Alumno[] = [];
        (await inscripciones.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "alumnos",
                    localField: "alumno",
                    foreignField: "_id",
                    as: "alumno"
                }
            },
            {
                $project: { "alumno": 1 }
            }

        ]).toArray()).forEach((inscripcion) => {
            alumnosByConsulta.push(inscripcion.alumno[0])
        });

        return alumnosByConsulta
    }
}
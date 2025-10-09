import { Repository } from "../shared/repository.js";
import { Inscripcion } from "./inscripcion.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId } from "mongodb";

const inscripciones = db.collection<Inscripcion>("inscripciones")

export class InscripcionRepository implements Repository<Inscripcion> {

    public async findAll(): Promise<Inscripcion[]> {
        return await inscripciones.find().toArray()
    }

    public async findOne(filter: { id: string }): Promise<Inscripcion | undefined> {
        const _id = new ObjectId(filter.id)
        return await inscripciones.findOne({ _id }) || undefined
    }

    public async add(item: Inscripcion): Promise<Inscripcion | undefined> {
        item._id = (await inscripciones.insertOne(item)).insertedId
        return item
    }

    public async update(filter: { id: string }, item: Inscripcion): Promise<Inscripcion | undefined> {
        const _id = new ObjectId(filter.id)
        return (
            await inscripciones.findOneAndUpdate({ _id },
                { $set: item },
                { returnDocument: "after" })
        ) || undefined
    }

    public async delete(filter: { id: string }): Promise<Inscripcion | undefined> {
        const _id = new ObjectId(filter.id)
        return await inscripciones.findOneAndDelete({ _id }) || undefined
    }

    public async findOneByFilter(filter: { alumno?: ObjectId, consulta?: ObjectId }): Promise<Inscripcion | undefined> {
        return await inscripciones.findOne(filter) || undefined
    }

    public async findAllByFilter(filter: { alumno?: ObjectId, consulta?: ObjectId }): Promise<Inscripcion[]> {
        return await inscripciones.find(filter).toArray() || undefined
    }

    public async findAllByAlumnoInHorario(filter: { alumno: ObjectId, horaInicio: Date, horaFin: Date }): Promise<Inscripcion[]> {
        const inscripcionesByAlumnoInHorario: Inscripcion[] = [];
        (await inscripciones.aggregate([
            {
                $match: { alumno: filter.alumno }
            },
            {
                $lookup: {
                    from: "consultas",
                    localField: "consulta",
                    foreignField: "_id",
                    as: "consulta"
                }
            },
            {
                $match: {
                    consulta: { $elemMatch: { horaInicio: { $lt: filter.horaFin }, horaFin: { $gt: filter.horaInicio } } }
                }
            },
            {
                $project: { "alumno": 1, "consulta": 1 }
            }
        ]).toArray()).forEach((inscripcion) => {
            inscripcionesByAlumnoInHorario.push({ alumno: inscripcion.alumno, consulta: inscripcion.consulta[0]._id, _id: inscripcion._id })
        });

        return inscripcionesByAlumnoInHorario
    }

    public async deleteByAlumno(filter: { alumno: ObjectId }): Promise<void> {
        await inscripciones.deleteMany(filter)
    }

    public async deleteByConsulta(filter: { consulta: ObjectId }): Promise<void> {
        await inscripciones.deleteMany(filter)
    }
}
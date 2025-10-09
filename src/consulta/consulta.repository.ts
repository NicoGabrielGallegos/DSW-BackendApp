import { Repository } from "../shared/repository.js";
import { Consulta } from "./consulta.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId } from "mongodb";

const consultas = db.collection<Consulta>("consultas")

export class ConsultaRepository implements Repository<Consulta> {

    public async findAll(): Promise<Consulta[] | undefined> {
        return await consultas.find().toArray()
    }

    public async findOne(filter: { id: string }): Promise<Consulta | undefined> {
        const _id = new ObjectId(filter.id)
        return await consultas.findOne({ _id }) || undefined
    }

    public async add(item: Consulta): Promise<Consulta | undefined> {
        item._id = (await consultas.insertOne(item)).insertedId
        return item
    }

    public async update(filter: { id: string }, item: Consulta): Promise<Consulta | undefined> {
        const _id = new ObjectId(filter.id)
        return (
            await consultas.findOneAndUpdate({ _id },
                { $set: item },
                { returnDocument: "after" })
        ) || undefined
    }

    public async delete(filter: { id: string }): Promise<Consulta | undefined> {
        const _id = new ObjectId(filter.id)
        return await consultas.findOneAndDelete({ _id }) || undefined
    }

    public async findOneByFilter(filter: { dictado?: ObjectId, horaInicio?: Date | { $lt?: Date, $gt?: Date }, horaFin?: Date | { $lt?: Date, $gt?: Date }, estado?: string }): Promise<Consulta | undefined> {
        return await consultas.findOne(filter) || undefined
    }

    public async findAllByFilter(filter: { dictado?: ObjectId, horaInicio?: Date | { $lt?: Date, $gt?: Date }, horaFin?: Date | { $lt?: Date, $gt?: Date }, estado?: string }): Promise<Consulta[]> {
        return await consultas.find(filter).toArray() || undefined
    }

    public async findAllInHorario(filter: { horaInicio: Date, horaFin: Date }): Promise<Consulta[]> {
        return await consultas.find({
            horaInicio: { $lt: filter.horaFin },
            horaFin: { $gt: filter.horaInicio }
        }).toArray()
    }

    public async findAllByDictadoInHorario(filter: { dictado: ObjectId, horaInicio: Date, horaFin: Date }): Promise<Consulta[]> {
        return await consultas.find({
            dictado: filter.dictado,
            horaInicio: { $lt: filter.horaFin },
            horaFin: { $gt: filter.horaInicio }
        }).toArray()
    }

    public async findAllByDocenteInHorario(filter: { docente: ObjectId, horaInicio: Date, horaFin: Date }): Promise<Consulta[]> {
        const consultasByDocenteInHorario: Consulta[] = [];
        (await consultas.aggregate([
            {
                $match: {
                    horaInicio: { $lt: filter.horaFin },
                    horaFin: { $gt: filter.horaInicio }
                }
            },
            {
                $lookup: {
                    from: "dictados",
                    localField: "dictado",
                    foreignField: "_id",
                    as: "dictado",
                    pipeline: [
                        {
                            $project: {
                                docente: 1
                            }
                        }
                    ]
                }
            },
            {
                $match: {
                    dictado: { $elemMatch: { docente: filter.docente } }
                }
            },
        ]).toArray()).forEach((consulta) => {
            consultasByDocenteInHorario.push({ dictado: consulta.dictado._id, horaInicio: consulta.horaInicio, horaFin: consulta.horaFin, estado: consulta.estado })
        });

        return consultasByDocenteInHorario
    }
}
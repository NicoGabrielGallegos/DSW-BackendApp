import { Repository } from "../shared/repository.js";
import { Consulta } from "./consulta.entity.js";
import { db } from "../shared/db/connection.js";
import { AggregationCursor, ObjectId } from "mongodb";
import { DateFilter } from "../shared/types/DateFilter.js";

const consultas = db.collection<Consulta>("consultas")


export class ConsultaRepository implements Repository<Consulta> {

    private getRangoHorario(filter: { horaInicio?: DateFilter, horaFin?: DateFilter }): { horaInicio?: DateFilter, horaFin?: DateFilter } {
        const rangoHorario: { horaInicio?: DateFilter, horaFin?: DateFilter } = {}
        if (filter.horaInicio) rangoHorario.horaInicio = filter.horaInicio
        if (filter.horaFin) rangoHorario.horaFin = filter.horaFin
        return rangoHorario
    }

    public async findAll(options: { page: number, limit: number } = { page: 1, limit: 0 }): Promise<Consulta[]> {
        return await consultas.find().sort({ horaInicio: 1, horaFin: 1, dictado: 1 }).skip((options.page - 1) * options.limit).limit(options.limit).toArray()
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

    public async findOneByFilter(filter: { dictado?: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter, estado?: string }): Promise<Consulta | undefined> {
        return await consultas.findOne(filter) || undefined
    }

    public async findAllByFilter(filter: { dictado?: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter, estado?: string }, options: { page: number, limit: number } = { page: 1, limit: 0 }): Promise<Consulta[]> {
        return await consultas.find(filter).sort({ horaInicio: 1, horaFin: 1, dictado: 1 }).skip((options.page - 1) * options.limit).limit(options.limit).toArray()
    }

    public async findAllByDocente(filter: { docente: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter }, options: { page: number, limit: number } = { page: 1, limit: 0 }): Promise<Consulta[]> {
        const consultasByDocente: Consulta[] = [];

        const cursor = consultas.aggregate([
            {
                $match: this.getRangoHorario(filter)
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
        ]).sort({ horaInicio: 1, horaFin: 1, dictado: 1 })

        // Aplicar filtros de paginación solo si el límite es positivo
        if (options.limit > 0) {
            // Aplicar skip solo si la página es válida
            if (options.page > 1) {
                cursor.skip((options.page - 1) * options.limit)
            }
            cursor.limit(options.limit)
        }

        (await cursor.toArray()).forEach((consulta) => {
            consultasByDocente.push({ _id: consulta._id, dictado: consulta.dictado[0]._id, horaInicio: consulta.horaInicio, horaFin: consulta.horaFin, estado: consulta.estado })
        });

        return consultasByDocente
    }

    public async findAllByMateria(filter: { materia: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter }, options: { page: number, limit: number } = { page: 1, limit: 0 }): Promise<Consulta[]> {
        const consultasByMateria: Consulta[] = [];
        const cursor = consultas.aggregate([
            {
                $match: this.getRangoHorario(filter)
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
                                materia: 1
                            }
                        }
                    ]
                }
            },
            {
                $match: {
                    dictado: { $elemMatch: { materia: filter.materia } }
                }
            },
        ]).sort({ horaInicio: 1, horaFin: 1, dictado: 1 })

        // Aplicar filtros de paginación solo si el límite es positivo
        if (options.limit > 0) {
            // Aplicar skip solo si la página es válida
            if (options.page > 1) {
                cursor.skip((options.page - 1) * options.limit)
            }
            cursor.limit(options.limit)
        }

        (await cursor.toArray()).forEach((consulta) => {
            consultasByMateria.push({ _id: consulta._id, dictado: consulta.dictado[0]._id, horaInicio: consulta.horaInicio, horaFin: consulta.horaFin, estado: consulta.estado })
        });

        return consultasByMateria
    }

    public async count(): Promise<number> {
        return await consultas.countDocuments()
    }

    public async countByFilter(filter: { dictado?: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter, estado?: string }): Promise<number> {
        return await consultas.countDocuments(filter)
    }

    public async countByDocente(filter: { docente: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter }): Promise<number> {
        return (await consultas.aggregate([
            {
                $match: this.getRangoHorario(filter)
            },
            {
                $lookup: {
                    from: "dictados",
                    localField: "dictado",
                    foreignField: "_id",
                    as: "dictado",
                }
            },
            {
                $match: {
                    dictado: { $elemMatch: { docente: filter.docente } }
                }
            },
            {
                $count: "count"
            }
        ]).toArray())[0]?.count || 0;
    }

    public async countByMateria(filter: { materia: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter }): Promise<number> {
        return (await consultas.aggregate([
            {
                $match: this.getRangoHorario(filter)
            },
            {
                $lookup: {
                    from: "dictados",
                    localField: "dictado",
                    foreignField: "_id",
                    as: "dictado",
                }
            },
            {
                $match: {
                    dictado: { $elemMatch: { materia: filter.materia } }
                }
            },
            {
                $count: "count"
            }
        ]).toArray())[0]?.count || 0;
    }
}
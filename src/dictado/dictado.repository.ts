import { addPopulationToPipeline, pagination, populateHas, Repository } from "../shared/repository.js";
import { Dictado } from "./dictado.entity.js";
import { db } from "../shared/db/connection.js";
import { Document, ObjectId, Sort } from "mongodb";

const dictados = db.collection<Dictado>("dictados")

const defaultSort: Sort = { materia: 1, docente: 1 }

export class DictadoRepository implements Repository<Dictado> {

    public async findAll(options: { page: number, limit: number, sort?: Sort, populate?: string[] } = { page: 1, limit: 0 }): Promise<Dictado[]> {
        // Poblar si es solicitado
        if (options.populate && options.populate.length !== 0) {
            const pipeline: Document[] = []
            // Poblar con docente
            if (options.populate.includes("docente"))
                addPopulationToPipeline(pipeline, { from: "docentes", field: "docente" })
            // Poblar con materia
            if (options.populate.includes("materia"))
                addPopulationToPipeline(pipeline, { from: "materias", field: "materia" })

            const cursor = pagination(dictados.aggregate(pipeline).sort(options.sort || defaultSort), options).toArray()
            return await cursor as Dictado[]
        }

        // Sino, devolver sin poblar
        return await dictados.find().sort(options.sort || defaultSort).skip((options.page - 1) * options.limit).limit(options.limit).toArray()
    }

    public async findOne(filter: { id: string }, options: { populate?: string[] } = {}): Promise<Dictado | undefined> {
        const _id = new ObjectId(filter.id)
        const pipeline: Document[] = [{ $match: { _id } }]
        // Poblar si es solicitado
        if (options.populate && options.populate.length !== 0) {
            // Poblar con docente
            if (options.populate.includes("docente"))
                addPopulationToPipeline(pipeline, { from: "docentes", field: "docente" })
            // Poblar con materia
            if (options.populate.includes("materia"))
                addPopulationToPipeline(pipeline, { from: "materias", field: "materia" })

        }
        pipeline.push({ $limit: 1 })
        return (await dictados.aggregate(pipeline).toArray())[0] as Dictado || undefined
    }

    public async add(item: Dictado, options: { populate?: string[] } = {}): Promise<Dictado | undefined> {
        item._id = (await dictados.insertOne(item)).insertedId
        return await this.findOne({ id: item._id.toString() }, options)
    }

    public async update(filter: { id: string }, item: Dictado, options: { populate?: string[] } = {}): Promise<Dictado | undefined> {
        const dictado = await this.findOne(filter, options)
        if (!dictado) return undefined
        const _id = new ObjectId(filter.id)
        await dictados.updateOne({ _id }, { $set: item })
        return dictado
    }

    public async delete(filter: { id: string }, options: { populate?: string[] } = {}): Promise<Dictado | undefined> {
        const dictado = await this.findOne(filter, options)
        if (!dictado) return undefined
        const _id = new ObjectId(filter.id)
        await dictados.deleteOne({ _id })
        return dictado
    }

    public async findOneByFilter(filter: { docente?: ObjectId, materia?: ObjectId }, options: { populate?: string[] } = {}): Promise<Dictado | undefined> {
        const pipeline: Document[] = [{ $match: filter }]
        // Poblar si es solicitado
        if (options.populate && options.populate.length !== 0) {
            // Poblar con docente
            if (options.populate.includes("docente"))
                addPopulationToPipeline(pipeline, { from: "docentes", field: "docente" })
            // Poblar con materia
            if (options.populate.includes("materia"))
                addPopulationToPipeline(pipeline, { from: "materias", field: "materia" })

        }
        pipeline.push({ $limit: 1 })
        return (await dictados.aggregate(pipeline).toArray())[0] as Dictado || undefined
    }

    public async findAllByFilter(
        filter: { docente?: ObjectId, materia?: ObjectId },
        options: { page: number, limit: number, sort?: Sort, populate?: string[] } = { page: 1, limit: 0 }
    ): Promise<Dictado[]> {
        // Poblar si es solicitado
        if (options.populate && options.populate.length !== 0) {
            const pipeline: Document[] = [{ $match: filter }]
            // Poblar con docente
            if (options.populate.includes("docente"))
                addPopulationToPipeline(pipeline, { from: "docentes", field: "docente" })
            // Poblar con materia
            if (options.populate.includes("materia"))
                addPopulationToPipeline(pipeline, { from: "materias", field: "materia" })

            const cursor = pagination(dictados.aggregate(pipeline).sort(options.sort || defaultSort), options).toArray()
            return await cursor as Dictado[]
        }

        // Sino, devolver sin poblar
        return await dictados.find(filter).sort(options.sort || defaultSort).skip((options.page - 1) * options.limit).limit(options.limit).toArray() || undefined
    }

    public async deleteByDocente(filter: { docente: ObjectId }): Promise<void> {
        await dictados.deleteMany(filter)
    }

    public async deleteByMateria(filter: { materia: ObjectId }): Promise<void> {
        await dictados.deleteMany(filter)
    }

    public async count(): Promise<number> {
        return await dictados.countDocuments()
    }

    public async countByFilter(filter: { docente?: ObjectId, materia?: ObjectId }): Promise<number> {
        return await dictados.countDocuments(filter)
    }
}
import { Repository } from "../shared/repository.js";
import { Administrador } from "./administrador.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId, Sort, SortDirection } from "mongodb";

const administradores = db.collection<Administrador>("administradores")

const defaultSort: Sort = { _id: 1 }

export class AdministradorRepository implements Repository<Administrador> {

    public async findAll(): Promise<Administrador[]> {
        return await administradores.find().toArray()
    }

    public async findOne(filter: { id: string }): Promise<Administrador | undefined> {
        const _id = new ObjectId(filter.id)
        return await administradores.findOne({ _id }) || undefined
    }

    public async add(item: Administrador): Promise<Administrador | undefined> {
        return undefined
    }

    public async update(): Promise<Administrador | undefined> {
        return undefined
    }

    public async delete(filter: { id: string }): Promise<Administrador | undefined> {
        return undefined
    }

    public async findOneByFilter(filter: { nombre?: string, apellido?: string, correo?: string }): Promise<Administrador | undefined> {
        return await administradores.findOne(filter) || undefined
    }

    public async count(): Promise<number> {
        return await administradores.countDocuments()
    }

    public async countByFilter(filter: { nombre?: string, apellido?: string, correo?: string }): Promise<number> {
        return await administradores.countDocuments(filter)
    }

}
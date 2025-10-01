import { Request, Response, NextFunction } from "express";
import { DocenteRepository } from "./docente.repository.js";
import { Docente } from "./docente.entity.js";

const repository = new DocenteRepository()

function sanitizeDocenteInput(req: Request, _res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        legajo: req.body.legajo,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        correo: req.body.correo
    }

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if(req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })
    next()
}

async function findAll(_req: Request, res: Response) {
    res.json({data: await repository.findAll()})
}

async function findOne(req: Request, res: Response) {
    const docente = await repository.findOne({id: req.params.id})
    if (!docente) {
        res.status(404).send({message: "Docente no encontrado"})
        return
    }
    res.json({data: docente})
}

async function add(req: Request, res: Response) {
    const {legajo, nombre, apellido, correo} = req.body.sanitizedInput
    const docenteInput = new Docente(legajo, nombre, apellido, correo)
    const docente = await repository.add(docenteInput)
    res.status(201).send({message: "Docente creado con éxito", data: docente})
}

async function update(req: Request, res: Response) {
    const docente = await repository.update({id: req.params.id}, req.body.sanitizedInput)
    if (!docente) {
        res.status(404).send({message: "Docente no encontrado"})
        return
    }
    res.status(201).send({message: "Docente modificado con éxito", data: docente})
}

async function remove(req: Request, res: Response) {
    const docente = await repository.delete({id: req.params.id})
    if (!docente) {
        res.status(404).send({message: "Docente no encontrado"})
        return
    }
    res.status(200).send({message: "Docente borrado con éxito", data: docente})
}

export {sanitizeDocenteInput, findAll, findOne, add, update, remove}
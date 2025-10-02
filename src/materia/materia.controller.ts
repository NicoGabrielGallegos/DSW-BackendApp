import { Request, Response, NextFunction } from "express"
import { MateriaRepository } from "./materia.repository.js"
import { Materia } from "./materia.entity.js"

const repository = new MateriaRepository()

function sanitizeMateriaInput(req: Request, _res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        descripcion: req.body.descripcion
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
    const materia = await repository.findOne({id: req.params.id})
    if (!materia) {
        res.status(404).send({message: "Materia no encontrada"})
        return
    }
    res.json({data: materia})
}

async function add(req: Request, res: Response) {
    const {descripcion} = req.body.sanitizedInput
    const materiaInput = new Materia(descripcion)
    const materia = await repository.add(materiaInput)
    res.status(201).send({message: "Materia creada con éxito", data: materia})
}

async function update(req: Request, res: Response) {
    const materia = await repository.update({id: req.params.id}, req.body.sanitizedInput)
    if (!materia) {
        res.status(404).send({message: "Materia no encontrada"})
        return
    }
    res.status(201).send({message: "Materia modificada con éxito", data: materia})
}

async function remove(req: Request, res: Response) {
    const materia = await repository.delete({id: req.params.id})
    if (!materia) {
        res.status(404).send({message: "Materia no encontrada"})
        return
    }
    res.status(200).send({message: "Materia borrada con éxito", data: materia})
}

export {sanitizeMateriaInput, findAll, findOne, add, update, remove}
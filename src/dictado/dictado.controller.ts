import { Request, Response, NextFunction } from "express"
import { DictadoRepository } from "./dictado.repository.js"
import { Dictado } from "./dictado.entity.js"
import { ObjectId } from "mongodb"

const repository = new DictadoRepository()

function sanitizeDictadoInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        docente: req.body.docente,
        materia: req.body.materia
    }

    const {docente, materia} = req.body.sanitizedInput

    // Verificar docente
    // Chequear undefined solo con el método POST
    if (docente !== undefined || req.method === "POST") {
        // Si es un id válido
        if (ObjectId.isValid(docente))  {
            req.body.sanitizedInput.docente = ObjectId.createFromHexString(docente)
        } else {
            res.status(400).send({message: "El id de docente ingresado no es válido"})
            return
        }
    }

    // Verificar materia
    // Chequear undefined solo con el método POST
    if (materia !== undefined || req.method === "POST") {
        // Si es un id válido
        if (ObjectId.isValid(materia))  {
            req.body.sanitizedInput.materia = ObjectId.createFromHexString(materia)
        } else {
            res.status(400).send({message: "El id de materia ingresado no es válido"})
            return
        }
    }

    // Eliminar keys sin valores asignados
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
    const dictado = await repository.findOne({id: req.params.id})
    if (!dictado) {
        res.status(404).send({message: "Dictado no encontrado"})
        return
    }
    res.json({data: dictado})
}

async function add(req: Request, res: Response) {
    const {docente, materia} = req.body.sanitizedInput
    const dictadoInput = new Dictado(docente, materia)
    const dictado = await repository.add(dictadoInput)
    res.status(201).send({message: "Dictado creado con éxito", data: dictado})
}

async function update(req: Request, res: Response) {
    const dictado = await repository.update({id: req.params.id}, req.body.sanitizedInput)
    if (!dictado) {
        res.status(404).send({message: "Dictado no encontrado"})
        return
    }
    res.status(201).send({message: "Dictado modificado con éxito", data: dictado})
}

async function remove(req: Request, res: Response) {
    const dictado = await repository.delete({id: req.params.id})
    if (!dictado) {
        res.status(404).send({message: "Dictado no encontrado"})
        return
    }
    res.status(200).send({message: "Dictado borrado con éxito", data: dictado})
}

export {sanitizeDictadoInput, findAll, findOne, add, update, remove}
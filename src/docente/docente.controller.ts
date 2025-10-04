import { Request, Response, NextFunction } from "express";
import { DocenteRepository } from "./docente.repository.js";
import { Docente } from "./docente.entity.js";
import { isValidEmail } from "../shared/validations.js";

const repository = new DocenteRepository()

function extractInput(req: Request, res: Response, next: NextFunction) {
    req.body.input = {
        legajo: req.body.legajo,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        correo: req.body.correo
    }
    next()
}

function assureCompleteInput(req: Request, res: Response, next: NextFunction) {
    let error_message = "Entrada incompleta. Propiedades faltantes: "
    let error = false

    Object.keys(req.body.input).forEach(key => {
        if (req.body.input[key] === undefined) {
            error_message += key + ", "
            error = true
        }
    })

    if (error) {
        res.status(400).send({ message: error_message.slice(0, -2)})
        return
    }

    next()
}

function sanitizeInput(req: Request, res: Response, next: NextFunction) {
    const { legajo, nombre, apellido, correo } = req.body.input
    req.body.sanitizedInput = {
        legajo: legajo,
        nombre: nombre,
        apellido: apellido,
    }
    
    if (correo !== undefined) {
        if (isValidEmail(correo)) {
            req.body.sanitizedInput.correo = correo
        } else {
            res.status(400).send({ message: "El correo ingresado no es válido"})
            return
        }
    }
        
    delete req.body.input
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

export {extractInput, assureCompleteInput, sanitizeInput, findAll, findOne, add, update, remove}

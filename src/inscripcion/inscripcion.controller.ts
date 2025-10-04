import { Request, Response, NextFunction } from "express"
import { InscripcionRepository } from "./inscripcion.repository.js"
import { Inscripcion } from "./inscripcion.entity.js"
import { ObjectId } from "mongodb"

const repository = new InscripcionRepository()

function sanitizeInscripcionInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        alumno: req.body.alumno,
        consulta: req.body.consulta,
    }

    const {alumno, consulta} = req.body.sanitizedInput

    // Verificar alumno
    // Chequear undefined solo con el método POST
    if (alumno !== undefined || req.method === "POST") {
        // Si es un id válido
        if (ObjectId.isValid(alumno)) {
            req.body.sanitizedInput.alumno = ObjectId.createFromHexString(alumno)
        } else {
            res.status(400).send({ message: "El id de alumno ingresado no es válido" })
            return
        }
    }

    // Verificar consulta
    // Chequear undefined solo con el método POST
    if (consulta !== undefined || req.method === "POST") {
        // Si es un id válido
        if (ObjectId.isValid(consulta)) {
            req.body.sanitizedInput.consulta = ObjectId.createFromHexString(consulta)
        } else {
            res.status(400).send({ message: "El id de consulta ingresado no es válido" })
            return
        }
    }

    // TODO:
    // - Integridad referencial
    // - No poder inscribirse a una consulta con estado distinto a "Programada"

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })
    next()
}

async function findAll(_req: Request, res: Response) {
    res.json({ data: await repository.findAll() })
}

async function findOne(req: Request, res: Response) {
    const inscripcion = await repository.findOne({ id: req.params.id })
    if (!inscripcion) {
        res.status(404).send({ message: "Inscripcion no encontrado" })
        return
    }
    res.json({ data: inscripcion })
}

async function add(req: Request, res: Response) {
    const { alumno, consulta } = req.body.sanitizedInput
    const inscripcionInput = new Inscripcion(alumno, consulta)
    const inscripcion = await repository.add(inscripcionInput)
    res.status(201).send({ message: "Inscripcion creado con éxito", data: inscripcion })
}

async function update(req: Request, res: Response) {
    const inscripcion = await repository.update({ id: req.params.id }, req.body.sanitizedInput)
    if (!inscripcion) {
        res.status(404).send({ message: "Inscripcion no encontrado" })
        return
    }
    res.status(201).send({ message: "Inscripcion modificado con éxito", data: inscripcion })
}

async function remove(req: Request, res: Response) {
    const inscripcion = await repository.delete({ id: req.params.id })
    if (!inscripcion) {
        res.status(404).send({ message: "Inscripcion no encontrado" })
        return
    }
    res.status(200).send({ message: "Inscripcion borrado con éxito", data: inscripcion })
}

export { sanitizeInscripcionInput, findAll, findOne, add, update, remove }
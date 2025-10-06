import { Request, Response, NextFunction } from "express";
import { DocenteRepository } from "./docente.repository.js";
import { Docente } from "./docente.entity.js";
import { isValidEmail } from "../shared/validations.js";
import { hash } from "bcryptjs";
import { ObjectId } from "mongodb";
import { DictadoRepository } from "../dictado/dictado.repository.js";

const docenteRepository = new DocenteRepository()
const dictadoRepository = new DictadoRepository()

function extractInput(req: Request, _res: Response, next: NextFunction) {
    req.body.input = {
        legajo: req.body.legajo,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        correo: req.body.correo,
        password: req.body.password
    }
    next()
}

async function sanitizeInput(req: Request, res: Response, next: NextFunction) {
    const { legajo, nombre, apellido, correo, password } = req.body.input
    req.body.sanitizedInput = {
        legajo: legajo,
        nombre: nombre,
        apellido: apellido,
    }

    if (correo !== undefined) {
        if (isValidEmail(correo)) {
            req.body.sanitizedInput.correo = correo
        } else {
            res.status(400).send({ message: "El correo ingresado no es válido" })
            return
        }
    }

    if (password !== undefined) {
        req.body.sanitizedInput.password = await hash(password, 10)
    }

    delete req.body.input
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })

    next()
}

function handleError(res: Response, err: any) {
    switch (err.code) {
        case 11000: // DuplicateKey
            const key = Object.keys(err.errorResponse.keyValue)[0]
            const value = Object.values(err.errorResponse.keyValue)[0]
            res.status(400).send({ message: `La operación no se pudo completar, '${key}: ${value}' ya existe` })
            return
        case 121: // DocumentValidationFailure
            let error_message = "Ocurrió un problema al intentar validar las siguiente propiedades: "
            err.errorResponse.errInfo.details.schemaRulesNotSatisfied[0].propertiesNotSatisfied.forEach((property: { propertyName: string }) => {
                error_message += `${property.propertyName}, `
            });
            res.status(400).send({ message: error_message.slice(0, -2) })
            break
        default:
            res.status(400).send({ message: err })
            return
    }
}

// ----- Operaciones CRUD comunes -----

async function findAll(_req: Request, res: Response) {
    res.json({ data: await docenteRepository.findAll() })
}

async function findOne(req: Request, res: Response) {
    const docente = await docenteRepository.findOne({ id: req.params.id })
    if (!docente) {
        res.status(404).send({ message: "Docente no encontrado" })
        return
    }
    res.json({ data: docente })
}

async function add(req: Request, res: Response) {
    const { legajo, nombre, apellido, correo } = req.body.sanitizedInput
    const docenteInput = new Docente(legajo, nombre, apellido, correo)
    try {
        const docente = await docenteRepository.add(docenteInput)
        res.status(201).send({ message: "Docente creado con éxito", data: docente })
    } catch (err: any) {
        handleError(res, err)
    }
}

async function update(req: Request, res: Response) {
    try {
        const docente = await docenteRepository.update({ id: req.params.id }, req.body.sanitizedInput)
        if (!docente) {
            res.status(404).send({ message: "Docente no encontrado" })
            return
        }
        res.status(201).send({ message: "Docente modificado con éxito", data: docente })
    } catch (err: any) {
        handleError(res, err)
    }
}

async function remove(req: Request, res: Response) {
    const docente = await docenteRepository.delete({ id: req.params.id })
    if (!docente || !docente._id) {
        res.status(404).send({ message: "Docente no encontrado" })
        return
    }

    await dictadoRepository.deleteByDocente({ docente: docente._id })

    res.status(200).send({ message: "Docente borrado con éxito", data: docente })
}

// ----- Operaciones específicas -----

async function findOneByCorreo(req: Request, res: Response) {
    const docente = await docenteRepository.findOneByFilter({ correo: req.params.correo })
    if (!docente) {
        res.status(404).send({ message: "Alumno no encontrado" })
        return
    }
    res.json({ data: docente })
}

async function findAllByMateria(req: Request, res: Response) {
    let materia = req.params.materia
    if (!ObjectId.isValid(materia)) {
        res.status(400).send({ message: "El id de consulta ingresado no es válido" })
        return
    }
    res.json({ data: await docenteRepository.findAllByMateria({ materia: new ObjectId(materia) }) })
}

export { extractInput, sanitizeInput, findAll, findOne, add, update, remove, findOneByCorreo, findAllByMateria }

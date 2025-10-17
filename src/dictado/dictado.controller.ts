import { Request, Response, NextFunction } from "express"
import { DictadoRepository } from "./dictado.repository.js"
import { Dictado } from "./dictado.entity.js"
import { ObjectId } from "mongodb"
import { DocenteRepository } from "../docente/docente.repository.js"
import { MateriaRepository } from "../materia/materia.repository.js"
import { getSanitizedPaginationParams } from "../shared/controller.middlewares.js"

const dictadoRepository = new DictadoRepository()
const docenteRepository = new DocenteRepository()
const materiaRepository = new MateriaRepository()

function extractInput(req: Request, _res: Response, next: NextFunction) {
    req.body.input = {
        docente: req.body.docente,
        materia: req.body.materia
    }
    next()
}

async function sanitizeInput(req: Request, res: Response, next: NextFunction) {
    const { docente, materia } = req.body.input
    req.body.sanitizedInput = {}


    // Verificar docente
    // No chequear para undefined
    if (docente !== undefined) {
        // Si el id no es válido
        if (!ObjectId.isValid(docente)) {
            res.status(400).send({ message: "El id de docente ingresado no es válido" })
            return
        }
        // Si no existe un docente con el id ingresado
        if (!(await docenteRepository.findOne({ id: docente }))) {
            res.status(404).send({ message: `Docente con id '${docente}' no encontrado` })
            return
        }
        // Sino, el docente es válido
        req.body.sanitizedInput.docente = ObjectId.createFromHexString(docente)
    }

    // Verificar materia
    // No chequear para undefined
    if (materia !== undefined) {
        // Si el id no es válido
        if (!ObjectId.isValid(materia)) {
            res.status(400).send({ message: "El id de materia ingresado no es válido" })
            return
        }
        // Si no existe una materia con el id ingresado
        if (!(await materiaRepository.findOne({ id: materia }))) {
            res.status(404).send({ message: `Materia con id '${materia}' no encontrada` })
            return
        }
        // Sino, la materia es válida
        req.body.sanitizedInput.materia = ObjectId.createFromHexString(materia)
    }

    // Eliminar keys sin valores asignados
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
            const keys = Object.keys(err.errorResponse.keyValue)
            const values = Object.values(err.errorResponse.keyValue)
            res.status(400).send({ message: `La operación no se pudo completar, la combinación '${keys[0]}: ${values[0]}, ${keys[1]}: ${values[1]}' ya existe` })
            return
        case 121: // DocumentValidationFailure
            let error_message = "Ocurrió un problema al intentar validar las siguiente propiedades: "

            // Si se agregan más validaciones al esquema, esta validación sería necesaria
            // let detalles = err.errorResponse.errInfo.details
            // if (detalles.operatorName === "$jsonSchema" && detalles.schemaRulesNotSatisfied[0] === "operatorName")

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

async function findAll(req: Request, res: Response) {
    const { page, limit } = getSanitizedPaginationParams(req)

    const dictados = await dictadoRepository.findAll({ page, limit })
    res.json({ data: dictados, total: await dictadoRepository.count(), page, totalPages: limit === 0 ? 1 : (dictados.length / limit) })
}

async function findOne(req: Request, res: Response) {
    const dictado = await dictadoRepository.findOne({ id: req.params.id })
    if (!dictado) {
        res.status(404).send({ message: "Dictado no encontrado" })
        return
    }
    res.json({ data: dictado })
}

async function add(req: Request, res: Response) {
    const { docente, materia } = req.body.sanitizedInput
    const dictadoInput = new Dictado(docente, materia)
    try {
        const dictado = await dictadoRepository.add(dictadoInput)
        res.status(201).send({ message: "Dictado creado con éxito", data: dictado })
    } catch (err: any) {
        handleError(res, err)
    }
}

async function update(req: Request, res: Response) {
    try {
        const dictado = await dictadoRepository.update({ id: req.params.id }, req.body.sanitizedInput)
        if (!dictado) {
            res.status(404).send({ message: "Dictado no encontrado" })
            return
        }
        res.status(201).send({ message: "Dictado modificado con éxito", data: dictado })
    } catch (err) {
        handleError(res, err)
    }
}

async function remove(req: Request, res: Response) {
    const dictado = await dictadoRepository.delete({ id: req.params.id })
    if (!dictado) {
        res.status(404).send({ message: "Dictado no encontrado" })
        return
    }
    res.status(200).send({ message: "Dictado borrado con éxito", data: dictado })
}

// ----- Operaciones específicas -----

async function findAllByDocente(req: Request, res: Response) {
    let docente = req.params.docente
    if (!ObjectId.isValid(docente)) {
        res.status(400).send({ message: "El id de docente ingresado no es válido" })
        return
    }

    const { page, limit } = getSanitizedPaginationParams(req)

    const dictadosByDocente = await dictadoRepository.findAllByFilter({ docente: new ObjectId(docente) }, { page, limit })
    res.json({ data: dictadosByDocente, total: await dictadoRepository.countByFilter({ docente: new ObjectId(docente) }), page, totalPages: limit === 0 ? 1 : (dictadosByDocente.length / limit) })
}

async function findAllByMateria(req: Request, res: Response) {
    let materia = req.params.materia
    if (!ObjectId.isValid(materia)) {
        res.status(400).send({ message: "El id de materia ingresado no es válido" })
        return
    }

    const { page, limit } = getSanitizedPaginationParams(req)

    const dictadosByMateria = await dictadoRepository.findAllByFilter({ materia: new ObjectId(materia) }, { page, limit })
    res.json({ data: dictadosByMateria, total: await dictadoRepository.countByFilter({ materia: new ObjectId(materia) }), page, totalPages: limit === 0 ? 1 : (dictadosByMateria.length / limit) })
}

async function findOneByDocenteAndMateria(req: Request, res: Response) {
    let docente = req.params.docente
    if (!ObjectId.isValid(docente)) {
        res.status(400).send({ message: "El id de docente ingresado no es válido" })
        return
    }
    let materia = req.params.docente
    if (!ObjectId.isValid(materia)) {
        res.status(400).send({ message: "El id de materia ingresado no es válido" })
        return
    }

    res.json({data: await dictadoRepository.findOneByFilter({docente: new ObjectId(docente), materia: new ObjectId(materia)})})
}

export { extractInput, sanitizeInput, findAll, findOne, add, update, remove, findAllByDocente, findAllByMateria, findOneByDocenteAndMateria }
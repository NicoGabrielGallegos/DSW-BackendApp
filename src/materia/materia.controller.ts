import { Request, Response, NextFunction } from "express"
import { MateriaRepository } from "./materia.repository.js"
import { Materia } from "./materia.entity.js"
import { ObjectId } from "mongodb"
import { DictadoRepository } from "../dictado/dictado.repository.js"
import { ConsultaRepository } from "../consulta/consulta.repository.js"
import { InscripcionRepository } from "../inscripcion/inscripcion.repository.js"
import { getSanitizedPaginationParams, getSanitizedSortingParams } from "../shared/controller.js"

const materiaRepository = new MateriaRepository()
const dictadoRepository = new DictadoRepository()
const consultaRepository = new ConsultaRepository()
const inscripcionRepository = new InscripcionRepository()

function extractInput(req: Request, res: Response, next: NextFunction) {
    req.body.input = {
        descripcion: req.body.descripcion
    }
    next()
}

function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
    const { descripcion } = req.body.input
    req.body.sanitizedInput = {
        descripcion: descripcion
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

async function findAll(req: Request, res: Response) {
    const { page, limit } = getSanitizedPaginationParams(req)
    const { sort } = getSanitizedSortingParams(req)

    const materias = await materiaRepository.findAll({ page, limit, sort })
    res.json({ data: materias, total: await materiaRepository.count(), page, totalPages: limit === 0 ? 1 : (materias.length / limit) })
}

async function findOne(req: Request, res: Response) {
    const materia = await materiaRepository.findOne({ id: req.params.id })
    if (!materia) {
        res.status(404).send({ message: "Materia no encontrada" })
        return
    }
    res.json({ data: materia })
}

async function add(req: Request, res: Response) {
    const { descripcion } = req.body.sanitizedInput
    const materiaInput = new Materia(descripcion)
    try {
        const materia = await materiaRepository.add(materiaInput)
        res.status(201).send({ message: "Materia creada con éxito", data: materia })
    } catch (err: any) {
        handleError(res, err)
    }
}

async function update(req: Request, res: Response) {
    try {
        const materia = await materiaRepository.update({ id: req.params.id }, req.body.sanitizedInput)
        if (!materia) {
            res.status(404).send({ message: "Materia no encontrada" })
            return
        }
        res.status(201).send({ message: "Materia modificada con éxito", data: materia })
    } catch (err) {
        handleError(res, err)
    }
}

async function remove(req: Request, res: Response) {
    const materia = await materiaRepository.delete({ id: req.params.id })
    if (!materia || !materia._id) {
        res.status(404).send({ message: "Materia no encontrada" })
        return
    }
    await inscripcionRepository.deleteByConsultas({ consultas: (await consultaRepository.findAllByMateria({ materia: materia._id })).map(c => c._id as ObjectId) })
    await consultaRepository.deleteByDictados({ dictados: (await dictadoRepository.findAllByFilter({ materia: materia._id })).map(d => d._id as ObjectId) })
    await dictadoRepository.deleteByMateria({ materia: materia._id })
    res.status(200).send({ message: "Materia borrada con éxito", data: materia })
}

// ----- Operaciones específicas -----

async function findOneByDescripcion(req: Request, res: Response) {
    const materia = await materiaRepository.findOneByFilter({ descripcion: req.params.descripcion })
    if (!materia) {
        res.status(404).send({ message: "Materia no encontrado" })
        return
    }
    res.json({ data: materia })
}

async function findAllByDocente(req: Request, res: Response) {
    let docente = req.params.docente
    if (!ObjectId.isValid(docente)) {
        res.status(400).send({ message: "El id de docente ingresado no es válido" })
        return
    }

    const { page, limit } = getSanitizedPaginationParams(req)
    const { sort } = getSanitizedSortingParams(req)

    const materiasByDocente = await materiaRepository.findAllByDocente({ docente: new ObjectId(docente) }, { page, limit, sort })
    res.json({ data: materiasByDocente, total: await materiaRepository.countByDocente({ docente: new ObjectId(docente) }), page, totalPages: limit === 0 ? 1 : (materiasByDocente.length / limit) })
}

export { extractInput, sanitizeInput, findAll, findOne, add, update, remove, findOneByDescripcion, findAllByDocente }
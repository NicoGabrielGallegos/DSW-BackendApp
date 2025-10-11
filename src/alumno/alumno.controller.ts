import { Request, Response, NextFunction } from "express"
import { AlumnoRepository } from "./alumno.repository.js"
import { Alumno } from "./alumno.entity.js"
import { isValidEmail } from "../shared/validations.js"
import { compare, hash } from "bcryptjs"
import { ObjectId } from "mongodb"
import { InscripcionRepository } from "../inscripcion/inscripcion.repository.js"
import jwk from 'jsonwebtoken'
import { PRIVATE_KEY } from "../shared/auth/auth.controller.js"

const alumnoRepository = new AlumnoRepository()
const inscripcionRepository = new InscripcionRepository()

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

async function findAll(_req: Request, res: Response) {
    res.json({ data: await alumnoRepository.findAll() })
}

async function findOne(req: Request, res: Response) {
    const alumno = await alumnoRepository.findOne({ id: req.params.id })
    if (!alumno) {
        res.status(404).send({ message: "Alumno no encontrado" })
        return
    }
    res.json({ data: alumno })
}

async function add(req: Request, res: Response) {
    const { legajo, nombre, apellido, correo, password } = req.body.sanitizedInput
    const alumnoInput = new Alumno(legajo, nombre, apellido, correo, password)
    try {
        const alumno = await alumnoRepository.add(alumnoInput)
        res.status(201).send({ message: "Alumno creado con éxito", data: alumno })
    } catch (err: any) {
        handleError(res, err)
    }
}

async function update(req: Request, res: Response) {
    try {
        const alumno = await alumnoRepository.update({ id: req.params.id }, req.body.sanitizedInput)
        if (!alumno) {
            res.status(404).send({ message: "Alumno no encontrado" })
            return
        }
        res.status(201).send({ message: "Alumno modificado con éxito", data: alumno })

    } catch (err) {
        handleError(res, err)
    }
}

async function remove(req: Request, res: Response) {
    const alumno = await alumnoRepository.delete({ id: req.params.id })
    if (!alumno || !alumno._id) {
        res.status(404).send({ message: "Alumno no encontrado" })
        return
    }

    await inscripcionRepository.deleteByAlumno({ alumno: alumno._id })

    res.status(200).send({ message: "Alumno borrado con éxito", data: alumno })
}

// ----- Operaciones específicas -----

async function findOneByCorreo(req: Request, res: Response) {
    const alumno = await alumnoRepository.findOneByFilter({ correo: req.params.correo })
    if (!alumno) {
        res.status(404).send({ message: "Alumno no encontrado" })
        return
    }
    res.json({ data: alumno })
}

async function findAllByConsulta(req: Request, res: Response) {
    let consulta = req.params.consulta
    if (!ObjectId.isValid(consulta)) {
        res.status(400).send({ message: "El id de consulta ingresado no es válido" })
        return
    }
    res.json({ data: await alumnoRepository.findAllByConsulta({ consulta: new ObjectId(consulta) }) })
}

// ----- Login -----

async function login(req: Request, res: Response) {
    const { correo, password } = req.body.input

    // Verificar que el alumno exista
    if (!isValidEmail(correo)) {
        res.status(400).send({ message: "Correo o contraseña incorrectos" })
        return
    }
    const alumno = await alumnoRepository.findOneByFilter({ correo })
    if (!alumno) {
        res.status(400).json({ message: "Correo o contraseña incorrectos" })
        return
    }

    // Verificar que la contraseña sea correcta
    const passwordMatch = await compare(password, alumno.password)

    if (!passwordMatch) {
        res.status(400).json({ message: "Correo o contraseña incorrectos" })
        return
    }

    const token = jwk.sign({ alumnoId: alumno._id }, PRIVATE_KEY, { expiresIn: "1h" })

    res.json({ data: token })
}

export { extractInput, sanitizeInput, findAll, findOne, add, update, remove, findOneByCorreo, findAllByConsulta, login }
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { isValidEmail } from "../validations.js"
import { AlumnoRepository } from "../../alumno/alumno.repository.js"
import { DocenteRepository } from "../../docente/docente.repository.js"
import { AdministradorRepository } from "../../administrador/administrador.repository.js"
import { compare } from "bcryptjs"

export const PRIVATE_KEY = "private_key"

const alumnoRepository = new AlumnoRepository()
const docenteRepository = new DocenteRepository()
const administradorRepository = new AdministradorRepository()

export enum Rol {
    Alumno = "alumno",
    Docente = "docente",
    Administrador = "administrador",
}

function auth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        res.status(401).send({ message: "No autorizado" })
        return
    }

    const token = authHeader.split(" ")[1]
    try {
        const decoded = jwt.verify(token, PRIVATE_KEY)

        if (!req.body) req.body = {}
        req.body.loggedUser = decoded

        next()
    } catch (err) {

        res.status(401).send({ message: "Token inválido" })
    }
}

function privateDocentesOnly(req: Request, res: Response, next: NextFunction) {
    req.body.loggedUser
}

function extractInput(req: Request, res: Response, next: NextFunction) {
    req.body.input = {
        correo: req.body.correo,
        password: req.body.password
    }

    // Verificar que el correo sea válido
    if (!isValidEmail(req.body.input.correo)) {
        res.status(400).send({ message: "Correo o contraseña incorrectos" })
        return
    }

    next()
}

async function loginAlumno(req: Request, res: Response) {
    const { correo, password } = req.body.input

    // Verificar que exista un alumno con ese correo
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

    const payload = {
        id: alumno._id as ObjectId,
        legajo: alumno.legajo,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        correo: alumno.correo,
        rol: Rol.Alumno
    }

    const token = jwt.sign({ user: payload }, PRIVATE_KEY, { expiresIn: "1h" })

    res.json({ data: token })
}

async function loginDocente(req: Request, res: Response) {
    const { correo, password } = req.body.input

    // Verificar que exista un docente con ese correo
    const docente = await docenteRepository.findOneByFilter({ correo })
    if (!docente) {
        res.status(400).json({ message: "Correo o contraseña incorrectos" })
        return
    }

    // Verificar que la contraseña sea correcta
    const passwordMatch = await compare(password, docente.password)
    if (!passwordMatch) {
        res.status(400).json({ message: "Correo o contraseña incorrectos" })
        return
    }

    const payload = {
        id: docente._id as ObjectId,
        legajo: docente.legajo,
        nombre: docente.nombre,
        apellido: docente.apellido,
        correo: docente.correo,
        rol: Rol.Docente
    }

    const token = jwt.sign({ user: payload }, PRIVATE_KEY, { expiresIn: "1h" })

    res.json({ data: token })
}

async function loginAdministrador(req: Request, res: Response) {
    const { correo, password } = req.body.input

    // Verificar que exista un docente con ese correo
    const administrador = await administradorRepository.findOneByFilter({ correo })
    if (!administrador) {
        res.status(400).json({ message: "Correo o contraseña incorrectos" })
        return
    }

    // Verificar que la contraseña sea correcta
    const passwordMatch = await compare(password, administrador.password)
    if (!passwordMatch) {
        res.status(400).json({ message: "Correo o contraseña incorrectos" })
        return
    }

    const payload = {
        id: administrador._id as ObjectId,
        nombre: administrador.nombre,
        apellido: administrador.apellido,
        correo: administrador.correo,
        permisos: administrador.permisos,
        rol: Rol.Administrador
    }

    const token = jwt.sign({ user: payload }, PRIVATE_KEY, { expiresIn: "1h" })

    res.json({ data: token })
}


export { auth, extractInput, loginAlumno, loginDocente, loginAdministrador }
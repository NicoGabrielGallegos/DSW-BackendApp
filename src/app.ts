import express, { NextFunction, Request, Response } from "express"
import { Alumno } from "./alumnos.js"

const app = express()
app.use(express.json()) // middleware

const alumnos: Alumno[] = [
    new Alumno("Nicolás", "Gallegos", "ngabriel@gmail.com", "bcff2a7b-b199-4f3b-9a92-fcbd1d250ee1"),
    new Alumno("Victoria", "Bay", "victoriabayutn@gmail.com", "ab93d5c7-dfa6-41f4-b3f9-72156df20ff8"),
]

function sanitizeInputAlumno(req: Request, _res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
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

app.get("/api/alumnos", (req, res) => {
    res.json({data: alumnos})
})

app.get("/api/alumnos/:legajoAlumno", (req, res) => {
    const alumno = alumnos.find((alu) => alu.legajoAlumno === req.params.legajoAlumno)
    if (!alumno) {
        res.status(404).send({message: "Alumno no encontrado"})
        return
    }
    res.json({data: alumno})
})

app.post("/api/alumnos", sanitizeInputAlumno, (req, res) => {
    const {nombre, apellido, correo} = req.body.sanitizedInput
    const alumno = new Alumno(nombre, apellido, correo)
    alumnos.push(alumno)
    res.status(201).send({message: "Alumno creado con éxito", data: alumno})
})

app.put("/api/alumnos/:legajoAlumno", sanitizeInputAlumno, (req, res) => {
    const aluIdx = alumnos.findIndex((alu => alu.legajoAlumno === req.params.legajoAlumno))
    if (aluIdx === -1) {
        res.status(404).send({message: "Alumno no encontrado"})
        return
    }
    alumnos[aluIdx] = {...alumnos[aluIdx], ...req.body.sanitizedInput}
    // Alt // Object.assign(alumnos[aluIdx], req.body.sanitizedInput)
    res.status(200).send({message: "Alumno modificado con éxito", data: alumnos[aluIdx]})
})

app.patch("/api/alumnos/:legajoAlumno", sanitizeInputAlumno, (req, res) => {
    const aluIdx = alumnos.findIndex((alu) => alu.legajoAlumno === req.params.legajoAlumno)
    if (aluIdx === -1) {
        res.status(404).send({message: "Alumno no encontrado"})
        return
    }
    alumnos[aluIdx] = {...alumnos[aluIdx], ...req.body.sanitizedInput}
    // Alt // Object.assign(alumnos[aluIdx], req.body.sanitizedInput)
    res.status(200).send({message: "Alumno modificado con éxito", data: alumnos[aluIdx]})
})

app.delete("/api/alumnos/:legajoAlumno", (req, res) => {
    const aluIdx = alumnos.findIndex((alu) => alu.legajoAlumno === req.params.legajoAlumno)
    if (aluIdx === -1) {
        res.status(404).send({message: "Alumno no encontrado"})
        return
    }
    alumnos.splice(aluIdx, 1)
    res.status(200).send({message: "Alumno borrado con éxito"})
})

app.use((_req, res) => {
    res.status(404).send({message: "Recurso no encontrado"})
})

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000/")
})
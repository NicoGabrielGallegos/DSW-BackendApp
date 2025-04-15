import express from "express"
import { alumnoRouter } from "./alumno/alumno.routes.js"

// Crear aplicación Express
const app = express()

// Middleware para escuchar únicamente peticiones donde el header 'Content-Type' sea de tipo 'application/json'
app.use(express.json())

// Router hacia el recurso de alumnos
app.use("/api/alumnos", alumnoRouter)

// Middleware para el manejo de peticiones a recursos no válidos
app.use((_req, res) => {
    res.status(404).send({message: "Recurso no encontrado"})
})

// Levantar API
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000/")
})
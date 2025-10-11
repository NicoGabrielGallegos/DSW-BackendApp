import { Router } from "express";
import { add, findAll, findOne, update, remove, extractInput, sanitizeInput, findOneByCorreo, findAllByConsulta, login } from "./alumno.controller.js";
import { assureCompleteInput } from "../shared/controller.middlewares.js";

export const alumnoRouter = Router()

// Rutas comunes
alumnoRouter.get("/", findAll)
alumnoRouter.get("/:id", findOne)
alumnoRouter.post("/", extractInput, assureCompleteInput, sanitizeInput, add)
alumnoRouter.put("/:id", extractInput, sanitizeInput, update)
alumnoRouter.patch("/:id", extractInput, sanitizeInput, update)
alumnoRouter.delete("/:id", remove)

// Rutas adicionales
alumnoRouter.get("/byCorreo/:correo", findOneByCorreo)
alumnoRouter.get("/byConsulta/:consulta", findAllByConsulta)
alumnoRouter.post("/login", extractInput, login)
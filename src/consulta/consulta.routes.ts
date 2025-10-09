import { Router } from "express";
import { add, findAll, findOne, update, remove, sanitizeInput, findAllByDictado, findAllInHorario, extractInput } from "./consulta.controller.js";
import { assureCompleteInput } from "../shared/controller.middlewares.js";

export const consultaRouter = Router()

// Rutas comunes
consultaRouter.get("/", findAll)
consultaRouter.get("/:id", findOne)
consultaRouter.post("/", extractInput, assureCompleteInput, sanitizeInput, add)
consultaRouter.put("/:id", extractInput, sanitizeInput, update)
consultaRouter.patch("/:id", extractInput, sanitizeInput, update)
consultaRouter.delete("/:id", remove)

// Rutas adicionales
consultaRouter.get("/byDictado/:dictado", findAllByDictado)
consultaRouter.get("/inHorario/:horaInicio/:horaFin", findAllInHorario)

// TODO:
// findAllByDictadoInHorario
// findAllByDocente
// findAllByMateria
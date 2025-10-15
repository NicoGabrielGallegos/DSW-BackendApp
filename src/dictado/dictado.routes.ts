import { Router } from "express";
import { add, findAll, findOne, update, remove, extractInput, sanitizeInput, findAllByDocente, findAllByMateria, findOneByDocenteAndMateria } from "./dictado.controller.js";
import { assureCompleteInput } from "../shared/controller.middlewares.js";

export const dictadoRouter = Router()

// Rutas comunes
dictadoRouter.get("/", findAll)
dictadoRouter.get("/:id", findOne)
dictadoRouter.post("/", extractInput, assureCompleteInput, sanitizeInput, add)
dictadoRouter.put("/:id", extractInput, sanitizeInput, update)
dictadoRouter.patch("/:id", extractInput, sanitizeInput, update)
dictadoRouter.delete("/:id", remove)

// Rutas adicionales
dictadoRouter.get("/byDocente/:docente", findAllByDocente)
dictadoRouter.get("/byMateria/:materia", findAllByMateria)
dictadoRouter.get("/byDocente/:docente/byMateria/:materia", findOneByDocenteAndMateria)
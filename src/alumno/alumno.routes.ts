import { Router } from "express";
import { add, findAll, findOne, update, remove, extractInput, sanitizeInput, findOneByCorreo } from "./alumno.controller.js";
import { assureCompleteInput } from "../shared/controller.middlewares.js";

export const alumnoRouter = Router()

// Routas comunes
alumnoRouter.get("/", findAll)
alumnoRouter.get("/:id", findOne)
alumnoRouter.post("/", extractInput, assureCompleteInput, sanitizeInput, add)
alumnoRouter.put("/:id", extractInput, sanitizeInput, update)
alumnoRouter.patch("/:id", extractInput, sanitizeInput, update)
alumnoRouter.delete("/:id", remove)

// Rutas adicionales
alumnoRouter.get("/correo/:correo", findOneByCorreo)
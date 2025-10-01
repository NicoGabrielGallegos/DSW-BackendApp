import { Router } from "express";
import { add, findAll, findOne, update, remove, sanitizeAlumnoInput } from "./alumno.controller.js";

export const alumnoRouter = Router()

alumnoRouter.get("/", findAll)
alumnoRouter.get("/:id", findOne)
alumnoRouter.post("/", sanitizeAlumnoInput, add)
alumnoRouter.put("/:id", sanitizeAlumnoInput, update)
alumnoRouter.patch("/:id", sanitizeAlumnoInput, update)
alumnoRouter.delete("/:id", remove)
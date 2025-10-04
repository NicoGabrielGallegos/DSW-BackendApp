import { Router } from "express";
import { add, findAll, findOne, update, remove, sanitizeInscripcionInput } from "./inscripcion.controller.js";

export const inscripcionRouter = Router()

inscripcionRouter.get("/", findAll)
inscripcionRouter.get("/:id", findOne)
inscripcionRouter.post("/", sanitizeInscripcionInput, add)
inscripcionRouter.put("/:id", sanitizeInscripcionInput, update)
inscripcionRouter.patch("/:id", sanitizeInscripcionInput, update)
inscripcionRouter.delete("/:id", remove)
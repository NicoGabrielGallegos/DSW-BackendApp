import { Router } from "express";
import { add, findAll, findOne, update, remove, extractInput, sanitizeInput } from "./alumno.controller.js";
import { assureCompleteInput } from "../shared/controller.middlewares.js";

export const alumnoRouter = Router()

alumnoRouter.get("/", findAll)
alumnoRouter.get("/:id", findOne)
alumnoRouter.post("/", extractInput, assureCompleteInput, sanitizeInput, add)
alumnoRouter.put("/:id", extractInput, sanitizeInput, update)
alumnoRouter.patch("/:id", extractInput, sanitizeInput, update)
alumnoRouter.delete("/:id", remove)
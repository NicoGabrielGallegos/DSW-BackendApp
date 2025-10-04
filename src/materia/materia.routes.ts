import { Router } from "express";
import { add, findAll, findOne, update, remove, extractInput, sanitizeInput } from "./materia.controller.js";
import { assureCompleteInput } from "../shared/controller.middlewares.js";

export const materiaRouter = Router()

materiaRouter.get("/", findAll)
materiaRouter.get("/:id", findOne)
materiaRouter.post("/", extractInput, assureCompleteInput, sanitizeInput, add)
materiaRouter.put("/:id", extractInput, sanitizeInput, update)
materiaRouter.patch("/:id", extractInput, sanitizeInput, update)
materiaRouter.delete("/:id", remove)
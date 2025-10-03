import { Router } from "express";
import { add, findAll, findOne, update, remove, sanitizeConsultaInput } from "./consulta.controller.js";

export const consultaRouter = Router()

consultaRouter.get("/", findAll)
consultaRouter.get("/:id", findOne)
consultaRouter.post("/", sanitizeConsultaInput, add)
consultaRouter.put("/:id", sanitizeConsultaInput, update)
consultaRouter.patch("/:id", sanitizeConsultaInput, update)
consultaRouter.delete("/:id", remove)
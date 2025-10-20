import { Router } from "express";
import { findAll, findOne, findOneByCorreo } from "./administrador.controller.js";

export const administradorRouter = Router()

// Rutas comunes
administradorRouter.get("/", findAll)
administradorRouter.get("/:id", findOne)

// Rutas adicionales
administradorRouter.get("/byCorreo/:correo", findOneByCorreo)
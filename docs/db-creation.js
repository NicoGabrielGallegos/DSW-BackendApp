import { ObjectId } from "mongodb";

// use dswapp

db.createCollection("alumnos", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Alumnos",
            required: ["legajo", "nombre", "apellido", "correo", "password"],
            properties: {
                legajo: { bsonType: "string" },
                nombre: { bsonType: "string" },
                apellido: { bsonType: "string" },
                correo: { bsonType: "string" },
                password: { bsonType: "string" },
            }
        }
    }
})

db.createCollection("docentes", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Docentes",
            required: ["legajo", "nombre", "apellido", "correo", "password"],
            properties: {
                legajo: { bsonType: "string" },
                nombre: { bsonType: "string" },
                apellido: { bsonType: "string" },
                correo: { bsonType: "string" },
                password: { bsonType: "string" },
            }
        }
    }
})

db.createCollection("materias", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Materias",
            required: ["descripcion"],
            properties: {
                descripcion: { bsonType: "string" },
            }
        }
    }
})

db.createCollection("dictados", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Dictados",
            required: ["docente", "materia"],
            properties: {
                docente: { bsonType: "objectId" },
                materia: { bsonType: "objectId" },
            }
        }
    }
})

db.createCollection("consultas", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Consultas",
            required: ["dictado", "horaInicio", "horaFin", "estado"],
            properties: {
                dictado: { bsonType: "objectId" },
                horaInicio: { bsonType: "date" },
                horaFin: { bsonType: "date" },
                estado: { bsonType: "string" },
            }
        }
    }
})

db.createCollection("inscripciones", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Inscripciones",
            required: ["alumno", "consulta"],
            properties: {
                alumno: { bsonType: "objectId" },
                consulta: { bsonType: "objectId" },
            }
        }
    }
})

db.createCollection("calificaciones", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Calificaciones",
            required: ["consulta", "valoracion"],
            properties: {
                consulta: { bsonType: "objectId" },
                valoracion: { bsonType: "int" },
            }
        }
    }
})
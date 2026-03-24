db = connect("mongodb://127.0.0.1:27017/dswapp")

db.createCollection("alumnos", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Alumnos",
            required: ["legajo", "nombre", "apellido", "correo", "password"],
            properties: {
                legajo: { bsonType: "string", description: "'legajo' debe ser string y es obligatorio" },
                nombre: { bsonType: "string", description: "'nombre' debe ser string y es obligatorio" },
                apellido: { bsonType: "string", description: "'apellido' debe ser string y es obligatorio" },
                correo: { bsonType: "string", description: "'correo' debe ser string y es obligatorio" },
                password: { bsonType: "string", description: "'password' debe ser string y es obligatorio" },
            }
        }
    }
})
db.alumnos.createIndex({ legajo: 1 }, { unique: true })
db.alumnos.createIndex({ correo: 1 }, { unique: true })

db.createCollection("docentes", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Docentes",
            required: ["legajo", "nombre", "apellido", "correo", "password"],
            properties: {
                legajo: { bsonType: "string", description: "'legajo' debe ser string y es obligatorio" },
                nombre: { bsonType: "string", description: "'nombre' debe ser string y es obligatorio" },
                apellido: { bsonType: "string", description: "'apellido' debe ser string y es obligatorio" },
                correo: { bsonType: "string", description: "'correo' debe ser string y es obligatorio" },
                password: { bsonType: "string", description: "'password' debe ser string y es obligatorio" },
            }
        }
    }
})
db.docentes.createIndex({ legajo: 1 }, { unique: true })
db.docentes.createIndex({ correo: 1 }, { unique: true })

db.createCollection("administradores", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Administradores",
            required: ["nombre", "apellido", "correo", "password"],
            properties: {
                nombre: { bsonType: "string", description: "'nombre' debe ser string y es obligatorio" },
                apellido: { bsonType: "string", description: "'apellido' debe ser string y es obligatorio" },
                correo: { bsonType: "string", description: "'correo' debe ser string y es obligatorio" },
                permisos: { bsonType: "array", items: { bsonType: "int" }, description: "'permisos' debe ser int[] y es obligatorio" },
                password: { bsonType: "string", description: "'password' debe ser string y es obligatorio" },
            }
        }
    }
})
db.administradores.createIndex({ correo: 1 }, { unique: true })
db.administradores.insertOne({ nombre: "Admin", apellido: "Istrador", correo: "admin@gmail.com", permisos: [1, 2, 3, 4, 5, 6], password: "$2b$10$or0i5nrTkUy/0jQhgKUc2eXjobLu.ZEXpOZIm5j2pSVAO/j5OJua6" })

db.createCollection("materias", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Materias",
            required: ["descripcion"],
            properties: {
                descripcion: { bsonType: "string", description: "'descripcion' debe ser string y es obligatorio" },
            }
        }
    }
})
db.materias.createIndex({ descripcion: 1 }, { unique: true })

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
db.dictados.createIndex({ docente: 1, materia: 1 }, { unique: true })

db.createCollection("consultas", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Consultas",
            required: ["dictado", "horaInicio", "horaFin", "estado"],
            properties: {
                dictado: { bsonType: "objectId", description: "'dictado' debe ser ObjectId, referenciar a un dictado existente y es obligatorio" },
                horaInicio: { bsonType: "date", description: "'horaInicio' debe ser Date y es obligatorio" },
                horaFin: { bsonType: "date", description: "'horaFin' debe ser Date y es obligatorio" },
                estado: {
                    enum: ["Programada", "Realizada", "Cancelada"],
                    description: "'estado' debe ser string, es obligatorio y sus valores válidos son 'Programada', 'Realiazda' y 'Cancelada'"
                },
            }
        }
    }
})
db.consultas.createIndex({ dictado: 1, horaInicio: 1, horaFin: 1 }, { unique: true })

db.createCollection("inscripciones", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Inscripciones",
            required: ["alumno", "consulta"],
            properties: {
                alumno: { bsonType: "objectId", description: "'alumno' debe ser ObjectId, referenciar a un alumno existente y es obligatorio" },
                consulta: { bsonType: "objectId", description: "'consulta' debe ser ObjectId, referenciar a una consulta existente y es obligatorio" },
            }
        }
    }
})
db.inscripciones.createIndex({ alumno: 1, consulta: 1 }, { unique: true })
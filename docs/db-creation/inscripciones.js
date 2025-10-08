// Crear colección
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

// Definir campos únicos
db.inscripciones.createIndex({ alumno: 1, consulta: 1 }, { unique: true})

// Agregar schema validator si la colección ya está creada
db.runCommand({
    collMod: "inscripciones",
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
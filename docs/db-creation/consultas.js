//Crear colección
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

// Definir campos únicos
db.consultas.createIndex({ dictado: 1, horaInicio: 1, horaFin: 1 }, { unique: true })

// Agregar schema validator si la colección ya está creada
db.runCommand({
    collMod: "consultas",
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
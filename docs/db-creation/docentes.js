// Crear colección
db.createCollection("docentes", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Docentes",
            required: ["legajo", "nombre", "apellido", "correo", "password"],
            properties: {
                legajo: { bsonType: "string", description: "'legajo' debe ser string y es obligatorio" },
                nombre: { bsonType: "string", description: "'nombre' debe ser string y es obligatorio"  },
                apellido: { bsonType: "string", description: "'apellido' debe ser string y es obligatorio"  },
                correo: { bsonType: "string", description: "'correo' debe ser string y es obligatorio"  },
                password: { bsonType: "string", description: "'password' debe ser string y es obligatorio"  },
            }
        }
    }
})

// Definir campos únicos
db.docentes.createIndex({ legajo: 1 }, { unique: true})
db.docentes.createIndex({ correo: 1 }, { unique: true})

// Agregar schema validator si la colección ya está creada
db.runCommand({
    collMod: "docentes",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Docentes",
            required: ["legajo", "nombre", "apellido", "correo", "password"],
            properties: {
                legajo: { bsonType: "string", description: "'legajo' debe ser string y es obligatorio" },
                nombre: { bsonType: "string", description: "'nombre' debe ser string y es obligatorio"  },
                apellido: { bsonType: "string", description: "'apellido' debe ser string y es obligatorio"  },
                correo: { bsonType: "string", description: "'correo' debe ser string y es obligatorio"  },
                password: { bsonType: "string", description: "'password' debe ser string y es obligatorio"  },
            }
        }
    }
})
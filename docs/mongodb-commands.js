// use dswapp

// insert data
db.alumnos.insertOne({
    legajo: "51367",
    nombre: "Nicolás",
    apellido: "Galegos",
    correo: "nicogabrielgallegos@gmail.com",
})
// insertedID: ObjectID('68db24dd88de7ecc0bcebea4')

db.alumnos.insertOne({
    legajo: "50306",
    nombre: "Victoria",
    apellido: "Bay",
    correo: "victoriabayutn@gmail.com",
})
// insertedID: ObjectID('68db252b88de7ecc0bcebea5')

//query                                                         // Equivalencias:
db.alumnos.find()                                               // select * from alumnos
db.alumnos.find({ nombre: "Victoria" })                         // select * from alumnos a where a.nombre = "Victoria"
db.alumnos.find({ nombre: "Victoria" }, { correo: 1 })          // select a.correo from alumnos a where a.nombre = "Victoria"
db.alumnos.find({ nombre: "Victoria" }, { correo: 1, _id: 0 })  // idem anterior pero sin _id

db.alumnos.find({ _id: ObjectId('68db252b88de7ecc0bcebea5') })  // buscar por id

// update
db.alumnos.updateOne({ nombre: "Victoria" }, { $set: { correo: "mavictoriabay@gmail.com" } })

// delete
db.alumnos.deleteOne({ nombre: "Nicolás" })
db.alumnos.deleteOne({ nombre: "Victoria" })
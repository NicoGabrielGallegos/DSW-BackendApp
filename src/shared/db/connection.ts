import { MongoClient, Db } from "mongodb";

const connectionStr = process.env.MONGO_URI || "mongodb://127.0.0.1:27017"

const client = new MongoClient(connectionStr)
await client.connect()

export let db: Db = client.db("dswapp")
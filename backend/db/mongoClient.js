const { MongoClient, ObjectId } = require('mongodb');

const uri = `mongodb+srv://androhacker1234:2doo1FGYAkJGoVKz@cluster0.sxykn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri);

let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('passportAuthDB');
  }
  return db;
}

module.exports = { connectDB, ObjectId };

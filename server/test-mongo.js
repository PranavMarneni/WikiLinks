// test-mongo.js
import { MongoClient } from 'mongodb';
const uri = "mongodb+srv://nakulshah04:nakul-wikilinks@cluster0.x8vv2fg.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    console.log("Connected!");
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
run();
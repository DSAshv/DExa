import CouchDB from "node-couchdb";
import { DATABASE_LIST, SAMPLE_DATA } from "./database-collection-constants.js";

const dbClient = new CouchDB({
  auth: {
    user: "admin",
    pass: "12345678",
  },
});

async function initDatabase() {
  try {
    const databases = await dbClient.listDatabases();
    // DATABASE_LIST.forEach(async (database) => {
    //     if (!databases.includes(database)) {
    //         await dbClient.createDatabase(database);
    //         SAMPLE_DATA[database].forEach(async (document) => {
    //             await dbClient.insert(database, document);
    //         });
    //         console.log(`database - ${database} created`);
    //     } else {
    //         console.log(`database - ${database} already exists`);
    //     }
    // })
    // console.log("database initialization completed");
  } catch (error) {
    console.error("Error while connecting to database\n", error);
  }
}

export { dbClient as default, initDatabase };

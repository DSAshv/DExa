import { MongoClient, ServerApiVersion } from "mongodb";
import { DATABASE_LIST, DATABASE_COLLECTIONS_MAP } from "./database-collection-constants.js";


const URI = "mongodb+srv://vsv:dexa@cluster-dev.dryns.mongodb.net/?retryWrites=true&w=majority&appName=cluster-dev";

const dbClient = new MongoClient(URI, {
    // serverSelectionTimeoutMS: 5000, // Increase server selection timeout
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});


async function initDatabase() { 
    try {
        await dbClient.connect();
        console.log("connected to dexa mongodb cluster");
        const { databases: clusterDbList } = await dbClient.db().admin().listDatabases();
        
        await Promise.all(DATABASE_LIST.map(async(_clusterDb) => { 
            if (clusterDbList.findIndex((db) => db.name === _clusterDb) === -1) {
                const clusterDb = dbClient.db(_clusterDb);
                console.log(`database - ${_clusterDb} created`);
                await Promise.all(DATABASE_COLLECTIONS_MAP[_clusterDb].map(async(_clusterDbCollection) => {
                    await clusterDb.createCollection(_clusterDbCollection);
                    console.log(`collection - ${_clusterDbCollection} created in database - ${_clusterDb}`);
                }));
            } else {
                console.log(`database - ${_clusterDb} already exists`);
            }
        }));

        console.log("database initialization completed");
    } catch (error) {
        console.error("Error while connecting to database\n", error);
    } finally {
        await dbClient.close();
    }
}


export { dbClient as default, initDatabase };

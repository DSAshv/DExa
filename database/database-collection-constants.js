const DATABASE = {
    DEXA_CORE: "dexa-core", 
};

const COLLECTION = {
    USERS: "users",
    ORGANIZATIONS: "organizations",
    EXAMS: "exams"
};

const DATABASE_LIST = Object.values(DATABASE);

const DATABASE_COLLECTIONS_MAP = {
    [DATABASE.DEXA_CORE]: [
        COLLECTION.USERS,
        COLLECTION.ORGANIZATIONS,
        COLLECTION.EXAMS
    ],
};


export {
    DATABASE,
    COLLECTION,
    DATABASE_LIST,
    DATABASE_COLLECTIONS_MAP,
};

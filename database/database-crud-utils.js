import { ObjectId } from "mongodb";
import dbClient from "./database.js";
import { DATABASE, COLLECTION } from "./database-collection-constants.js";

// START OF USERS CRUD OPERATIONS

async function getUserById(_id, opts = {}) {
  try {
    await dbClient.connect();
    const user = await dbClient
      .db(DATABASE.DEXA_CORE)
      .collection(COLLECTION.USERS)
      .findOne({ _id: new ObjectId(_id) });
    if (user && !opts.includePassword) {
      delete user.password;
    }
    if (user.role === "orgAdmin") {
      const organizationInfo = await getOrganizationById(user.orgId);
      if (organizationInfo) {
        user.orgInfo = organizationInfo;
      }
    }
    return user;
  } catch (error) {
    console.error("Error while fetching user\n", error);
  } finally {
    await dbClient.close();
  }
}
export async function getExamsByOrgId(orgId, opts = {}) {
  try {
    await dbClient.connect();
    const exams = await dbClient
      .db(DATABASE.DEXA_CORE)
      .collection(COLLECTION.EXAMS)
      .find(opts.query) // Match documents with the specified orgId
      .sort({ createdAt: 1 }) // Sort by createdAt in ascending order (use -1 for descending)
      .toArray();
    return exams;
  } catch (error) {
  } finally {
    await dbClient.close();
  }
}

async function getUserByEmail(email, opts = {}) {
  try {
    await dbClient.connect();
    const user = await dbClient
      .db(DATABASE.DEXA_CORE)
      .collection(COLLECTION.USERS)
      .findOne({ email });
    if (user && !opts.includePassword) {
      delete user.password;
    }
    if (user.role === "orgAdmin") {
      const organizationInfo = await getOrganizationById(user.orgId);
      if (organizationInfo) {
        user.orgInfo = organizationInfo;
      }
    }
    return user;
  } catch (error) {
    console.error("Error while fetching user\n", error);
  } finally {
    await dbClient.close();
  }
}

async function isValidUser(uid) {
  const user = await getUserById(uid);
  return Boolean(user);
}

async function createUser(userInfo) {
  try {
    await dbClient.connect();
    const result = await dbClient
      .db(DATABASE.DEXA_CORE)
      .collection(COLLECTION.USERS)
      .insertOne(userInfo);
    return result;
  } catch (error) {
    console.error("Error while creating user\n", error);
  } finally {
    await dbClient.close();
  }
}

// END OF USERS CRUD OPERATIONS

// START OF ORGANIZATIONS CRUD OPERATIONS

async function getOrganizationById(_id) {
  try {
    await dbClient.connect();
    const organization = await dbClient
      .db(DATABASE.DEXA_CORE)
      .collection(COLLECTION.ORGANIZATIONS)
      .findOne({ _id: new ObjectId(_id) });
    return organization;
  } catch (error) {
    console.error("Error while fetching organization\n", error);
  } finally {
    await dbClient.close();
  }
}

// END OF ORGANIZATIONS CRUD OPERATIONS

// START OF EXAMS CRUD OPERATIONS

async function createExam(examInfo) {
  try {
    await dbClient.connect();
    const result = await dbClient
      .db(DATABASE.DEXA_CORE)
      .collection(COLLECTION.EXAMS)
      .insertOne(examInfo);
    return result;
  } catch (error) {
    console.error("Error while creating exam\n", error);
  } finally {
    await dbClient.close();
  }
}

// END OF EXAMS CRUD OPERATIONS

export default {
  getUserById,
  getUserByEmail,
  isValidUser,
  createUser,
  getOrganizationById,
  createExam,
};

export {
  getUserById,
  getUserByEmail,
  isValidUser,
  createUser,
  getOrganizationById,
  createExam,
};

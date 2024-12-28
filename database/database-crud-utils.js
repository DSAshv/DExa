import dbClient from "./database.js";
import { DATABASE } from "./database-collection-constants.js";

// START OF USERS CRUD OPERATIONS

async function getUserById(_id, opts = {}) {
  try {
    const query = {
      "selector": {_id},
      "fields": ["_id", "name", "email", "role", "orgId", "dateOfBirth", "location", "pincode", ...(opts.includePassword ? ["password"] : [])]
    }
    const users = await dbClient.mango(DATABASE.USERS, query);
    const user = users.data.docs?.[0];
    if (user?.role === "orgAdmin") {
      const orgQuery = {
        "selector": {"_id": user.orgId},
        "fields": ["_id", "name"]
      }
      const organization = await dbClient.mango(DATABASE.ORGANIZATIONS, orgQuery);
      if (organization.data.docs?.[0]) {
        user.orgInfo = organization.data.docs[0];
      }
    }
    console.log(user);
    return user;
  } catch (error) {
    console.error("Error while fetching user\n", error);
  }
}

async function getUserByEmail(email, opts = {}) {
  try {
    const query = {
      "selector": {email},
      "fields": ["_id", "name", "email", "role", "orgId", "dateOfBirth", "location", "pincode", ...(opts.includePassword ? ["password"] : [])]
    }
    const users = await dbClient.mango(DATABASE.USERS, query);
    const user = users.data.docs?.[0];
    if (user?.role === "orgAdmin") {
      const orgQuery = {
        "selector": {"_id": user.orgId},
        "fields": ["_id", "name"]
      }
      const organization = await dbClient.mango(DATABASE.ORGANIZATIONS, orgQuery);
      if (organization.data.docs?.[0]) {
        user.orgInfo = organization.data.docs[0];
      }
    }
    console.log(user);
    return user;
  } catch (error) {
    console.error("Error while fetching user\n", error);
  }
}

async function isValidUser(uid) {
  const user = await getUserById(uid);
  return Boolean(user);
}

async function createUser(userInfo) {
  try {
    const user = await dbClient.insert(DATABASE.USERS, userInfo);
    return {_id: user.data.id, ...userInfo};
  } catch (error) {
    console.error("Error while creating user\n", error);
  }
}

// END OF USERS CRUD OPERATIONS

// START OF ORGANIZATIONS CRUD OPERATIONS

async function getOrganizationById(_id) {
  try {
    const query = {
      "selector": {_id},
      "fields": ["_id", "name"]
    }
    const collections = await dbClient.mango(DATABASE.ORGANIZATIONS, query);
    const collection = collections.data.docs?.[0];
    console.log(collection);
    return collection;
  } catch (error) {
    console.error("Error while fetching organization\n", error);
  }
}

// END OF ORGANIZATIONS CRUD OPERATIONS

// START OF EXAMS CRUD OPERATIONS

async function createExam(examInfo) {
  try {
    const exam = await dbClient.insert(DATABASE.EXAMS, examInfo);
    return {_id: exam.data.id, ...examInfo};
  } catch (error) {
    console.error("Error while creating exam\n", error);
  }
}

export async function getExamsByOrgId(orgId, opts = {}) {
  try {
    const query = {
      "selector": {orgId},
      "fields": [
        "_id",
        "orgId",
        "orgAdminId",
        "name",
        "description",
        "instructions",
        "startTime",
        "duration",
        "passPercentage",
        "numberOfQuestions",
        "status",
        "qbStoreId",
        "createdAt"
      ]
    }
    const _exams = await dbClient.mango(DATABASE.EXAMS, query);
    const exams = [];
    _exams?.data?.docs?.forEach(async (exam) => {
      exam.orgAdminInfo = await getUserById(exam.orgAdminId);
      exam.orgInfo = await getOrganizationById(exam.orgId);
    })
    console.log(exams);
    return exams;
  } catch (error) {
    console.error("Error while fetching exams\n", error);
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

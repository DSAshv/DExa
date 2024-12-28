import dbClient from "./database.js";
import { DATABASE } from "./database-collection-constants.js";
import { EXAM_STATUS } from "../common/constants/common-constants.js";

// START OF USERS CRUD OPERATIONS

async function getUserById(_id, opts = {}) {
  try {
    const query = {
      selector: { _id },
      fields: [
        "_id",
        "name",
        "email",
        "role",
        "orgId",
        "dateOfBirth",
        "location",
        "pincode",
        ...(opts.includePassword ? ["password"] : []),
      ],
    };
    const users = await dbClient.mango(DATABASE.USERS, query);
    const user = users.data.docs?.[0];
    if (user?.role === "orgAdmin") {
      const orgQuery = {
        selector: { _id: user.orgId },
        fields: ["_id", "name"],
      };
      const organization = await dbClient.mango(
        DATABASE.ORGANIZATIONS,
        orgQuery
      );
      if (organization.data.docs?.[0]) {
        user.orgInfo = organization.data.docs[0];
      }
    }
    return user;
  } catch (error) {
    console.error("Error while fetching user\n", error);
  }
}

async function getUserByEmail(email, opts = {}) {
  try {
    const query = {
      selector: { email },
      fields: [
        "_id",
        "name",
        "email",
        "role",
        "orgId",
        "dateOfBirth",
        "location",
        "pincode",
        ...(opts.includePassword ? ["password"] : []),
      ],
    };
    const users = await dbClient.mango(DATABASE.USERS, query);
    const user = users.data.docs?.[0];
    if (user?.role === "orgAdmin") {
      const orgQuery = {
        selector: { _id: user.orgId },
        fields: ["_id", "name"],
      };
      const organization = await dbClient.mango(
        DATABASE.ORGANIZATIONS,
        orgQuery
      );
      if (organization.data.docs?.[0]) {
        user.orgInfo = organization.data.docs[0];
      }
    }
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
    return { _id: user.data.id, ...userInfo };
  } catch (error) {
    console.error("Error while creating user\n", error);
  }
}

// END OF USERS CRUD OPERATIONS

// START OF ORGANIZATIONS CRUD OPERATIONS

async function getOrganizationById(_id) {
  try {
    const query = {
      selector: { _id },
      fields: ["_id", "name"],
    };
    const collections = await dbClient.mango(DATABASE.ORGANIZATIONS, query);
    const collection = collections.data.docs?.[0];
    return collection;
  } catch (error) {
    console.error("Error while fetching organization\n", error);
  }
}

async function getCidByExamAndSet(examId, setId) {
  const criteria = {
    exam_id: { $eq: examId },
    set_id: { $eq: setId },
  };

  try {
    const query = {
      selector: criteria,
      fields: ["cid"],
    };
    const collections = await dbClient.mango(DATABASE.ORGANIZATIONS, query);
    return collections; // This will return an object containing matching documents
  } catch (error) {
    console.error("Error while fetching Setpaper\n", error);
  }
}

// END OF ORGANIZATIONS CRUD OPERATIONS

// START OF EXAMS CRUD OPERATIONS

async function createExam(examInfo) {
  try {
    const exam = await dbClient.insert(DATABASE.EXAMS, examInfo);
    return { _id: exam.data.id, ...examInfo };
  } catch (error) {
    console.error("Error while creating exam\n", error);
  }
}

async function getExamsByOrgId(orgId, opts = {}) {
  try {
    const query = {
      selector: { orgId },
      fields: [
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
        ...(opts.includeQbStoreId ? ["qbStoreId"] : []),
        "createdAt",
      ],
    };
    const _exams = await dbClient.mango(DATABASE.EXAMS, query);
    const exams = [];
    _exams?.data?.docs?.forEach(async (exam) => {
      exam.orgAdminInfo = await getUserById(exam.orgAdminId);
      exam.orgInfo = await getOrganizationById(exam.orgId);
    });
    return exams;
  } catch (error) {
    console.error("Error while fetching exams\n", error);
  }
}

async function getAllExams(opts = {}) {
  try {
    const query = {
      ...(opts.query || {}),
      fields: [
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
        "createdAt",
        ...(opts.includeQbStoreId ? ["qbStoreId"] : []),
      ],
    };
    const exams = await dbClient.mango(DATABASE.EXAMS, query);
    exams?.data?.docs?.forEach(async (exam) => {
      exam.orgAdminInfo = await getUserById(exam.orgAdminId);
      exam.orgInfo = await getOrganizationById(exam.orgId);
    });
    return exams?.data?.docs || [];
  } catch (error) {
    console.error("Error while fetching exams\n", error);
  }
}

async function getQBStoreId(examId, opts = {}) {
  try {
    const exam = await dbClient.mango(DATABASE.EXAMS, {
      selector: {
        _id: examId,
      },
      fields: ["qbStoreId"],
    });
    return exam.data.docs[0].qbStoreId;
  } catch (error) {
    console.error("Error while fetching QB store ID of exam\n", error);
  }
}
async function insertIntoExamset(examSet) {
  try {
    const user = await dbClient.insert(DATABASE.EXAM_SET, examSet);
  } catch (error) {
    console.error("Error while creating user\n");
  }
}
async function insertIntoExamresult(insertQuery) {
  try {
    const user = await dbClient.insert(DATABASE.EXAM_RESULT, insertQuery);
  } catch (error) {
    console.error("Error while inserting data into exam result");
  }
}

async function getExamStatus(examID, opts = {}) {
  try {
    const query = {
      selector: { _id: examID },
      fields: [
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
        "createdAt",
        ...(opts.includeQbStoreId ? ["qbStoreId"] : []),
      ],
    };
    const exams = await dbClient.mango(DATABASE.EXAMS, query);
    const exam = exams?.data?.docs?.[0];
    if (!exam) {
      return { mode: "notFound", message: "Exam not found." };
    }

    const currentTime = Date.now();
    const examStartTime = parseInt(exam.startTime, 10) * 1000; // Convert to milliseconds

    if (currentTime < examStartTime) {
      const date = new Date(examStartTime);
      const optionsDate = { year: "numeric", month: "2-digit", day: "2-digit" };
      const optionsTime = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };

      return {
        mode: EXAM_STATUS.EXAM_SCHEDULED,
        message: `Exam will start on ${date.toLocaleDateString(
          "en-US",
          optionsDate
        )} at ${date.toLocaleTimeString("en-US", optionsTime)}.`,
      };
    } else if (currentTime > examStartTime + exam.duration * 60 * 1000) {
      return { mode: EXAM_STATUS.EXAM_ENDED, message: "Exam has ended." };
    } else {
      return { mode: EXAM_STATUS.EXAM_LIVE, message: "Exam is live." };
    }
  } catch (error) {
    console.error("Error fetching exam status:", error);
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
  getExamsByOrgId,
  getAllExams,
  getQBStoreId,
  getExamStatus,
};

export {
  insertIntoExamresult,
  getCidByExamAndSet,
  insertIntoExamset,
  getUserById,
  getUserByEmail,
  isValidUser,
  createUser,
  getOrganizationById,
  createExam,
  getExamsByOrgId,
  getAllExams,
  getQBStoreId,
  getExamStatus,
};

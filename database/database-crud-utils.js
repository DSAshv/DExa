import dbClient from "./database.js";
import { DATABASE } from "./database-collection-constants.js";
import { EXAM_STATUS, USER_ROLES } from "../common/constants/common-constants.js";

// START OF USERS CRUD OPERATIONS

async function getUserById(_id, opts = {}) {
  try {
    const query = {
      "selector": {_id},
      "fields": ["_id", "_rev", "name", "email", "role", "orgId", "dateOfBirth", "location", "pincode", ...(opts.includePassword ? ["password"] : [])]
    }
    const users = await dbClient.mango(DATABASE.USERS, query);
    const user = users.data.docs?.[0];
    if (user?.role === "orgAdmin") {
      const orgQuery = {
        "selector": {"_id": user.orgId},
        "fields": ["_id", "_rev", "name"]
      }
      const organization = await dbClient.mango(DATABASE.ORGANIZATIONS, orgQuery);
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
      "selector": {email},
      "fields": ["_id", "_rev", "name", "email", "role", "orgId", "dateOfBirth", "location", "pincode", ...(opts.includePassword ? ["password"] : [])]
    }
    const users = await dbClient.mango(DATABASE.USERS, query);
    const user = users.data.docs?.[0];
    if (user?.role === "orgAdmin") {
      const orgQuery = {
        "selector": {"_id": user.orgId},
        "fields": ["_id", "_rev", "name"]
      }
      const organization = await dbClient.mango(DATABASE.ORGANIZATIONS, orgQuery);
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
      "fields": ["_id", "_rev", "name"]
    }
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
    return {_id: exam.data.id, ...examInfo};
  } catch (error) {
    console.error("Error while creating exam\n", error);
  }
}

async function getExamById(examId, opts = {}) {
  try {
    const query = {
      "selector": {"_id": examId},
      "fields": [
        "_id",
        "_rev",
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
        "createdAt"
      ]
    }
    const exams = await dbClient.mango(DATABASE.EXAMS, query);
    const exam = exams.data.docs[0];
    exam.orgAdminInfo = await getUserById(exam.orgAdminId);
    exam.orgInfo = await getOrganizationById(exam.orgId);
    if (opts.userInfo?.role === "student") {
      exam.hasRegistered = await isUserRegisteredForExam(examId, opts.userInfo?._id);
    }
    return exam;
  } catch (error) {
    console.error("Error while fetching exam\n", error);
  }
}

async function getExamsByOrgId(orgId, opts = {}) {
  try {
    const query = {
      "selector": {orgId},
      "fields": [
        "_id",
        "_rev",
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
      if (opts.userInfo.role !== USER_ROLES.STUDENT) {
        exam.registrations = await getExamRegistrations(exam._id, opts);
      }
    })
    return exams;
  } catch (error) {
    console.error("Error while fetching exams\n", error);
  }
}

async function getAllExams(userInfo, opts = {}) {
  try {
    const query = {
      ...(opts.query || {}),
      "fields": [
        "_id",
        "_rev",
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
    const _exams = await Promise.all(exams?.data?.docs?.map(async (exam) => {
      return await {
        ...exam,
        orgAdminInfo: await getUserById(exam.orgAdminId),
        orgInfo: await getOrganizationById(exam.orgId),
        ...(userInfo?.role === USER_ROLES.STUDENT ? { hasRegistered: await isUserRegisteredForExam(exam._id, userInfo._id) } : {}),
        ...(userInfo?.role !== USER_ROLES.STUDENT ? { registrations: await getExamRegistrations(exam._id, opts) } : {})
      }
    }));
    return _exams || [];
  } catch (error) {
    console.error("Error while fetching exams\n", error);
  }
}

async function getQBStoreId(examId, opts = {}) {
  try {
    const exam = await dbClient.mango(DATABASE.EXAMS, {
      "selector": {
        "_id": examId
      },
      "fields": ["qbStoreId"]
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
      "selector": {"_id": examID},
      "fields": [
        "_id",
        "_rev",
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
    } else if (
      currentTime >
      examStartTime + exam.duration * 60 * 1000
    ) {
      return { mode: EXAM_STATUS.EXAM_ENDED, message: "Exam has ended." };
    } else {
      return { mode: EXAM_STATUS.EXAM_LIVE, message: "Exam is live." };
    }
  } catch (error) {
    console.error("Error fetching exam status:", error);
  }
}

//console.log(await getExamStatus("f164ac84ed0eb27c55cb5c6a3001f08a"))

// END OF EXAMS CRUD OPERATIONS

// START OF REGISTRATIONS CRUD OPERATIONS

async function createExamRegistration(registrationInfo) {
  try {
    const registration = await dbClient.insert(DATABASE.REGISTRATIONS, registrationInfo);
    return {_id: registration.data.id, ...registrationInfo};
  } catch (error) {
    console.error("Error while creating exam registration\n", error);
  }
}

async function getExamRegistrations(examId, opts = {}) {
  const query = {
    "selector": {examId},
    "fields": ["_id", "_rev", "examId", "studentId", "orgId", "orgAdminId", "createdAt"]
  }
  const registrations = await dbClient.mango(DATABASE.REGISTRATIONS, query);
  const _registrations = await Promise.all(registrations?.data?.docs?.map(async (registration) => await ({
    ...registration,
    studentInfo: await getUserById(registration.studentId, opts),
    orgAdminInfo: await getUserById(registration.orgAdminId, opts),
    orgInfo: await getOrganizationById(registration.orgId, opts)
  })))
  return _registrations || [];
}

async function isUserRegisteredForExam(examId, studentId) {
  const query = {
    "selector": {examId, studentId},
    "fields": ["_id"]
  }
  const registrations = await dbClient.mango(DATABASE.REGISTRATIONS, query);
  return Boolean(registrations?.data?.docs?.length);
}

async function updateExamById(examInfo) {
  try {
    const exam = await dbClient.update(DATABASE.EXAMS, examInfo);
    return {_id: exam.data.id, ...examInfo};
  } catch (error) {
    console.error("Error while updating exam\n", error);
  }
}

// END OF REGISTRATIONS CRUD OPERATIONS

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
  getExamRegistrations,
  getExamById,
  createExamRegistration,
  isUserRegisteredForExam,
  updateExamById
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
  getExamRegistrations,
  getExamById,
  createExamRegistration,
  isUserRegisteredForExam,
  updateExamById
};

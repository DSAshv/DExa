import express from "express";
import {
  handleLogout,
  handleSignIn,
  handleSignUp,
} from "../../common/server/api-handlers.js";
import { API_RESPONSE } from "../../common/constants/common-constants.js";
import {
  EXAM_STATUS,
  USER_ROLES,
} from "../../common/constants/common-constants.js";
import dbClient from "../../database/database-crud-utils.js";
import { parse } from "csv-parse";
import { Readable } from "stream";
import { addQbToIpfs } from "../../common/server/ipfs.js";


const router = express.Router();

router.post("/signin", (request, response) => {
  handleSignIn(request, response);
});

router.post("/signup", (request, response) => {
  handleSignUp(request, response);
});

router.post("/logout", (request, response) => {
  handleLogout(request, response);
});

router.post("/exams", async (request, response) => {
  try {
    const { mode } = request.body;
    const userInfo = request.config?.userInfo;
    if (!request.config?.authorized || !userInfo) {
      return response.status(200).json({
        result: API_RESPONSE.FAILURE,
        data: {
          message: "Get Exams failed - Unauthorized access",
        },
      });
    }

    let query = {};
    if (mode === "get") {
      query = {
        "selector": {
          "status": {
            "$in": [EXAM_STATUS.APPLICATION_OPEN, EXAM_STATUS.EXAM_SCHEDULED, EXAM_STATUS.EXAM_LIVE]
          }
        }
      };
      if (userInfo.role === USER_ROLES.ORGADMIN) {
        query.selector.orgId = userInfo.orgId.toString();
      }
    }

    let examList = await dbClient.getAllExams({ query });
    return response.status(200).json({
      result: API_RESPONSE.SUCCESS,
      data: {
        message: "Exams fetched succesfully ",
        exams: examList,
      },
    });
  } catch (error) {
    console.log(error);

    return response.status(500).json({
      result: API_RESPONSE.FAILURE,
      data: {
        message: "Get Exams failed - Internal Server Error",
      },
    });
  }
});

router.post("/createexam", async (request, response) => {
  try {
    const { userInfo } = request.config || {};
    if (!userInfo || userInfo?.role !== "orgAdmin") {
        return response.status(200).json({
            result: API_RESPONSE.FAILURE,
            data: {
                message: "Create Exam failed - Unauthorized access",
            },
        });

    }
    const {
      name,
      description,
      instructions,
      startTime,
      duration,
      passPercentage,
      numberOfQuestions,
    } = request.body;

    if (
      !name ||
      !description ||
      !instructions ||
      !startTime ||
      !duration ||
      !passPercentage ||
      !numberOfQuestions
    ) {
      return response.status(200).json({
        result: API_RESPONSE.FAILURE,
        data: {
          message: "Create Exam failed - Invalid data",
        },
      });
    }

    const questionBank = request.files[0];

    if (
      !questionBank ||
      questionBank.fieldname !== "questionBank" ||
      questionBank.mimetype !== "text/csv"
    ) {
      return response.status(200).json({
        result: API_RESPONSE.FAILURE,
        data: {
          message:
            questionBank?.mimetype !== "text/csv"
              ? "Question bank is not in csv format"
              : "Create Exam Failed - Question bank not found",
        },
      });
    }

    const csvStream = Readable.from(questionBank.buffer.toString());
    const rows = [];
    const headers = await new Promise((resolve, reject) => {
      const parser = csvStream.pipe(parse({ columns: true }));
      parser.on("data", (data) => {
        rows.push(data);
      });
      parser.on("end", () => {
        resolve(Object.keys(rows[0]));
      });
      parser.on("error", (error) => {
        reject(error);
      });
    });

    const requiredHeaders = [
      "question",
      "optionA",
      "optionB",
      "optionC",
      "optionD",
      "correctOption",
    ];
    if (!requiredHeaders.every((header) => headers.includes(header))) {
      return response.status(200).json({
        result: API_RESPONSE.FAILURE,
        data: {
          message: "Create Exam failed - Invalid question bank format",
        },
      });
    }

    for (const row of rows) {
      if (requiredHeaders.some((header) => !row[header])) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Create Exam failed - Question bank contains empty fields",
          },
        });
      }
      const correctOption = row.correctOption;
      if (
        ![row.optionA, row.optionB, row.optionC, row.optionD].includes(
          correctOption
        )
      ) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message:
              "Create Exam failed - Invalid correct option in question bank",
          },
        });
      }
    }

    let qbStoreID;
    try {
      qbStoreID = await addQbToIpfs(questionBank);
    } catch (error) {
      return response.status(200).json({
        result: API_RESPONSE.FAILURE,
        data: {
          message: "Unable to upload question bank to IPFS",
        },
      });
    }

    const examInfo = await dbClient.createExam({
      orgId: userInfo.orgId.toString(),
      orgAdminId: userInfo._id.toString(),
      name,
      description,
      instructions,
      startTime,
      duration,
      passPercentage,
      numberOfQuestions,
      status: EXAM_STATUS.APPLICATION_OPEN,
      createdAt: String(Date.now()),
      qbStoreID: qbStoreID,
    });

    if (examInfo) {
      return response.status(200).json({
        result: API_RESPONSE.SUCCESS,
        data: {
          message: "Create Exam successful",
          examInfo,
        },
      });
    }

    return response.status(200).json({
      result: API_RESPONSE.FAILURE,
      data: {
        message: "Create Exam failed - Error in creating exam",
      },
    });
  } catch (error) {
    console.log(error);
    return response.status(500).json({
      result: API_RESPONSE.FAILURE,
      data: {
        message: "Create Exam failed - Internal Server Error",
      },
    });
  }
});

export default router;

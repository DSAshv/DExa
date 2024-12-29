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
import pdf from "pdfkit";
import cron from "node-cron";
import { setSetPaper } from "../../exam/server/question-bank.js";
import { deployNFT } from "../../common/transactions/createQPNFT.js";
import schedule from "node-schedule";

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
    const { mode, examId } = request.body;
    const userInfo = request.config?.userInfo;
    const examInfo = await dbClient.getExamById(examId, {
      userInfo,
      includeOthers: false,
    });

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
        selector: {
          status: {
            $in: [
              EXAM_STATUS.APPLICATION_OPEN,
              EXAM_STATUS.EXAM_SCHEDULED,
              EXAM_STATUS.EXAM_LIVE,
            ],
          },
        },
      };
      if (userInfo.role === USER_ROLES.ORGADMIN) {
        query.selector.orgId = userInfo.orgId;
      }
      let examList = await dbClient.getAllExams(userInfo, { query });
      return response.status(200).json({
        result: API_RESPONSE.SUCCESS,
        data: {
          message: "Exams fetched succesfully ",
          exams: examList,
        },
      });
    } else if (mode === "schedule") {
      if (!examId) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Schedule Exam failed - Exam ID missing",
          },
        });
      }
      const unixTimestamp = examInfo.startTime;
      // const startTime = new Date(examInfo.startTime); // Convert timestamp to Date object

      // const jobTime = new Date(startTime.getTime() - 1 * 60 * 1000); // 1 minute later
      console.log("first");
      console.log(unixTimestamp);

      const currentTimeInMs = Date.now();

      // Calculate the delay
      const delay = unixTimestamp - currentTimeInMs;
      setTimeout(function () {
        setSetPaper(examInfo._id); // Call function to set the paper
        console.log("Job executed: here11111");
      }, delay);
      const fiveMinutesInMs = examInfo.duration * 60 * 1000;
      console.log("second");
      console.log(
        parseInt(unixTimestamp, 10) +
          parseInt(fiveMinutesInMs, 10) -
          currentTimeInMs
      );
      let mytime = parseInt(unixTimestamp, 10) + parseInt(fiveMinutesInMs, 10);
      setTimeout(async function () {
        try {
          dbClient.updateExamById(examInfo._id, {
            status: EXAM_STATUS.EXAM_LIVE,
          });
          let cid1 = await dbClient.getCidByExamAndSet(examInfo._id, 1);
          let cid2 = await dbClient.getCidByExamAndSet(examInfo._id, 2);
          let hashToken1 = deployNFT(
            examInfo.name,
            1,
            `http://127.0.0.1:8080/ipfs/${cid1.data.docs[0].cid}`,
            examInfo.description
          );
          let hashToken2 = deployNFT(
            examInfo.name,
            2,
            `http://127.0.0.1:8080/ipfs/${cid2.data.docs[0].cid}`,
            examInfo.description
          );
          hashToken1.then(
            (value) => {
              dbClient.setNftHashToken({
                nfttoken: value,
                exam_id: examInfo._id,
                set_id: 1,
              });
            },
            (reason) => {
              console.log(reason);
            }
          );
          hashToken2.then(
            (value) => {
              dbClient.setNftHashToken({
                nfttoken: value,
                exam_id: examInfo._id,
                set_id: 2,
              });
            },
            (reason) => {
              console.log(reason);
            }
          );
          // dbClient.setNftHashToken(examInfo._id, 2, hashToken2);
          console.log("here111112222");
        } catch (err) {
          console.log(err);
        }
      }, mytime - Date.now());

      if (!examInfo) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Schedule Exam failed - Exam not found",
          },
        });
      }

      if (examInfo.status === EXAM_STATUS.EXAM_SCHEDULED) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Schedule Exam failed - Exam already scheduled",
          },
        });
      }

      if (examInfo.status !== EXAM_STATUS.APPLICATION_OPEN) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Schedule Exam failed - Exam is not open for scheduling",
          },
        });
      }

      const updatedExamInfo = await dbClient.updateExamById(examInfo._id, {
        status: EXAM_STATUS.EXAM_SCHEDULED,
      });

      if (updatedExamInfo) {
        return response.status(200).json({
          result: API_RESPONSE.SUCCESS,
          data: {
            message: "Exam Scheduled Successfully",
            examInfo: updatedExamInfo,
          },
        });
      }

      return response.status(200).json({
        result: API_RESPONSE.FAILURE,
        data: {
          message: "Schedule Exam failed - Error in scheduling exam",
        },
      });
    } else if (mode === "register") {
      if (!examId) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Register Exam failed - Exam ID missing",
          },
        });
      }

      if (!examInfo) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Register Exam failed - Exam not found",
          },
        });
      }

      const isUserRegisteredForExam = await dbClient.isUserRegisteredForExam(
        examId,
        userInfo._id
      );
      if (isUserRegisteredForExam) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Register Exam failed - User already registered for exam",
          },
        });
      }

      if (examInfo.status !== EXAM_STATUS.APPLICATION_OPEN) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Register Exam failed - Exam is not open for registration",
          },
        });
      }

      const registrationInfo = await dbClient.createExamRegistration({
        examId,
        studentId: userInfo._id,
        createdAt: String(Date.now()),
      });

      if (registrationInfo) {
        return response.status(200).json({
          result: API_RESPONSE.SUCCESS,
          data: {
            message: "Exam Registration successful",
            registrationInfo,
          },
        });
      }

      return response.status(200).json({
        result: API_RESPONSE.FAILURE,
        data: {
          message: "Register Exam failed - Error in registering exam",
        },
      });
    } else if (mode === "schedule") {
      const { examId } = request.body;
      if (!examId) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Schedule Exam failed - Exam ID missing",
          },
        });
      }
      const targetDate = new Date(examInfo.startTime - 60 * 1000);
      console.log(targetDate);

      schedule.scheduleJob(targetDate, () => {
        console.log("here11111");

        setSetPaper(examInfo._id);
      });
      const dateInMilliseconds = examInfo.startTime * 1000;
      const newDateInMilliseconds =
        dateInMilliseconds + (examInfo.duration + 2) * 60 * 1000;
      console.log(newDateInMilliseconds);

      schedule.scheduleJob(
        Math.floor(newDateInMilliseconds / 1000),
        async () => {
          console.log("here111112222");

          let cid1 = dbClient.getCidByExamAndSet(examInfo._id, 1);
          let cid2 = dbClient.getCidByExamAndSet(examInfo._id, 2);
          let hashToken1 = await deployNFT(
            examInfo.name,
            1,
            `http://127.0.0.1:8080/ipfs/${cid1}`,
            examInfo.description
          );
          let hashToken2 = await deployNFT(
            examInfo.name,
            2,
            `http://127.0.0.1:8080/ipfs/${cid2}`,
            examInfo.description
          );
          dbClient.setNftHashToken(examInfo._id, 1, hashToken1);
          dbClient.setNftHashToken(examInfo._id, 2, hashToken2);
        }
      );

      if (!examInfo) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Schedule Exam failed - Exam not found",
          },
        });
      }

      if (examInfo.status === EXAM_STATUS.EXAM_SCHEDULED) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Schedule Exam failed - Exam already scheduled",
          },
        });
      }

      if (examInfo.status !== EXAM_STATUS.APPLICATION_OPEN) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Schedule Exam failed - Exam is not open for scheduling",
          },
        });
      }

      const updatedExamInfo = await dbClient.updateExamById(examId, {
        status: EXAM_STATUS.EXAM_SCHEDULED,
      });

      if (updatedExamInfo) {
        return response.status(200).json({
          result: API_RESPONSE.SUCCESS,
          data: {
            message: "Exam Scheduled Successfully",
            examInfo: updatedExamInfo,
          },
        });
      }

      return response.status(200).json({
        result: API_RESPONSE.FAILURE,
        data: {
          message: "Schedule Exam failed - Error in scheduling exam",
        },
      });
    } else if (mode === "downloadHallTicket") {
      const { examId } = request.body;
      if (!examId) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Download Hall Ticket failed - Exam ID missing",
          },
        });
      }

      const examInfo = await dbClient.getExamById(examId, { userInfo });
      if (!examInfo) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Download Hall Ticket failed - Exam not found",
          },
        });
      }

      if (examInfo.status !== EXAM_STATUS.EXAM_SCHEDULED) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message: "Download Hall Ticket failed - Exam is not scheduled",
          },
        });
      }

      const registrationInfo = await dbClient.isUserRegisteredForExam(
        examId,
        userInfo._id
      );
      if (!registrationInfo) {
        return response.status(200).json({
          result: API_RESPONSE.FAILURE,
          data: {
            message:
              "Download Hall Ticket failed - User not registered for exam",
          },
        });
      }

      // Generate PDF
      const doc = new pdf();
      let buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        let pdfData = Buffer.concat(buffers);
        response.set({
          "Content-Length": Buffer.byteLength(pdfData),
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=hall_ticket.pdf",
        });
        response.send(pdfData);
      });

      doc.fontSize(20).text("Hall Ticket", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Exam Name: ${examInfo.name}`);
      doc.text(`Description: ${examInfo.description}`);
      doc.text(`Instructions: ${examInfo.instructions}`);
      doc.text(`Start Time: ${new Date(examInfo.startTime).toLocaleString()}`);
      doc.text(`Duration: ${examInfo.duration} minutes`);
      doc.text(`Pass Percentage: ${examInfo.passPercentage}%`);
      doc.moveDown();
      doc.text(`Student Name: ${userInfo.name}`);
      doc.text(`Student Email: ${userInfo.email}`);
      doc.text(`Registration ID: ${registrationInfo._id}`);
      doc.end();
    }
  } catch (error) {
    console.log(error);

    return response.status(500).json({
      result: API_RESPONSE.FAILURE,
      data: {
        message: "Error occured - Internal Server Error",
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
      // const correctOption = row.correctOption;
      // if (
      //   ![row.optionA, row.optionB, row.optionC, row.optionD].includes(
      //     correctOption
      //   )
      // ) {
      //   return response.status(200).json({
      //     result: API_RESPONSE.FAILURE,
      //     data: {
      //       message:
      //         "Create Exam failed - Invalid correct option in question bank",
      //     },
      //   });
      // }
    }

    let qbStoreId;
    try {
      qbStoreId = await addQbToIpfs(questionBank);
    } catch (error) {
      return response.status(200).json({
        result: API_RESPONSE.FAILURE,
        data: {
          message: "Unable to upload question bank to IPFS",
        },
      });
    }

    const examInfo = await dbClient.createExam({
      orgId: userInfo.orgId,
      orgAdminId: userInfo._id,
      name,
      description,
      instructions,
      startTime,
      duration,
      passPercentage,
      numberOfQuestions,
      status: EXAM_STATUS.APPLICATION_OPEN,
      createdAt: String(Date.now()),
      qbStoreId,
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

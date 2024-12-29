import express from "express";
import {
  handleSignIn,
  handleSignUp,
  handleLogout
} from "../../common/server/api-handlers.js";
import { getSetPaper, setStudentResponse } from "../server/question-bank.js";
import { API_RESPONSE } from "../../common/constants/common-constants.js";

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

router.post("/studentResponse", async (request, response) => {
  let { examId, studentId, setid, studentanswer } = request.body;

  let a = await setStudentResponse({ examId, studentId, setid, studentanswer });
});
router.get("/livepaper", (request, response) => {
  let { examId } = request.body;
  if (!examId) {
    return response.status(200).json({
      result: API_RESPONSE.FAILURE,
      data: {
        message: "Create Exam failed - Question bank contains empty fields",
      },
    });
  }
  let { setpaper, setId } = getSetPaper(examId);
});
export default router;

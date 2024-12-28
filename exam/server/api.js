import express from "express";
import {
  handleSignIn,
  handleSignUp,
} from "../../common/server/api-handlers.js";
import { getSetPaper } from "../server/question-bank.js";

const router = express.Router();

router.post("/signin", (request, response) => {
  handleSignIn(request, response);
});

router.post("/signup", (request, response) => {
  handleSignUp(request, response);
});
router.post("/studentResponse", (request, response) => {
  handleSignUp(request, response);
});
router.get("/livepaper", (request, response) => {
  let { examId } = request.body;
  getSetPaper(examId);
});
export default router;

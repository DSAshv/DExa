import express from "express";
import {
  handleSignIn,
  handleSignUp,
} from "../../common/server/api-handlers.js";
import {
  getNFT,
  getStudentanswer,
} from "../../database/database-crud-utils.js";
import { getTransactionDetails } from "../../common/transactions/verifyTxnHash.js";
import { API_RESPONSE } from "../../common/constants/common-constants.js";

const router = express.Router();

router.post("/signin", (request, response) => {
  handleSignIn(request, response);
});

router.post("/signup", (request, response) => {
  handleSignUp(request, response);
});
router.post("/signup", (request, response) => {
  handleSignUp(request, response);
});
router.get("/studentResult", (request, response) => {
  let { student_id, exam_id } = request.body;

  return response.status(200).json({
    result: API_RESPONSE.SUCCESS,
    data: {
      message: studentResult({ student_id, exam_id }),
    },
  });

  //   handleSignUp(request, response);
});

async function studentResult(otps = {}) {
  let { studentid, exam_id } = otps;
  let std_resp = await getStudentanswer(studentid, exam_id);
  let nft = await getNFT(std_resp.data.docs[0].setzid, exam_id);
  let a = "dsaf";
  let resp = std_resp.data.docs[0];
  //   resp["nfttoken"] = nft.data.docs[0].nfttoken;
  resp["student_id"] = studentid;
  resp["exam_id"] = exam_id;
  resp["transaction_hash"] = await getTransactionDetails(
    nft.data.docs[0].nfttoke
  );

  return resp;
}
studentResult({
  studentid: "f282be5656079819ffed9673a7002115",
  exam_id: "f282be5656079819ffed9673a7045152",
});

export default router;

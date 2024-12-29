import {
  getQBStoreId,
  insertIntoExamset,
  getCidByExamAndSet,
  insertIntoExamresult,
} from "../../database/database-crud-utils.js";
import Papa from "papaparse";
import { addStringToIpfs, retrieveIpfsFile } from "../../common/server/ipfs.js";
import { Readable } from "stream";

export async function getQb(examId) {
  const cid = await getQBStoreId(examId);
  let csvFile = await retrieveIpfsFile(cid);
  const content = await csvFile.text();
  const parsedData = Papa.parse(content, {
    header: true,
    dynamicTyping: true,
  }).data;
  return parsedData;
}

export async function getSetPaper(examID) {
  let setId = Math.floor(Math.random() * 2) + 1;
  let data = await getCidByExamAndSet(examID);
  let setPaperFromIpfs = await getQb(data.cid);
  return { setpaper: setPaperFromIpfs, setId: setId };
}
export async function setSetPaper(examId) {
  let csvPaperArr = await getQb(examId);
  const shuffledArray = csvPaperArr.sort(() => Math.random() - 0.5);
  const midIndex = Math.floor(shuffledArray.length / 2);
  const set1 = shuffledArray.slice(0, midIndex);
  const set2 = shuffledArray.slice(midIndex);
  try {
    const crypto = require('crypto');
    function generateHash(jsonString) {
      return crypto.createHash('sha256').update(jsonString).digest('hex');
    }

    let set1cid = await addStringToIpfs(JSON.stringify(set1));
    let set2cid = await addStringToIpfs(JSON.stringify(set2));

    let set1Hash = generateHash(JSON.stringify(set1));
    let set2Hash = generateHash(JSON.stringify(set2));

    await insertIntoExamset({
      exam_id: examId,
      set_id: 1,
      cid: set1cid,
    });
    await insertIntoExamset({
      examid: examId,
      setid: 2,
      cid: set2cid,
    });
  } catch (error) {
    return response.status(200).json({
      result: API_RESPONSE.FAILURE,
      data: {
        message: "Unable to upload set to IPFS",
      },
    });
  }
}
export async function setStudentResponse(studentResponse) {
  // examId, studentId, setid, studentanswer;
  let data = await getCidByExamAndSet(
    studentResponse.examId,
    studentResponse.setid
  );
  let correctOptions = await getQb(data.cid);
  let score = calculateScore(studentResponses.studentanswer, correctOptions);
  let mergedResults = mergeDataForAttendedQuestions(
    studentResponses,
    correctOptions
  );
  await insertIntoExamresult({
    exam_id: studentResponse.examId,
    student_id: studentResponse.studentId,
    setid: studentResponse.setid,
    answers: [
      {
        question: "what is what?",
        option_selected: "optionA",
        correct_option: "optionB",
      },
    ],
  });
}
function calculateScore(studentResponses, correctOptions) {
  let score = 0;

  const correctMap = new Map();
  correctOptions.forEach((item) => {
    correctMap.set(item.question, item.correct_option);
  });
  studentResponses.forEach((response) => {
    const correctOption = correctMap.get(response.question);
    if (
      correctOption &&
      response.option_selected_by_student === correctOption
    ) {
      score += 1;
    }
  });

  return score;
}
// Sample data
const studentResponses = [
  { question: "Q1", option_selected_by_student: "A" },
  { question: "Q2", option_selected_by_student: "B" },
  { question: "Q10", option_selected_by_student: "C" },
];

const correctOptions = [
  { question: "Q1", correct_option: "A" },
  { question: "Q2", correct_option: "C" },
  { question: "Q10", correct_option: "C" },
  { question: "Q5", correct_option: "D" },
];

// Function to merge data for attended questions only
function mergeDataForAttendedQuestions(studentResponses, correctOptions) {
  // Create a map for quick lookup of correct options
  const correctMap = new Map();
  correctOptions.forEach((item) => {
    correctMap.set(item.question, item.correct_option);
  });

  // Merge data into a new array for attended questions only
  const mergedData = studentResponses.map((response) => {
    return {
      question: response.question,
      option_selected: response.option_selected_by_student,
      correct_option: correctMap.get(response.question) || null, // Use null if no correct option found
    };
  });

  return mergedData;
}

// Merging the data and logging it

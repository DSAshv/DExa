import {
  getQBStoreId,
  insertIntoExamset,
  getCidByExamAndSet,
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
  return setPaperFromIpfs;
}
export async function setSetPaper(examId) {
  let csvPaperArr = await getQb(examId);
  const shuffledArray = csvPaperArr.sort(() => Math.random() - 0.5);
  const midIndex = Math.floor(shuffledArray.length / 2);
  const set1 = shuffledArray.slice(0, midIndex);
  const set2 = shuffledArray.slice(midIndex);
  try {
    let set1cid = await addStringToIpfs(JSON.stringify(set1));
    let set2cid = await addStringToIpfs(JSON.stringify(set2));
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
export async function setStudentResponse(examId) {}

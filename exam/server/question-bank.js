import { retrieveIpfsFile } from "../../common/server/ipfs.js";
import { getQBStoreId } from "../../database/database-crud-utils.js";
import Papa from "papaparse";
import { Readable } from "stream";

export async function getQb(examId, res) {
  const cid = await getQBStoreId(examId);
  //   examId = "676f63894315a43b3a335337";
  // let cid = "QmT774pWA82TPG2bfs2EttYJdTCtApgQgwhccdftC3DX8a";
  let csvFile = await retrieveIpfsFile(cid);
  const content = await csvFile.text();
  const parsedData = Papa.parse(content, {
    header: true, // Set to true if your CSV has headers
    dynamicTyping: true, // Automatically convert types
  }).data;
  return parsedData;
}

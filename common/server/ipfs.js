import { Readable } from "stream";
import { create } from "kubo-rpc-client";

const ipfs = create({ url: "http://127.0.0.1:5001" }); // Use 127.0.0.1

export async function addQbToIpfs(questionBank) {
  try {
    const result = await ipfs.add(questionBank.buffer);
    return result.cid.toString();
  } catch (error) {
    throw error;
  }
}
export async function addStringToIpfs(string) {
  try {
    const result = await ipfs.add(string);
    return result.cid.toString();
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function retrieveQb(cid, res) {
  const externalApiUrl = `https://ipfs.io/ipfs/${cid}`;
  try {
    const response = await retrieveIpfsFile(externalApiUrl);
    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";
    const filename = cid.split("/").pop() || "downloaded_file";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    const stream = Readable.fromWeb(response.body);
    stream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching file");
  }
}
export async function retrieveIpfsFile(cid) {
  const externalApiUrl = `http://127.0.0.1:8080/ipfs/${cid}`;
  try {
    const response = await fetch(externalApiUrl);

    if (!response.ok) {
      throw new Error(`Error fetching file: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    console.log("Error fetching file from ipfs");
  }
}

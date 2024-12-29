async function getTransactionDetails(txHash) {
  try {
    const { AptosClient } = require("aptos");
    const DEVNET_URL = "https://fullnode.devnet.aptoslabs.com";
    const client = new AptosClient(DEVNET_URL);
    const txnDetails = await client.getTransactionByHash(txHash);
    console.log("Transaction Details:", txnDetails);
    return txnDetails;
  } catch (error) {
    console.error("Error fetching transaction details:", error);
  }
}
import { AptosClient, AptosAccount, TokenClient } from "aptos";

async function deployNFT(
  privateKey,
  collectionName,
  collectionDescription,
  tokenName,
  tokenDescription,
  tokenUri,
  devnetUrl = "https://fullnode.devnet.aptoslabs.com"
) {
  const client = new AptosClient(devnetUrl);
  const tokenClient = new TokenClient(client);

  // Load account from private key
  const account = new AptosAccount(Buffer.from(privateKey.replace("0x", ""), "hex"));

  // Step 1: Create a collection
  try {
    const createCollectionTxn = await tokenClient.createCollection(
      account,
      collectionName,
      collectionDescription,
      "NO URI", // Replace with a valid URI
      1000 // Maximum supply
    );
    await client.waitForTransaction(createCollectionTxn, { checkSuccess: true });
  } catch (error) {
    console.log("Collection creation error (might already exist):", error.message);
  }

  // Step 2: Create a token
  try {
    const createTokenTxn = await tokenClient.createToken(
      account,
      collectionName,
      tokenName,
      tokenDescription,
      1, // Supply
      tokenUri // Metadata URI
    );
    
    await client.waitForTransaction(createTokenTxn, { checkSuccess: true });
    console.log(`Token created: ${createTokenTxn}`);
  } catch (error) {
    console.error("Token creation error:", error.message);
    return;
  }

  try {
    const tokenData = await tokenClient.getTokenData(
      account.address(),
      collectionName,
      tokenName
    );
    console.log("Token data:", tokenData);
  } catch (error) {
    console.error("Failed to fetch token data:", error.message);
  }

  return createTokenTxn;
}

(async () => {
  const PRIVATE_KEY = "0xeb2a8ef9554458f32f2faa9fe377844c0efaa2af7b7616051c8ab247a0655ac3";
  const COLLECTION_NAME = "MyNFTCollection2";
  const COLLECTION_DESCRIPTION = "A collection for my NFTs";
  const TOKEN_NAME = "MyNFT1";
  const TOKEN_DESCRIPTION = "This is a sample NFT created on Aptos!";
  const TOKEN_URI =
    "https://gist.githubusercontent.com/kstirman/4ade073dd76bef171298033cb9c965b5/raw/2a2b5a85b228b8a3ffaf369a28032bf8a899db23/sample-raw.json";

  try {
    let txnHash = await deployNFT(
      PRIVATE_KEY,
      COLLECTION_NAME,
      COLLECTION_DESCRIPTION,
      TOKEN_NAME,
      TOKEN_DESCRIPTION,
      TOKEN_URI
    );
  } catch (error) {
    console.error("Deployment failed:", error.message);
  }
})();

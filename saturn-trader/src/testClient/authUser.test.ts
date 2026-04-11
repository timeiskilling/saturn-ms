import { expect, test } from "vitest";
import { generateKeyPairSigner } from "gill"; // Using Gill SDK
import bs58 from "bs58";

type NonceResponse = {
  nonce: string;
  request_id: string;
  message_template: string;
};

test("Auth service ", async () => {
  // 1. Fetch the nonce
  const nonce = await fetch("http://127.0.0.1:3001/auth/nonce", {
    method: "GET",
  });

  const nonceData: NonceResponse = await nonce.json();
  expect(nonceData).toBeDefined();

  // 2. Generate a random mock test wallet signer using Gill
  const signer = await generateKeyPairSigner();

  // Gill signers have the public key easily accessible via `.address` (it's already a base58)
  const publicKeyStr = signer.address;
  console.log("Testing with PubKey:", publicKeyStr);

  // 3. Convert the exact message template from the server into bytes
  const messageBytes = new TextEncoder().encode(nonceData.message_template);

  // 4. Sign the message. `signMessages` expects an array of messages
  const signedMessages = await signer.signMessages([
    { content: messageBytes, signatures: {} },
  ]);

  // Gill returns a dictionary where the key is the address and the value is the signature bytes
  const signatureBytes = (signedMessages[0] as any).signatures
    ? (signedMessages[0] as any).signatures[publicKeyStr]
    : (signedMessages[0] as any)[publicKeyStr];

  // 5. Encode the signature in Base58 (which Rust backend expects)
  const signatureBase58 = bs58.encode(signatureBytes as Uint8Array);

  // 6. Send the payload to the verify endpoint
  const verifyReq = await fetch("http://127.0.0.1:3001/auth/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Vitest-Test-Agent", // Required since backend checks TypedHeader<UserAgent>
    },
    body: JSON.stringify({
      request_id: nonceData.request_id,
      public_key: publicKeyStr,
      signature: signatureBase58,
    }),
  });

  // 7. Extract the session cookie & validate
  const setCookieHeader = verifyReq.headers.get("set-cookie");
  console.log("Status:", verifyReq.status);
  console.log("Set-Cookie Header:", setCookieHeader);

  expect(verifyReq.status).toBe(200);
});

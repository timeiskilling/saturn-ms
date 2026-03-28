import { expect, test } from "vitest";

test("connection to price service REST API", async () => {
  const response = await fetch("http://127.0.0.1:8080/get/list_of_tokens", {
    headers: {
      "X-Auth-Token": "test-token", // Required by the API extractor (api_extracter.rs)
    },
  });

  // Verify successful connection and authorization
  expect(response.status).toBe(200);

  const data = await response.json();

  // Verify that the response is an array of TokenInfo objects
  expect(Array.isArray(data)).toBe(true);

  // If there are tokens returned, verify the structure matches the Rust TokenInfo struct
  if (data.length > 0) {
    const firstToken = data[0];

    expect(firstToken).toHaveProperty("symbol");
    expect(typeof firstToken.symbol).toBe("string");

    expect(firstToken).toHaveProperty("mint");
    expect(typeof firstToken.mint).toBe("string");

    expect(firstToken).toHaveProperty("decimals");
    expect(typeof firstToken.decimals).toBe("number");

    expect(firstToken).toHaveProperty("icon");
    expect(typeof firstToken.icon).toBe("string");
  }
});

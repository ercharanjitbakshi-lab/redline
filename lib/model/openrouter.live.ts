// A real call to OpenRouter with the pinned config, to confirm auth, the
// request shape and response parsing end to end. Costs a fraction of a cent.
// Run with: npm run test:live (reads OPENROUTER_API_KEY from .env.local).

import { test } from "node:test";
import assert from "node:assert/strict";
import { modelConfig } from "./config.ts";
import { createOpenRouterClient } from "./openrouter.ts";

test("live: the pinned model answers through OpenRouter with zero retention", async () => {
  // Wrap fetch to see which model and provider actually served the request.
  let served: { model?: string; provider?: string } = {};
  const recordingFetch: typeof fetch = async (input, init) => {
    const response = await fetch(input, init);
    if (String(input).endsWith("/chat/completions")) served = await response.clone().json();
    return response;
  };

  const model = await createOpenRouterClient({
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
    config: modelConfig,
    fetch: recordingFetch,
  });
  const text = await model.complete({
    system: "Reply with the exact text you are asked for and nothing else.",
    user: "Reply with: redline ok",
  });

  console.log(`served by ${served.provider} as ${served.model}: ${JSON.stringify(text)}`);
  assert.match(text.toLowerCase(), /redline ok/);
});

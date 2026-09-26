import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakeModelClient } from "./fake.ts";
import { createOpenRouterClient } from "./openrouter.ts";
import type { ModelConfig } from "./config.ts";

const config: ModelConfig = {
  model: "vendor/model-x",
  version: "20260101",
  provider: "some-cloud/eu",
  temperature: null,
  maxOutputTokens: 1000,
  timeoutMs: 5000,
};

const zdrListing = {
  data: [{ name: "Some Cloud | vendor/model-x-20260101", model_id: "vendor/model-x", tag: "some-cloud/eu" }],
};

// A stand-in for fetch that serves the ZDR list and a canned completion,
// and records every request body sent to the completions endpoint.
function fakeFetch(completion: unknown, { zdr = zdrListing, status = 200 } = {}) {
  const sent: Record<string, unknown>[] = [];
  const fn = (async (url: string, init?: RequestInit) => {
    if (url.endsWith("/endpoints/zdr")) return Response.json(zdr);
    sent.push(JSON.parse(String(init?.body)));
    return Response.json(completion, { status });
  }) as typeof fetch;
  return { fn, sent };
}

const reply = (content: string, finish_reason = "stop") => ({
  choices: [{ message: { content }, finish_reason }],
});

test("the fake returns its programmed reply and needs no other setup", async () => {
  const model = createFakeModelClient("recorded output");
  assert.equal(await model.complete({ user: "anything" }), "recorded output");
  assert.equal(await model.complete({ user: "again" }), "recorded output");
});

test("the fake returns several replies in order, then fails loudly", async () => {
  const model = createFakeModelClient("first", "second");
  assert.equal(await model.complete({ user: "a" }), "first");
  assert.equal(await model.complete({ user: "b" }), "second");
  await assert.rejects(model.complete({ user: "c" }), /ran out of replies/);
});

test("the real client refuses to start when the model is not on the zero-retention list", async () => {
  const { fn } = fakeFetch(reply("x"), { zdr: { data: [] } });
  await assert.rejects(
    createOpenRouterClient({ apiKey: "k", config, fetch: fn }),
    /not on OpenRouter's zero-retention list/,
  );
});

test("the real client refuses to start when a different version is zero-retention", async () => {
  const { fn } = fakeFetch(reply("x"));
  await assert.rejects(
    createOpenRouterClient({ apiKey: "k", config: { ...config, version: "20250101" }, fetch: fn }),
    /zero-retention list/,
  );
});

test("the real client refuses to start when the zero-retention list cannot be loaded", async () => {
  const fn = (async () => {
    throw new Error("offline");
  }) as typeof fetch;
  await assert.rejects(createOpenRouterClient({ apiKey: "k", config, fetch: fn }), /unconfirmed/);
});

test("the real client refuses to start without an API key", async () => {
  const { fn } = fakeFetch(reply("x"));
  await assert.rejects(createOpenRouterClient({ apiKey: "", config, fetch: fn }), /OPENROUTER_API_KEY/);
});

test("requests pin the model and provider, forbid fallbacks, and require zero retention", async () => {
  const { fn, sent } = fakeFetch(reply("the answer"));
  const model = await createOpenRouterClient({ apiKey: "k", config, fetch: fn });

  assert.equal(await model.complete({ system: "rules", user: "question" }), "the answer");
  const body = sent[0];
  assert.equal(body.model, "vendor/model-x");
  assert.deepEqual(body.provider, {
    only: ["some-cloud/eu"],
    allow_fallbacks: false,
    require_parameters: true,
    zdr: true,
    data_collection: "deny",
  });
  assert.equal("temperature" in body, false);
});

test("temperature comes from config when the model accepts one", async () => {
  const { fn, sent } = fakeFetch(reply("ok"));
  const model = await createOpenRouterClient({ apiKey: "k", config: { ...config, temperature: 0 }, fetch: fn });
  await model.complete({ user: "q" });
  assert.equal(sent[0].temperature, 0);
});

test("a completion cut off at the output limit is an error, not a result", async () => {
  const { fn } = fakeFetch(reply("All work product shall", "length"));
  const model = await createOpenRouterClient({ apiKey: "k", config, fetch: fn });
  await assert.rejects(model.complete({ user: "q" }), /output limit/);
});

test("an OpenRouter error is surfaced with its status", async () => {
  const { fn } = fakeFetch({ error: { message: "No endpoints found" } }, { status: 404 });
  const model = await createOpenRouterClient({ apiKey: "k", config, fetch: fn });
  await assert.rejects(model.complete({ user: "q" }), /\(404\): No endpoints found/);
});

import type { ModelClient } from "./client.ts";
import type { ModelConfig } from "./config.ts";

const API = "https://openrouter.ai/api/v1";

type Options = {
  apiKey: string;
  config: ModelConfig;
  // Injectable for tests; defaults to the global fetch.
  fetch?: typeof fetch;
};

type ZdrEndpoint = { name: string; model_id: string; tag: string };

type Completion = {
  model?: string;
  choices?: { message?: { content?: string | null }; finish_reason?: string | null }[];
  error?: { message?: string };
};

// Builds the real model client. Before returning, it confirms that the pinned
// model version is served with zero data retention by the pinned provider
// (docs/adr/0002). If that cannot be confirmed, it throws: document text
// never goes to an endpoint that might keep it.
export async function createOpenRouterClient({
  apiKey,
  config,
  fetch: fetchFn = fetch,
}: Options): Promise<ModelClient> {
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set. Add it to .env.local.");
  await assertZeroRetention(config, fetchFn);

  return {
    async complete(prompt) {
      const messages = [
        ...(prompt.system ? [{ role: "system", content: prompt.system }] : []),
        { role: "user", content: prompt.user },
      ];

      const response = await fetchFn(`${API}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(config.timeoutMs),
        body: JSON.stringify({
          model: config.model,
          messages,
          max_tokens: config.maxOutputTokens,
          ...(config.temperature === null ? {} : { temperature: config.temperature }),
          provider: {
            // Only the pinned endpoint, never a fallback.
            only: [config.provider],
            allow_fallbacks: false,
            // Fail rather than drop a setting the endpoint does not support.
            require_parameters: true,
            // Enforced per request as well as checked at startup.
            zdr: true,
            data_collection: "deny",
          },
        }),
      });

      const body = (await response.json().catch(() => ({}))) as Completion;
      if (!response.ok) {
        throw new Error(
          `OpenRouter request failed (${response.status}): ${body.error?.message ?? "no details"}`,
        );
      }

      const choice = body.choices?.[0];
      // A cut-off answer can end mid-quote; a half sentence must never reach
      // the citation check looking like a whole one.
      if (choice?.finish_reason === "length") {
        throw new Error(
          `The model hit the output limit (${config.maxOutputTokens} tokens) before finishing.`,
        );
      }
      const text = choice?.message?.content;
      if (!text) throw new Error("OpenRouter returned no completion text.");
      return text;
    },
  };
}

async function assertZeroRetention(config: ModelConfig, fetchFn: typeof fetch) {
  let endpoints: ZdrEndpoint[];
  try {
    const response = await fetchFn(`${API}/endpoints/zdr`);
    if (!response.ok) throw new Error(`status ${response.status}`);
    endpoints = ((await response.json()) as { data: ZdrEndpoint[] }).data;
  } catch (error) {
    throw new Error(
      `Could not load OpenRouter's zero-retention list, so zero retention for ${config.model} is unconfirmed. Refusing to start. (${String(error)})`,
    );
  }

  const confirmed = endpoints.some(
    (e) =>
      e.model_id === config.model &&
      e.tag === config.provider &&
      e.name.endsWith(`-${config.version}`),
  );
  if (!confirmed) {
    throw new Error(
      `${config.model} version ${config.version} on ${config.provider} is not on OpenRouter's zero-retention list. Refusing to start. Pick an endpoint from ${API}/endpoints/zdr and update lib/model/config.ts.`,
    );
  }
}

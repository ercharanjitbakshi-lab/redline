// The pinned model (docs/adr/0002). Changing model is an edit to this file,
// reviewed like any other change. No "auto" routing: the citation guarantee
// (docs/adr/0001) needs output from one known model.
//
// Each value must match an entry on OpenRouter's zero-retention list,
// https://openrouter.ai/api/v1/endpoints/zdr, or the client refuses to start.

export type ModelConfig = {
  // OpenRouter model id.
  model: string;
  // The dated model version. The client checks that this exact version is
  // served with zero retention and that responses come from it.
  version: string;
  // The one endpoint allowed to serve requests: provider plus region.
  provider: string;
  // null when the model does not accept a temperature. Otherwise the lowest
  // value that still gives usable output.
  temperature: number | null;
  maxOutputTokens: number;
  timeoutMs: number;
};

export const modelConfig: ModelConfig = {
  model: "anthropic/claude-sonnet-5",
  version: "20260630",
  provider: "amazon-bedrock/eu-west-1",
  // Claude Sonnet 5 does not accept a temperature setting on any provider, so
  // there is nothing to lower. The pinned model and version are what keep
  // runs consistent.
  temperature: null,
  maxOutputTokens: 16000,
  timeoutMs: 180_000,
};

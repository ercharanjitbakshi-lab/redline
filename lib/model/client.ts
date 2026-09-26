// The seam between the analyzer and the language model (docs/adr/0002).
// One operation: send a prompt, get the completion text back. Nothing
// provider-specific crosses this boundary, so the analyzer and its tests
// never know which model or vendor is behind it.

export type Prompt = {
  // Standing instructions for the model.
  system?: string;
  // The request itself, including the document text.
  user: string;
};

export interface ModelClient {
  complete(prompt: Prompt): Promise<string>;
}

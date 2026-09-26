import type { ModelClient, Prompt } from "./client.ts";

type Reply = string | ((prompt: Prompt) => string);

// A model client for tests. It returns the programmed replies in order and
// never touches the network. Pass one reply to answer every call the same
// way, or several to answer successive calls in turn.
export function createFakeModelClient(...replies: Reply[]): ModelClient {
  if (replies.length === 0) throw new Error("Give the fake model client at least one reply.");
  let next = 0;

  return {
    async complete(prompt) {
      const reply = replies.length === 1 ? replies[0] : replies[next++];
      if (reply === undefined) {
        throw new Error(`The fake model client ran out of replies after ${replies.length} calls.`);
      }
      return typeof reply === "function" ? reply(prompt) : reply;
    },
  };
}

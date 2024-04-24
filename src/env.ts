const OPENAI_API_KEY_VAR = "OPENAI_API_KEY";

export async function setOpenAIAPIKey(key: string) {
  await chrome.storage.sync.set({ [OPENAI_API_KEY_VAR]: key });
}

export async function getOpenAIAPIKey(): Promise<string> {
  const result = await chrome.storage.sync.get([OPENAI_API_KEY_VAR]);
  console.log("getting key", result);
  return result[OPENAI_API_KEY_VAR];
}

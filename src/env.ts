const OPENAI_API_KEY_VAR = "OPENAI_API_KEY";

export async function setOpenAIAPIKey(key: string) {
  await chrome.storage.sync.set({ [OPENAI_API_KEY_VAR]: key });
}

let OPENAI_API_KEY: string;
export async function getOpenAIAPIKey(): Promise<string> {
  if (!OPENAI_API_KEY) {
    const result = await chrome.storage.sync.get([OPENAI_API_KEY_VAR]);
    OPENAI_API_KEY = result[OPENAI_API_KEY_VAR];
  }
  return OPENAI_API_KEY;
}

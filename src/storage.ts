const OPENAI_API_KEY_STORAGE_KEY = "OPENAI_API_KEY";
const USER_EDITS_STORAGE_KEY = "USER_EDITS";

export async function setOpenAIAPIKey(key: string) {
  await chrome.storage.sync.set({ [OPENAI_API_KEY_STORAGE_KEY]: key });
}

let OPENAI_API_KEY: string;
export async function getOpenAIAPIKey(): Promise<string> {
  if (!OPENAI_API_KEY) {
    const result = await chrome.storage.sync.get([OPENAI_API_KEY_STORAGE_KEY]);
    OPENAI_API_KEY = result[OPENAI_API_KEY_STORAGE_KEY];
  }
  return OPENAI_API_KEY;
}

export interface UserEdit {
  beforeEdit: string;
  afterEdit: string;
}

export async function addUserEdit(edit: UserEdit) {
  const edits = await getAllUserEdits();
  edits.push(edit);
  await chrome.storage.local.set({ [USER_EDITS_STORAGE_KEY]: edits });
}

export async function getAllUserEdits() {
  const result = await chrome.storage.local.get([USER_EDITS_STORAGE_KEY]);
  return result[USER_EDITS_STORAGE_KEY] || [];
}

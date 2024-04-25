import { getOpenAIAPIKey, setOpenAIAPIKey } from "../storage";

const openAPIKeyInputEl = document.getElementById(
  "openai-api-key"
) as HTMLInputElement | null;

const openAPIKeyInputItemEl = document.getElementById(
  "openai-api-key-item"
) as HTMLDivElement | null;

const OPENAI_API_CHECK_URL = "https://api.openai.com/v1/chat/completions";

async function validateOpenAIAPIKey(key: string) {
  if (!key) {
    return false;
  }

  const response = await fetch(OPENAI_API_CHECK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Context-Type": "application/json",
    },
  });
  const { error } = await response.json();
  if (!error || error.code !== "invalid_api_key") {
    return true;
  }
  return false;
}

async function handleOpenAPIKeyInputValue() {
  if (!openAPIKeyInputEl || !openAPIKeyInputItemEl) {
    console.error("Open API Key input not found");
    return;
  }

  const key = openAPIKeyInputEl.value;
  const isValid = await validateOpenAIAPIKey(key);
  if (isValid) {
    await setOpenAIAPIKey(key);
    openAPIKeyInputItemEl.classList.remove("invalid");
    openAPIKeyInputItemEl.classList.add("valid");
  } else {
    openAPIKeyInputItemEl.classList.remove("valid");
    openAPIKeyInputItemEl.classList.add("invalid");
  }
}

async function init() {
  if (!openAPIKeyInputEl || !openAPIKeyInputItemEl) {
    console.error("Open API Key input not found");
    return;
  }

  const key = await getOpenAIAPIKey();
  openAPIKeyInputEl.value = key;
  handleOpenAPIKeyInputValue();

  openAPIKeyInputEl.addEventListener("change", handleOpenAPIKeyInputValue);
}

init();

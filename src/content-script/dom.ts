import { SpeechRecognizer } from "./speechRecognition";

function insertTextAtCursor(textAreaEl: HTMLTextAreaElement, newText: string) {
  const currentValue = textAreaEl.value;
  const currentCursorIdx = textAreaEl.selectionEnd || currentValue.length;

  const prefix = currentValue.slice(0, currentCursorIdx);
  const suffix = currentValue.slice(currentCursorIdx);
  let newValue = prefix;
  if (prefix.length > 0 && !/\s$/.test(prefix)) {
    // `prefix` doesn't end with a space character
    newValue += " ";
  }
  newValue += newText;
  const newCursorIdx = newValue.length;
  if (suffix.length > 0 && !/^\s/.test(suffix)) {
    // `suffix` doesn't start with a space character
    newValue += " ";
  }
  newValue += suffix;

  textAreaEl.value = newValue;
  textAreaEl.selectionStart = textAreaEl.selectionEnd = newCursorIdx;
}

class SpkButton {
  static createButtonEl() {
    const spkButton = document.createElement("button");
    spkButton.textContent = "spk";
    return spkButton;
  }

  private buttonEl: HTMLButtonElement = SpkButton.createButtonEl();
  private listening: boolean = false;
  constructor(private targetEl: HTMLTextAreaElement) {}

  addtoDOM() {
    this.buttonEl.style.position = "absolute";
    this.targetEl.insertAdjacentElement("afterend", this.buttonEl);

    // Position in bottom-right corner.
    this.buttonEl.style.top = `${
      this.targetEl.offsetTop +
      this.targetEl.offsetHeight -
      this.buttonEl.offsetHeight
    }px`;
    this.buttonEl.style.left = `${
      this.targetEl.offsetLeft +
      this.targetEl.offsetWidth -
      this.buttonEl.offsetWidth
    }px`;
  }

  addInteractions(recognizer: SpeechRecognizer) {
    this.buttonEl.addEventListener("mousedown", (event) => {
      // prevent textarea from being unfocused when the spk button is clicked.
      event.preventDefault();
    });

    // TODO: Add mode to auto-start speech recognition when focusing into textarea.
    this.buttonEl.addEventListener("click", async () => {
      this.listening = true;
      this.buttonEl.disabled = true; // TODO: Add further indication that speech recognition is happening
      this.targetEl.disabled = true;

      const speech = await recognizer.recognize();

      if (speech != null) {
        // TODO: Explore streaming with the LLM.
        insertTextAtCursor(this.targetEl, speech);
      }

      this.targetEl.disabled = false;
      this.buttonEl.disabled = false;
      this.listening = false;

      this.targetEl.focus();
    });

    this.targetEl.addEventListener("focusout", () => {
      if (!this.listening) {
        this.buttonEl.remove();
      }
    });
  }
}

export function modifyTextarea(
  recognizer: SpeechRecognizer,
  textArea: HTMLTextAreaElement
) {
  const spkButton = new SpkButton(textArea);
  spkButton.addtoDOM();
  spkButton.addInteractions(recognizer);
}

import * as transform from "./textTransform";

function polyfillSpeechAPIs() {
  window.SpeechRecognition =
    window.SpeechRecognition || webkitSpeechRecognition;
  window.SpeechGrammarList =
    window.SpeechGrammarList || window.webkitSpeechGrammarList;
  window.SpeechRecognitionEvent =
    window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
}

class SpeechRecognizer {
  private recognition: SpeechRecognition;
  private properNouns: string[] = [];

  constructor(language: string = "en-US") {
    this.recognition = new SpeechRecognition();
    this.recognition.lang = language;
    this.recognition.maxAlternatives = 5;

    transform
      .listProperNouns(document.body.innerText)
      .then((properNouns) => (this.properNouns = properNouns));
  }

  async recognize(): Promise<string | null> {
    return new Promise((resolve) => {
      let receivedResults = false;
      this.recognition.addEventListener(
        "result",
        async (event) => {
          receivedResults = true;
          console.log("speech recognition results", event.results);
          const rawSpeech = event.results[0][0].transcript;
          const correctedSpeech = await transform.transform(
            rawSpeech,
            this.properNouns
          );
          resolve(correctedSpeech);
        },
        { once: true }
      );
      // TODO: Retry speech recognizer one time, in case user had a big pause.
      // TODO: Add the ability to abort speech recognition
      this.recognition.addEventListener(
        "end",
        (event) => {
          console.log("speech recognition ended", event);
          if (!receivedResults) {
            resolve(null);
          }
        },
        { once: true }
      );

      this.recognition.start();
    });
  }
}

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

function modifyTextarea(
  recognizer: SpeechRecognizer,
  textArea: HTMLTextAreaElement
) {
  const spkButton = new SpkButton(textArea);
  spkButton.addtoDOM();
  spkButton.addInteractions(recognizer);
}

function elementIsTextArea(el: HTMLElement): el is HTMLTextAreaElement {
  const tagName = el.tagName?.toLowerCase();
  return tagName === "textarea";
}

function main() {
  const recognizer = new SpeechRecognizer();

  window.addEventListener("focusin", (event) => {
    console.log(event.target);
    if (event.target == null) {
      return;
    }

    const target = event.target as HTMLElement;
    if (elementIsTextArea(target)) {
      modifyTextarea(recognizer, target);
    }
    // TODO: Add support for contenteditable div's like Gmail's message box
  });
}

function init() {
  polyfillSpeechAPIs();
  main();
}

init();

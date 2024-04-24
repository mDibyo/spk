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

  constructor(language: string = "en-US") {
    this.recognition = new SpeechRecognition();
    this.recognition.lang = language;
    this.recognition;
  }

  async recognize(): Promise<string | null> {
    return new Promise((resolve) => {
      this.recognition.addEventListener(
        "result",
        (event) => {
          console.log(event);
          const result = event.results[0][0].transcript;
          resolve(result);
        },
        { once: true }
      );
      // TODO: Restart speech recognizer once more, in case user had a big pause.
      // TODO: Add the ability to abort speech recognition
      this.recognition.addEventListener(
        "end",
        (event) => {
          console.log("ended", event);
          resolve(null);
        },
        { once: true }
      );

      this.recognition.start();
    });
  }
}

class SpkButton {
  static createButtonEl() {
    const spkButton = document.createElement("button");
    spkButton.textContent = "spk";
    return spkButton;
  }

  constructor(private targetEl: HTMLTextAreaElement) {}
  private buttonEl: HTMLButtonElement = SpkButton.createButtonEl();
  private listening: boolean = false;

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

    this.buttonEl.addEventListener("click", async () => {
      this.listening = true;
      this.buttonEl.disabled = true; // TODO: Add further indication that speech recognition is happening
      this.targetEl.disabled = true;

      const speech = await recognizer.recognize();

      if (speech != null) {
        this.targetEl.textContent += " " + speech;
      }

      this.targetEl.disabled = false;
      this.buttonEl.disabled = false;
      this.listening = false;

      this.targetEl.focus();
      this.targetEl.selectionStart = this.targetEl.selectionEnd =
        this.targetEl.value.length;
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

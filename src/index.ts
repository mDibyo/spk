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

function modifyTextarea(
  recognizer: SpeechRecognizer,
  textArea: HTMLTextAreaElement
) {
  const spkButton = document.createElement("button");
  spkButton.textContent = "spk";
  spkButton.addEventListener("mousedown", (event) => {
    // prevent textarea from being unfocused when the spk button is clicked.
    event.preventDefault();
  });
  spkButton.addEventListener("click", async () => {
    spkButton.disabled = true;
    textArea.disabled = true;
    spkButton.textContent = "listening...";

    const speech = await recognizer.recognize();

    spkButton.textContent = "spk";
    spkButton.disabled = false;

    if (speech != null) {
      textArea.textContent += " " + speech;
    }
    textArea.disabled = false;
    textArea.focus();
    textArea.selectionStart = textArea.selectionEnd = textArea.value.length;
  });

  spkButton.style.position = "absolute";
  textArea.insertAdjacentElement("afterend", spkButton);

  spkButton.style.top = `${
    textArea.offsetTop + textArea.offsetHeight - spkButton.offsetHeight
  }px`;
  spkButton.style.left = `${
    textArea.offsetLeft + textArea.offsetWidth - spkButton.offsetWidth
  }px`;

  textArea.addEventListener("focusout", () => {
    spkButton.remove();
  });
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

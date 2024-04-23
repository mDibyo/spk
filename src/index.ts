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

function main() {
  console.log("Hello again, Console World");

  const recognizer = new SpeechRecognizer();
  const recordBtn = document.getElementById(
    "record"
  ) as HTMLButtonElement | null;
  const resultDiv = document.getElementById("result") as HTMLDivElement | null;

  if (!recordBtn || !resultDiv) {
    console.error("Recording interface not available");
    return;
  }

  recordBtn.addEventListener("click", async () => {
    recordBtn.disabled = true;
    recordBtn.textContent = "Recording...";

    const speech = await recognizer.recognize();

    recordBtn.textContent = "Record";
    recordBtn.disabled = false;

    if (speech != null) {
      resultDiv.classList.remove("failed");
      resultDiv.textContent = speech;
    } else {
      resultDiv.classList.add("failed");
      resultDiv.textContent = null;
    }
  });
}

function init() {
  polyfillSpeechAPIs();
  main();
}

init();

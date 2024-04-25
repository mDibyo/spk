import * as transform from "./textTransform";

export class SpeechRecognizer {
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

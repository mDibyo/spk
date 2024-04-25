import { addUserEdit, getAllUserEdits } from "../storage";
import {
  improveTextTranscription,
  listProperNouns,
} from "./textTransformation";

export class SpeechRecognizer {
  private recognition: SpeechRecognition;
  private properNouns: string[] = [];

  constructor(language: string = "en-US") {
    this.recognition = new SpeechRecognition();
    this.recognition.lang = language;
    this.recognition.maxAlternatives = 5;

    listProperNouns(document.body.innerText).then(
      (properNouns) => (this.properNouns = properNouns)
    );
  }

  async recognize(): Promise<string | null> {
    return new Promise((resolve) => {
      let receivedResults = false;
      this.recognition.addEventListener(
        "result",
        async (event) => {
          receivedResults = true;
          console.log("speech recognition results", event.results);
          const rawText = event.results[0][0].transcript;
          const correctedText = await improveTextTranscription(
            rawText,
            this.properNouns,
            await getAllUserEdits()
          );
          resolve(correctedText);
        },
        { once: true }
      );
      // TODO: Retry speech recognizer in a loop in case the user wants to keep dictating. Speech
      // recognition should only be stopped if there is a long pause, or if the user explicitly
      // aborts recognition.
      // TODO: Add the ability for the user to abort speech recognition.
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

  async recordUserEdit(beforeEdit: string, afterEdit: string) {
    // TODO: Store edits at sentence-level rather than storing a single big edit.
    // TODO: Decide which edits are useful examples and store only those.
    await addUserEdit({ beforeEdit, afterEdit });
  }
}

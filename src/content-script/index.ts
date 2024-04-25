import { modifyTextarea } from "./dom";
import { SpeechRecognizer } from "./speechRecognition";

function polyfillSpeechAPIs() {
  window.SpeechRecognition =
    window.SpeechRecognition || webkitSpeechRecognition;
  window.SpeechGrammarList =
    window.SpeechGrammarList || window.webkitSpeechGrammarList;
  window.SpeechRecognitionEvent =
    window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
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
    // TODO: Add support for contenteditable div's like Gmail's message box, and for "text" input boxes
  });
}

function init() {
  polyfillSpeechAPIs();
  main();
}

init();

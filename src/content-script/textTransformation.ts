import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  CommaSeparatedListOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";

import { getOpenAIAPIKey } from "../env";

async function getGPT3_5Model() {
  return new OpenAI({
    apiKey: await getOpenAIAPIKey(),
    openAIApiKey: await getOpenAIAPIKey(),
    model: "gpt-3.5-turbo-instruct",
    modelName: "gpt-3.5-turbo-instruct",
  });
}

async function getGPT4Model() {
  return new OpenAI({
    apiKey: await getOpenAIAPIKey(),
    openAIApiKey: await getOpenAIAPIKey(),
    model: "gpt-4-turbo",
    modelName: "gpt-4-turbo",
  });
}

export async function listProperNouns(text: string): Promise<string[]> {
  const outputParser = new CommaSeparatedListOutputParser();
  const prompt = PromptTemplate.fromTemplate(`
    List out the proper nouns in the following text. {formatInstructions}

    {text}
  `);
  const model = await getGPT4Model();
  const chain = prompt.pipe(model).pipe(outputParser);
  console.log(chain);
  const result = await chain.invoke({
    text,
    formatInstructions: outputParser.getFormatInstructions(),
  });
  return result;
}

async function punctuateText(text: string): Promise<string> {
  const prompt = new PromptTemplate({
    inputVariables: ["text"],
    template: `
      You are an excellent English speaker and writer. Rewrite the following
      text with proper punctuation and capitalization. Don't make any other
      modifications to the text.
      {text}
    `,
  });
  const model = await getGPT3_5Model();
  const outputParser = new StringOutputParser();
  const chain = prompt.pipe(model).pipe(outputParser);
  const result = await chain.invoke({ text });
  return result.trim();
}

async function correctErrors(
  text: string,
  properNouns: string[]
): Promise<string> {
  const prompt = PromptTemplate.fromTemplate(`
      You are an excellent English transcriber. The following text was transcribed badly, and
      certain proper nouns were replaced with other words that sound similar. Rewrite the text
      to fix those mistakes. Only modify the text if there are mistakes, otherwise return the
      same text.

      Here are some proper nouns that might be present in the text and might have been trascribed
      incorrectly: {properNouns}

      Here is one example:
      Input: I had a great time in Food and Polly, eating pav bhaji for lunch.
      Response: I had a great time in Puranpoli, eating pav bhaji for lunch.

      Now rewrite the following text:
      Input: {text}
      Response:
    `);

  const outputParser = new StringOutputParser();
  const chain = prompt.pipe(await getGPT4Model()).pipe(outputParser);
  let result = await chain.invoke({
    properNouns: properNouns.join(", "),
    text,
  });
  result = result.trim();
  return result.trim();
}

async function validateCorrection(
  originalText: string,
  correctedText: string
): Promise<boolean> {
  if (correctedText === originalText) {
    return true;
  }

  const prompt = new PromptTemplate({
    inputVariables: ["originalText", "correctedText"],
    template: `
      Can the second text snippet be derived from the first text snippet by replacing some of the words with other words that sound phonetically similar? Respond with a "yes" or "no".

      Snippet 1: {originalText}
      Snippet 2: {correctedText}
    `,
  });
  const outputParser = new StringOutputParser();
  const chain = prompt.pipe(await getGPT3_5Model()).pipe(outputParser);

  const result = await chain.invoke({ originalText, correctedText });
  return result.trim().toLowerCase() == "yes";
}

export async function improveTextTranscription(
  text: string,
  properNouns: string[]
): Promise<string> {
  const punctuatedText = await punctuateText(text);
  const correctedText = await correctErrors(punctuatedText, properNouns);
  const correctionIsValid = await validateCorrection(
    punctuatedText,
    correctedText
  );
  if (correctionIsValid) {
    return correctedText;
  } else {
    return punctuatedText;
  }
}

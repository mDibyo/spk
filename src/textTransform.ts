import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { getOpenAIAPIKey } from "./env";

let _model: OpenAI;

async function getModel() {
  if (!_model) {
    _model = new OpenAI({
      apiKey: await getOpenAIAPIKey(),
      model: "gpt-3.5-turbo-instruct",
    });
  }
  return _model;
}

export async function punctuateText(text: string): Promise<string> {
  const prompt = new PromptTemplate({
    inputVariables: ["text"],
    template: `
      You are an excellent English speaker and writer. Rewrite the following
      text with proper punctuation and capitalization. Don't make any other
      modifications to the text.

      {text}
    `,
  });

  const outputParser = new StringOutputParser();
  const chain = prompt.pipe(await getModel()).pipe(outputParser);
  const result = await chain.invoke({ text });
  return result.trim();
}

import { OpenAI } from "openai";
import MistralClient from "@mistralai/mistralai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const mistral = new MistralClient(process.env.MISTRAL_API_KEY);

class Chat {
  constructor(messages) {
    this.messages = messages;
  }

  async generateResponse() {
    throw new Error("generateResponse not implemented");
  }

  async query(prompt) {
    this.messages = [...this.messages, { role: "user", content: prompt }];
    const response = await this.generateResponse();
    this.messages = [
      ...this.messages,
      { role: "assistant", content: response },
    ];
    return [response, this.messages];
  }

  getMessages() {
    return this.messages;
  }
}

class MockChat extends Chat {
  constructor(messages) {
    super(messages);
  }

  async generateResponse() {
    const prompt = this.messages[this.messages.length - 1].content;
    if (prompt.includes("conclusion"))
      return "This is the AI's mock conclusion.";
    else if (prompt.includes("rebuttal"))
      return "This is the AI's mock rebuttal.";
    else if (prompt.includes("argument"))
      return "This is the AI's mock argument.";
    else return "This is a mock response.";
  }
}

class OpenAIChat extends Chat {
  constructor(messages, model) {
    super(messages);
    this.model = model;
  }

  async generateResponse() {
    let retries = 0;
    while (true) {
      try {
        const completion = await openai.chat.completions.create({
          model: this.model,
          messages: this.messages,
        });

        return completion.choices[0].message.content;
      } catch (error) {
        retries++;
        if (retries === 3) {
          throw error;
        }
      }
    }
  }
}

class MistralChat extends Chat {
  constructor(messages, model) {
    super(messages);
    this.model = model;
  }

  async generateResponse() {
    let retries = 0;
    while (true) {
      try {
        const completion = await mistral.chat({
          model: this.model,
          messages: this.messages,
        });

        return completion.choices[0].message.content;
      } catch (error) {
        retries++;
        if (retries === 3) {
          throw error;
        }
      }
    }
  }
}

export function selectChat(llm, messages = []) {
  if (llm === "mock") {
    return new MockChat(messages);
  } else if (llm === "chatgpt") {
    return new OpenAIChat(messages, "gpt-3.5-turbo-1106");
  } else if (llm === "gpt4") {
    return new OpenAIChat(messages, "gpt-4-0613");
  } else if (llm === "mixtral") {
    return new MistralChat(messages, "mistral-small");
  }
  {
    throw new Error("Invalid llm type");
  }
}

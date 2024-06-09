import OpenAI from 'openai';
import { moderator } from './prompts';
import { SpamResponse } from './types';

export class OpenAIClient {
  client: OpenAI;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async checkSpam(message: string): Promise<SpamResponse> {
    const result = await this.client.chat.completions.create({
      messages: [
        { role: 'system', content: moderator },
        { role: 'user', content: message },
      ],
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
    });

    try {
      return JSON.parse(result.choices[0].message.content);
    } catch (e) {
      throw e;
    }
  }
}

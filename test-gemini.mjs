import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY
});

async function main() {
  try {
    const { text } = await generateText({
      model: google('gemini-3.5-flash-lite'),
      prompt: 'Hello world',
      maxTokens: 65536
    });
    console.log('Success:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}
main();

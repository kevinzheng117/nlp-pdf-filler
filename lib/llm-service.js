import { LlmChat, UserMessage } from 'emergentintegrations/llm/chat';

// Default to OpenAI's gpt-4o-mini model for cost-effectiveness
const DEFAULT_PROVIDER = 'openai';
const DEFAULT_MODEL = 'gpt-4o-mini';

export async function extractWithLLM(text, extractionPrompt, sessionId = 'extraction-session') {
  try {
    const apiKey = process.env.EMERGENT_LLM_KEY;
    
    if (!apiKey) {
      throw new Error('EMERGENT_LLM_KEY not found in environment variables');
    }

    // Create LLM chat instance with extraction-focused system message
    const chat = new LlmChat({
      api_key: apiKey,
      session_id: sessionId,
      system_message: "You are a precise data extraction assistant. Extract exactly what is requested and return ONLY valid JSON without any additional commentary or formatting."
    }).with_model(DEFAULT_PROVIDER, DEFAULT_MODEL);

    // Create message with text to analyze and extraction instructions
    const message = new UserMessage({
      text: `${extractionPrompt}\n\nText to analyze: "${text}"`
    });

    // Send message and get response
    const response = await chat.send_message(message);
    
    return response.trim();
  } catch (error) {
    console.error('LLM extraction error:', error);
    throw new Error(`Failed to extract data using LLM: ${error.message}`);
  }
}
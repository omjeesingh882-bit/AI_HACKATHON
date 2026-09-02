interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export function cleanGroqText(text: string): string {
  if (!text) return '';
  
  // 1. If it has a closing </think>, return everything after it
  if (text.includes('</think>')) {
    const after = text.split('</think>').pop()?.trim();
    if (after && after.length > 5) return after;
  }

  // 2. If it starts with <think> and didn't close, extract the draft/response section
  if (text.startsWith('<think>')) {
    const draftMatch = text.match(/(?:Draft|Final Answer|Response):\s*([\s\S]+)$/i);
    if (draftMatch && draftMatch[1]) {
      return draftMatch[1].replace(/\?\?/g, '').trim();
    }
    // Or strip up to the last double newline
    const paragraphs = text.split(/\n\s*\n/);
    if (paragraphs.length > 1) {
      const last = paragraphs[paragraphs.length - 1].trim();
      if (!last.startsWith('<think>') && last.length > 10) {
        return last;
      }
    }
  }

  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim() || text;
}

export async function callGroqAi(
  messages: GroqMessage[], 
  options: GroqOptions = {}
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = options.model || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const temperature = options.temperature ?? 0.2;
  const max_tokens = options.max_tokens ?? 800;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Groq API returned ${res.status}:`, errText);
      return null;
    }

    const json = await res.json();
    const rawContent = json?.choices?.[0]?.message?.content;
    if (!rawContent) return null;

    return cleanGroqText(rawContent);
  } catch (error) {
    console.error('Groq AI invocation error:', error);
    return null;
  }
}

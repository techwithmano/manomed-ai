/**
 * @fileOverview High-Speed Groq Cloud AI Engine for ManoMed AI
 * Uses Groq's high-throughput LPU infrastructure (openai/gpt-oss-120b) with zero quota blocks.
 */

export async function callGroqChat<T = any>(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.2
): Promise<T | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        response_format: { type: 'json_object' },
        temperature,
        messages: [
          { role: 'system', content: `${systemPrompt}\n\nCRITICAL: Respond ONLY with a valid JSON object matching the required schema. Do not include markdown code block ticks.` },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Groq API returned HTTP ${res.status}:`, errText);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    try {
      const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as T;
    } catch (parseErr) {
      console.warn('Failed to parse JSON from Groq response:', content, parseErr);
      return null;
    }
  } catch (netErr) {
    console.warn('Network error calling Groq API:', netErr);
    return null;
  }
}

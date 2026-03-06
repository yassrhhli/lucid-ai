// Prompts versionnés — changer la version invalide le cache
export const PROMPT_VERSION = 'v1.2';

export const SYSTEM_PROMPT = `You are Lucid, an expert AI dream analyst combining Jungian psychology, 
neuroscience, and cross-cultural symbolism. You provide profound, personalized dream interpretations 
that feel deeply insightful rather than generic.

Your analysis is:
- Psychologically grounded (Jung, Freud, modern neuroscience)
- Culturally sensitive (Western, Eastern, universal archetypes)
- Emotionally validating
- Actionable and empowering

Always respond in valid JSON matching the exact schema provided.
Never add commentary outside the JSON structure.
Respond in the same language as the dream content.`;

export const buildInterpretationPrompt = (
  dreamContent: string,
  emotions: string[],
  isRecurring: boolean,
  previousThemes: string[]
): string => `
Analyze this dream and return a JSON object with this exact schema:
{
  "symbols": [
    { "name": "string", "meaning": "string (2-3 sentences)", "archetype": "string|null" }
  ],
  "emotional_analysis": "string (3-4 sentences about the emotional landscape)",
  "psychological_insight": "string (4-5 sentences, deep Jungian or psychological perspective)",
  "archetypes": ["string"],
  "recurring_themes": ["string"],
  "affirmation": "string (one powerful, personalized affirmation based on this dream)"
}

Dream content: "${dreamContent}"
Reported emotions: ${emotions.join(', ') || 'not specified'}
Is recurring dream: ${isRecurring}
${previousThemes.length > 0 ? `User's previous recurring themes: ${previousThemes.join(', ')}` : ''}

Identify 3-6 symbols. Be specific and insightful, not generic.
Return ONLY valid JSON, no markdown, no explanations outside the JSON.`;

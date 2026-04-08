const fetch = require("node-fetch");

function isValid(data) {
  if (!data) {
    console.log("Validation failed: Data is null or undefined.");
    return false;
  }
  if (!Array.isArray(data.challenges)) {
    console.log("Validation failed: 'challenges' array is missing.");
    return false;
  }
  if (data.challenges.length !== 3) {
    console.log(`Validation failed: Expected 3 challenges, got ${data.challenges.length}.`);
    return false;
  }

  const starts = new Set();
  const ends = new Set();

  for (const c of data.challenges) {
    if (!c.start || !c.end) {
      console.log("Validation failed: Missing 'start' or 'end' property.", c);
      return false;
    }
    if (c.start === c.end) {
      console.log("Validation failed: Start and end are the same.", c);
      return false;
    }

    starts.add(c.start);
    ends.add(c.end);
  }

  if (starts.size !== 3 || ends.size !== 3) {
    console.log("Validation failed: Start or end pages are not strictly unique.");
    return false;
  }

  return true;
}

async function fetchChallenges() {
  const prompt = `Generate 3 fun and engaging Wikipedia navigation challenges.

Return ONLY valid JSON in this format:
{
  "challenges": [
    { "start": "...", "end": "..." }
  ]
}

Rules:
- Exactly 3 challenges
- Unique start pages
- Unique end pages
- start ≠ end
- Use real Wikipedia article titles with underscores

Difficulty:
- Moderate (~5-10 clicks)
- Avoid direct links
- Avoid obscure or overly technical topics
- Avoid identical topic domains (ensure wide variety between challenges)

Make them fun, recognizable, and realistically solvable.
These are some examples of good challenges: Pacific Ocean to Poetry, Popular culture to Genghis Khan, Teletubbies to Noodles.

Output ONLY JSON. Do not include markdown formatting or conversational text.`;

  try {
    console.log("API Key Status:", process.env.OPENROUTER_API_KEY ? "LOADED SUCCESSFULLY" : "MISSING!");
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();

    // OpenRouter API errors
    if (data.error) {
      console.error("OpenRouter API Error:", JSON.stringify(data.error, null, 2));
      return null;
    }

    let text = data.choices?.[0]?.message?.content;

    if (!text) {
      console.error("No text returned from LLM. Raw data:", JSON.stringify(data, null, 2));
      return null;
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error("Could not find JSON object in LLM response. Raw text:", text);
      return null;
    }

    const cleanJson = jsonMatch[0];

    try {
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("JSON Parse Error:", e.message);
      console.error("Raw string attempted to parse:", cleanJson);
      return null;
    }

  } catch (networkError) {
    console.error("Network/Fetch Error:", networkError.message);
    return null;
  }
}

async function generateWithRetry() {
  for (let i = 0; i < 5; i++) {
    console.log(`\nAttempt ${i + 1}`);

    const result = await fetchChallenges();

    if (isValid(result)) {
      return result;
    }

    console.log("Failed: validation/fetching failure.");
  }

  throw new Error("Failed: after5 attempts.");
}

module.exports = { generateWithRetry };
const Groq = require("groq-sdk")



const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateBio = async ({ firstName, skills, education }) => {
  const educationText =
    education && education.length > 0
      ? education
          .map((e) =>
            [e.degree, e.fieldOfStudy, e.institution]
              .filter(Boolean)
              .join(", ")
          )
          .join("; ")
      : "Not provided";

  const prompt = `You are a profile writer for a developer networking app called CodeCircle.

Developer details:
- Name: ${firstName}
- Skills: ${skills.join(", ")}
- Education: ${educationText}

Task: Write a short professional bio for this developer in first person.

Rules:
- 2 to 3 sentences, under 60 words.
- Mention specific skills from the list, avoid generic phrases like "passionate developer".
- Use only the details given above. Do not invent companies, projects, or experience.
- If education is "Not provided", do not mention education.
- Output only the bio text, with no introduction, quotes, or explanation.`;

  try {
    const response = await groq.chat.completions.create({
  model: "openai/gpt-oss-120b",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.7,
  max_completion_tokens: 500,
  reasoning_effort: "low",
});

    const bio = response.choices[0]?.message?.content;

    if (!bio || !bio.trim()) {
      throw new Error("Groq returned an empty response");
    }

    console.log("Bio generated successfully using Groq");

    return bio.trim();
  } catch (err) {
    console.error("GROQ BIO ERROR:", {
      message: err.message,
      status: err.status,
      code: err.code,
    });

    throw err;
  }
};


const withTimeout = (promise, ms) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("AI timed out")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const extractJsonArray = (text) => {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON array found in AI response");
  return JSON.parse(match[0]);
};

const buildFallbackStarters = ({ target, commonSkills }) => {
  const name = target.firstName;
  const targetSkills = target.skills || [];

  if (commonSkills.length > 0) {
    const s = commonSkills[0];
    return [
      `Hi ${name}! I saw we both work with ${s}. What are you building with it right now?`,
      `Hey ${name}, I'm also into ${s}. What is one thing you wish you knew earlier about it?`,
      `Hello ${name}! Are you working on any ${s} projects you would like to collaborate on?`,
    ];
  }

  if (targetSkills.length > 0) {
    const s = targetSkills[0];
    return [
      `Hi ${name}! I noticed you work with ${s}. How did you get started with it?`,
      `Hey ${name}, I'm trying to learn more about ${s}. Any tips for a beginner?`,
      `Hello ${name}! What is the most interesting project you have built using ${s}?`,
    ];
  }

  return [
    `Hi ${name}! What kind of projects are you working on these days?`,
    `Hey ${name}, what technologies are you most excited about right now?`,
    `Hello ${name}! What are you hoping to learn or build with other developers here?`,
  ];
};

const generateConversationStarters = async ({ me, target }) => {
  const mySkills = (me.skills || []).map((s) => s.toLowerCase());
  const targetSkills = target.skills || [];

  const commonSkills = targetSkills.filter((s) =>
    mySkills.includes(s.toLowerCase()),
  );

  const prompt = `You are an assistant inside a developer networking app called CodeCircle.

Sender (the person who will send the message): ${me.firstName}
Receiver: ${target.firstName}
Common skills: ${commonSkills.length > 0 ? commonSkills.join(", ") : "None"}
Receiver's skills: ${targetSkills.length > 0 ? targetSkills.join(", ") : "Not provided"}
Receiver's about: ${target.about || "Not provided"}

Task: Write 3 different first messages that ${me.firstName} can send to ${target.firstName} to start a chat.

Rules:
- Each message is 1 to 2 sentences, friendly and casual.
- Each message ends with one specific question.
- If there are common skills, mention one of them. If not, ask about one of the receiver's skills.
- Do not use emojis. Do not invent projects, companies, or experience.
- Output only a JSON array of exactly 3 strings, with no extra text, no markdown, and no backticks.`;

  try {
    const start = Date.now();

    const interaction = await withTimeout(
      ai.interactions.create({
        model: "gemini-3.8-flash", // wahi naam jo bio me chal raha hai
        input: prompt,
      }),
      25000, // 25 second se zyada nahi rukenge
    );

    console.log("AI conversation starters took", Date.now() - start, "ms");

    const parsed = extractJsonArray(interaction.output_text || "");
    const messages = parsed.filter((m) => typeof m === "string" && m.trim());

    if (messages.length === 0) throw new Error("AI returned no usable messages");

    return messages.slice(0, 3);
  } catch (err) {
    // asli wajah server logs me dikhegi, user ko phir bhi suggestions milengi
    console.error("AI STARTERS FALLBACK USED:", err.message);
    return buildFallbackStarters({ target, commonSkills });
  }
};
module.exports = { generateBio, generateConversationStarters };

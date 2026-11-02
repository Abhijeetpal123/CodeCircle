const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

const generateBio = async ({ firstName, skills, education }) => {
  const educationText =
    education && education.length > 0
      ? education
          .map((e) =>
            [e.degree, e.fieldOfStudy, e.institution]
              .filter(Boolean)
              .join(", "),
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

  const start = Date.now();

  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: prompt,
  });

  console.log("AI took", Date.now() - start, "ms");

  const bio = interaction.output_text;

  if (!bio || !bio.trim()) {
    throw new Error("AI returned an empty response");
  }

  return bio.trim();
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

  const start = Date.now();

  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: prompt,
  });

  console.log("AI conversation starters took", Date.now() - start, "ms");

  const raw = (interaction.output_text || "")
    .replace(/```json|```/g, "")
    .trim();

  let messages;
  try {
    messages = JSON.parse(raw);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("AI returned an unexpected format");
  }

  return messages.filter((m) => typeof m === "string").slice(0, 3);
};

module.exports = { generateBio, generateConversationStarters };

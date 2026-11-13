const Groq = require("groq-sdk");

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
  const name = target.firstName || "there";
  const targetSkills = Array.isArray(target.skills)
    ? target.skills.filter((skill) => typeof skill === "string" && skill.trim())
    : [];

  if (commonSkills.length > 0) {
    const skill = commonSkills[0];

    return [
      `Hi ${name}! I noticed we both have ${skill} listed in our skills. What's your favourite thing about this technology?`,
      `Hey ${name}, since we have ${skill} in common, I'm curious what do you find most interesting about it?`,
      `Hello ${name}! What's one thing you've enjoyed learning about ${skill}?`,
    ];
  }

  if (targetSkills.length > 0) {
    const skill = targetSkills[0];

    return [
      `Hi ${name}! I noticed ${skill} is one of your skills. What do you find most interesting about it?`,
      `Hey ${name}, I'd love to know more about ${skill}. What's your favourite part of learning or using it?`,
      `Hello ${name}! What's one thing you'd recommend someone explore when learning ${skill}?`,
    ];
  }

  return [
    `Hi ${name}! What kind of projects are you interested in building?`,
    `Hey ${name}, what technology are you currently interested in learning?`,
    `Hello ${name}! What do you enjoy most about connecting with other developers?`,
  ];
};


const generateConversationStarters = async ({ me, target }) => {
 const senderSkills = Array.isArray(me.skills)
  ? me.skills.filter(
      (skill) => typeof skill === "string" && skill.trim(),
    )
  : [];

const receiverSkills = Array.isArray(target.skills)
  ? target.skills.filter(
      (skill) => typeof skill === "string" && skill.trim(),
    )
  : [];

const senderSkillSet = new Set(
  senderSkills.map((skill) => skill.trim().toLowerCase()),
);

const commonSkills = receiverSkills.filter((skill) =>
  senderSkillSet.has(skill.trim().toLowerCase()),
);
  const prompt = `
You are helping a user start a genuine professional conversation with another developer on a networking platform.

Generate exactly 3 natural, personalized conversation starters using the profile information provided.

SENDER INFORMATION:
Name: ${me.firstName || "Not provided"}
Skills: ${me.skills?.join(", ") || "Not provided"}

RECEIVER INFORMATION:
Name: ${target.firstName || "Not provided"}
Skills: ${target.skills?.join(", ") || "Not provided"}
About: ${target.about || "Not provided"}

CONVERSATION RULES:

1. Write from the sender's perspective.
2. Address the receiver using their actual first name. Never invent or change names.
3. Keep messages friendly, casual, natural, and professionally appropriate.
4. Each message must contain 1–2 sentences and end with one specific question.
5. Use simple, everyday English. Avoid corporate jargon and unnecessarily sophisticated vocabulary.
6. Identify shared skills between the sender and receiver. If shared skills exist, naturally mention one.
7. If there are no shared skills, ask about an actual skill listed in the receiver's profile.
8. Use the receiver's About section only when it provides relevant information.
9. Never invent projects, companies, achievements, interests, experience, or personal details.
10. Never assume that having a particular skill means someone has professional experience with it.
11. Never assume the receiver is currently working on a project or using a particular technology.
12. Never invent the sender's experiences, interests, projects, or activities.
13. Never pretend to be another person or introduce yourself using a fictional identity.
14. Avoid exaggerated compliments, generic interview questions, and artificial-sounding phrases.
15. Make all three messages meaningfully different rather than repeating the same question in different words.
16. Use only information explicitly available in the provided profiles.
17. If profile information is limited, prefer a simple, genuine conversation opener rather than inventing personalization.
18. Never describe the receiver as an expert, experienced developer,
    or someone who works extensively with a technology unless
    their profile explicitly confirms it.

19. Never create imaginary scenarios around listed skills.

20. Do not assume someone builds full-stack applications,
    scalable systems, APIs, or production software just because
    those technologies appear in their skills.

21. Prefer simple questions about the listed technology itself
    rather than questions about assumed professional experience.

22. Every personalized statement must be directly supported
    by the receiver's profile.

VARIETY:
- Message 1: Prefer a shared skill when one exists.
- Message 2: Explore one of the receiver's listed skills.
- Message 3: Use relevant information from the About section or ask a simple developer-related question.
- Do not force these approaches when the necessary profile information is unavailable.

OUTPUT REQUIREMENTS:
- Return exactly 3 strings inside a valid JSON array.
- Every string must be a complete conversation starter.
- Do not include explanations, markdown, code fences, or additional text.
- Do not use emojis.`;

  try {
    const start = Date.now();

    const response = await withTimeout(
      groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_completion_tokens: 500,
        reasoning_effort: "low",
      }),
      25000,
    );

    const output = response.choices[0]?.message?.content || "";

    console.log("GROQ CHAT STARTERS GENERATED SUCCESSFULLY");

    const parsed = extractJsonArray(output);

    const messages = parsed.filter((m) => typeof m === "string" && m.trim());

    if (messages.length === 0)
      throw new Error("AI returned no usable messages");

    return messages.slice(0, 3);
  } catch (err) {
    // asli wajah server logs me dikhegi, user ko phir bhi suggestions milengi
    console.error("AI STARTERS FALLBACK USED:", err.message);
    return buildFallbackStarters({ target, commonSkills });
  }
};
module.exports = { generateBio, generateConversationStarters };

const { GoogleGenAI } = require("@google/genai");

 const ai = new GoogleGenAI({});

const generateBio = async ({ firstName, skills, education }) => {
  const educationText =
    education && education.length > 0
      ? education
          .map((e) =>
            [e.degree, e.fieldOfStudy, e.institution].filter(Boolean).join(", ")
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

module.exports = { generateBio };
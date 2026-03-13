import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/ai", async (req, res) => {

  try {

    const { message } = req.body;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
             content: `
You are an Indian legal assistant.

When a user describes a legal problem, return structured JSON with:

1. applicable_laws
2. claims_user_can_make
3. legal_timeline
4. emergency_contacts
5. useful_resources

Keep answers concise and actionable.
Only return JSON.
`
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("AI RAW RESPONSE:", data);

    if (data.error) {
      return res.json({
        reply: "AI service error: " + data.error.message
      });
    }

    const reply =
      data.choices?.[0]?.message?.content ||
      "AI couldn't generate a response.";

    res.json({ reply });

  } catch (error) {

    console.error("AI ERROR:", error);

    res.status(500).json({
      reply: "Server error contacting AI."
    });

  }

});

export default router;
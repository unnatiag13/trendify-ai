import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend working");
});

app.post("/api/ai", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "No prompt provided",
      });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );

    const aiText =
      response.data?.candidates?.[0]
      ?.content?.parts?.[0]?.text
      || "No response";

    res.json({
      reply: aiText,
    });

  } catch (error) {
    console.error(
      "AI API error:",
      error.response?.data?.error?.message
      || error.message
    );

    res.status(500).json({
      error: "AI request failed",
    });
  }
});

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(
    `🚀 Server running on port ${PORT}`
  )
);
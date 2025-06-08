import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { execSync } from "child_process";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("✅ YouTube Analyzer Backend is Running");
});

app.post("/analyze_link", async (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).json({ error: "Missing URL" });

  const id = uuidv4();
  const audioFile = `temp-${id}.mp3`;

  try {
    console.log("🔗 Downloading:", videoUrl);

    // Download YouTube audio
    execSync(`yt-dlp -f bestaudio --extract-audio --audio-format mp3 -o "${audioFile}" "${videoUrl}"`, {
      stdio: "ignore"
    });

    // Transcribe audio
    console.log("🧠 Transcribing...");
    const transcription = execSync(`whisper "${audioFile}" --model base --output_format txt`, {
      encoding: "utf-8"
    });

    const transcriptPath = audioFile.replace(".mp3", ".txt");
    const script = fs.readFileSync(transcriptPath, "utf-8").trim();

    console.log("✍️ Analyzing transcript with GPT...");
    const prompt = `
You're a YouTube Shorts coach. Analyze this transcript and give a feedback summary, a main score out of 100, 5 category scores (Hook, Retention, Editing, Audio, Engagement), and 2 specific improvement tips. Output JSON like this:
{
  "score": 82,
  "feedback": "Your hook is great, but retention drops.",
  "subScores": [["Hook", 90], ["Retention", 65], ...],
  "recommendations": [
    {"title": "Improve Retention", "body": "Add suspense near the middle."}
  ]
}
Transcript:
${script}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const json = JSON.parse(completion.choices[0].message.content);
    res.json(json);
  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: "Failed to analyze video." });
  } finally {
    // Clean up temp files
    try {
      fs.unlinkSync(audioFile);
      fs.unlinkSync(audioFile.replace(".mp3", ".txt"));
    } catch {}
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});


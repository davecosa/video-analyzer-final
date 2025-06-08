import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/analyze_link", async (req, res) => {
  const url = (req.body.url || "").trim();
  console.log("→ Received URL:", url);

  if (!url) {
    return res.status(400).json({ status: "error", message: "No URL provided" });
  }

  let platform = "unknown";

  if (/youtube\.com\/shorts\//.test(url)) {
    platform = "youtube";
  } else if (/tiktok\.com/.test(url)) {
    platform = "tiktok";
  } else if (/instagram\.com\/reels?/.test(url)) {
    platform = "instagram";
  } else {
    return res.status(400).json({ status: "error", message: "Unsupported platform" });
  }

  console.log("→ Detected platform:", platform);

  // Return mock data
  return res.json({
    status: "success",
    platform,
    score: 84,
    feedback: "Great start! Just work on pacing.",
    subScores: {
      hook: 92,
      quality: 88,
      retention: 84,
      audio: 78,
      editing: 81,
      engagement: 89
    },
    recommendations: [
      "Cut 2–3 seconds from the start.",
      "Use dynamic movement.",
      "Add overlays.",
      "Stronger CTA at the end."
    ]
  });
});

app.listen(PORT, () => {
  console.log(`✅ Mock server running on port ${PORT}`);
});


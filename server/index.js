import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCombinationAnalysis, createRecommendation } from "./aiClient.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5174;
const apiKey = process.env.OPENAI_API_KEY || process.env.FACTCHAT_API_KEY || "";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(apiKey && !apiKey.includes("YOUR_")),
    baseURL: process.env.OPENAI_BASE_URL || process.env.FACTCHAT_BASE_URL || "official-openai-default",
    model: process.env.OPENAI_MODEL || process.env.FACTCHAT_MODEL || "gpt-4o-mini"
  });
});

app.post("/api/recommend", async (req, res) => {
  try {
    if (!req.body?.skinTone || !req.body?.candidates) {
      return res.status(400).json({ error: "추천에 필요한 피부 톤과 후보 색상 정보가 없습니다." });
    }

    const result = await createRecommendation(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI 추천 생성 중 오류가 발생했습니다." });
  }
});

app.post("/api/analyze-combination", async (req, res) => {
  try {
    if (!req.body?.skinTone || !req.body?.selectedColors || !req.body?.scoreResult) {
      return res.status(400).json({ error: "분석에 필요한 피부 톤, 선택 색상, 점수 정보가 없습니다." });
    }

    const result = await createCombinationAnalysis(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI 설명 생성 중 오류가 발생했습니다." });
  }
});

app.use(express.static(distPath));

app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`AI server listening on port ${port}`);
});

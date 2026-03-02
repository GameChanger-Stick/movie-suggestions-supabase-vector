import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { pipeline } from "@xenova/transformers";
import { supabase } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve the simple website
app.use(express.static(path.join(__dirname, "public")));

// Receive user input as `userQuery`
app.post("/query", async (req, res) => {
  const userQuery = req.body?.userQuery;

  if (typeof userQuery !== "string" || userQuery.trim().length === 0) {
    return res.status(400).json({ error: "userQuery is required" });
  }

  try {
    const answer = await answerUserQuery(userQuery);
    return res.json({ result: answer });
  } catch (err) {
    const message = err?.message ?? String(err);
    return res.status(500).json({ error: message });
  }
});

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;
const embedderPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

async function answerUserQuery(text) {
  if (!openai) {
    throw new Error("Missing OPENAI_API_KEY. Put it in .env and restart the server.");
  }

  const embedder = await embedderPromise;
  const outputembedded = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });

  const embedding = Array.from(outputembedded.data);

  const { data, error } = await supabase.rpc("match_movies", {
    query_embedding: embedding,
    match_threshold: 0.2,
    match_count: 3,
  });

  if (error) {
    throw new Error(`Error calling match_movies: ${error.message ?? JSON.stringify(error)}`);
  }

  const txtData = Array.isArray(data) ? data.map((item) => item.content).join("\n") : "";

  const response = await openai.chat.completions.create({
    model: "gpt-5-nano",
    messages: [
      {
        role: "system",
        content:
          'You are a friendly movie recommendation assistant. You will be given some context about movies and a question. Your job is to answer using only the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don\'t know the answer." Do not make up the answer.',
      },
      {
        role: "user",
        content: `Context:${txtData}, Question: ${text}`,
      },
    ],
  });

  return response?.choices?.[0]?.message?.content ?? "";
}

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Web server running on http://localhost:${port}`);
});

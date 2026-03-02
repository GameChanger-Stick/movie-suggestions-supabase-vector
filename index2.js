import "dotenv/config";
import OpenAI from "openai";
import { pipeline } from "@xenova/transformers";
import { supabase } from './config.js';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY. Put it in .env and run: npm start");
  process.exit(1);
}

const openai = new OpenAI({ apiKey });
const embedderPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

async function userQuery(text) {
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

  const contextText = Array.isArray(data) ? data.map((item) => item.content).join("\n") : "";

  const response = await openai.chat.completions.create({
    model: "gpt-5-nano",
    messages: [
      {
        role: "system",
        content:
          'You are an enthusiastic podcast expert who loves recommending podcasts to people. You will be given two pieces of information - some context about podcasts episodes and a question. Your main job is to formulate a short answer to the question using the provided context using friendly language. If you are unsure and cannot find the answer in the context, say, "Sorry, I don\'t know the answer." Please do not make up the answer.',
      },
      {
        role: "user",
        content: `Context:${contextText}, Question: ${text}`,
      },
    ],
  });

  return response?.choices?.[0]?.message?.content ?? "";
}

const input = process.argv.slice(2).join(" ") || "top highly rated movies?";
try {
  const answer = await userQuery(input);
  console.log("AI Response:", answer);
} catch (err) {
  console.error(err);
  process.exit(1);
}

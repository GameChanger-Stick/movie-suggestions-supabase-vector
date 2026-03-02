import { createClient } from "@supabase/supabase-js";

// /** OpenAI config */
// if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI API key is missing or invalid.");
// export const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   dangerouslyAllowBrowser: true
// });

/** Supabase config */
const privateKey = process.env.SUPRA_API_KEY;
if (!privateKey) throw new Error(`Expected env var SUPRA_API_KEY`);
const url = process.env.SUPRA_API_URL;
if (!url) throw new Error(`Expected env var SUPRA_API_URL`);
export const supabase = createClient(url, privateKey);
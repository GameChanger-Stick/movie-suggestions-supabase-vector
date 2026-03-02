# Movie Suggestions (Supabase Vector)

Simple movie-suggestions demo powered by:
- Local embeddings via `Xenova/all-MiniLM-L6-v2` (384-dim vectors)
- Supabase Postgres + `pgvector` for similarity search (`match_movies` RPC)
- OpenAI chat completion to turn retrieved context into a friendly answer

## Run the website

```bash
npm install
npm run web
```

Then open:
- http://localhost:3000

The page sends your input as JSON `{ "userQuery": "..." }` to `POST /query` and shows the returned `result` under the button.

## Run the CLI script

```bash
npm start
# or
node index2.js "top highly rated movies?"
```

## Environment variables

Create a `.env` file:

```bash
OPENAI_API_KEY=...
SUPRA_API_URL=...
SUPRA_API_KEY=...
```

Notes:
- `SUPRA_API_URL` and `SUPRA_API_KEY` are used by [config.js](config.js) to create the Supabase client.
- `OPENAI_API_KEY` is used by the `/query` endpoint in [server.js](server.js) and by [index2.js](index2.js).

## Supabase requirements

This repo assumes you have:
- A table containing movie text in a `content` column
- An `embedding` column with vector size **384**
- A Postgres function exposed as RPC named `match_movies` that accepts:
  - `query_embedding`
  - `match_threshold`
  - `match_count`

See [document.sql](document.sql) for your schema/functions.

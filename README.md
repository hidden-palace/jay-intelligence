# Jay's Intelligence

Jay's Intelligence is a full-stack AI assistant for a real estate CRM workflow. It provides a chat UI, an Express backend, OpenAI tool/function calling, mock CRM data, and iframe-friendly embedding support.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- AI: OpenAI Chat Completions with function/tool calling
- Data: in-memory mock CRM store

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env
```

3. Set `OPENAI_API_KEY` in `.env`.

The default `OPENAI_MODEL` is `gpt-5.5`, which OpenAI currently lists as the latest flagship model. Set it to `gpt-4.1` if you specifically want the GPT-4.1 model requested in the brief.

4. Run both apps locally:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787`

## Embedding

The app supports iframe embedding and reads a `userId` query parameter:

```html
<iframe
  src="http://localhost:5173/?userId=123"
  title="Jay's Intelligence"
  style="width: 420px; height: 720px; border: 0;"
></iframe>
```

For script-based embedding later, serve the Vite build from a CDN or the backend static route and inject the app into a container element.

## API

### `POST /chat`

Request:

```json
{
  "message": "What tasks are due?",
  "history": [
    { "role": "user", "content": "Show my transactions" },
    { "role": "assistant", "content": "Here are your active transactions..." }
  ],
  "userId": "123"
}
```

Response:

```json
{
  "reply": "You have two open tasks...",
  "model": "gpt-5.5",
  "toolCalls": ["get_tasks"]
}
```

## CRM Tools

The assistant can call these mock CRM tools:

- `get_transactions()`
- `get_tasks()`
- `get_appointments()`
- `create_task(task_name, due_date, contact_name)`

## Production Notes

- Build the frontend with `npm run build`.
- Start the backend with `npm start`; it serves `client/dist` if present.
- Render can host the Express app with build command `npm install && npm run build` and start command `npm start`.
- Vercel can host the Vite frontend separately; point `VITE_API_BASE_URL` to the deployed Express API.

## Future Structure

The backend keeps mock CRM logic isolated in `server/src/mockCrm.js`, so it can be replaced with GoHighLevel or another CRM API later. Authentication, persistent memory, and multi-user data isolation can be added around the existing `userId` and session boundaries.
"# jay-intelligence" 

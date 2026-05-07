import {
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Home,
  Loader2,
  Plus,
  Send,
  User
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8787";

const QUICK_ACTIONS = [
  "Show my active transactions",
  "What tasks are due next?",
  "List upcoming appointments",
  "Create a task to call John Carter due May 10"
];

const STARTER_MESSAGE = {
  id: "assistant_welcome",
  role: "assistant",
  content:
    "I can help with transactions, follow-ups, appointments, and task creation. What needs attention today?"
};

function getUserId() {
  return new URLSearchParams(window.location.search).get("userId") || "guest";
}

function getStorageKey(userId) {
  return `jays-intelligence:${userId}:messages`;
}

function createMessage(role, content) {
  return {
    id: `${role}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

function safeLoadMessages(storageKey) {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) {
      return [STARTER_MESSAGE];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [STARTER_MESSAGE];
  } catch {
    return [STARTER_MESSAGE];
  }
}

function MessageIcon({ role }) {
  const Icon = role === "user" ? User : Bot;
  return (
    <span className={`message-icon ${role}`} aria-hidden="true">
      <Icon size={16} />
    </span>
  );
}

function LoadingBubble() {
  return (
    <div className="message-row assistant">
      <MessageIcon role="assistant" />
      <div className="message-bubble loading-bubble">
        <Loader2 size={16} className="spin" />
        <span>Reviewing CRM data</span>
      </div>
    </div>
  );
}

function App() {
  const userId = useMemo(getUserId, []);
  const storageKey = useMemo(() => getStorageKey(userId), [userId]);
  const [messages, setMessages] = useState(() => safeLoadMessages(storageKey));
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  async function submitMessage(nextDraft = draft) {
    const content = nextDraft.trim();
    if (!content || isLoading) {
      return;
    }

    setError("");
    setDraft("");

    const userMessage = createMessage("user", content);
    const previousMessages = messages.filter((message) =>
      ["user", "assistant"].includes(message.role)
    );

    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: content,
          history: previousMessages,
          userId
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "The assistant could not respond.");
      }

      setMessages((current) => [
        ...current,
        createMessage("assistant", data.reply || "No response returned.")
      ]);
    } catch (requestError) {
      setError(requestError.message);
      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          "I could not reach the CRM assistant service. Check the backend and OpenAI API key, then try again."
        )
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitMessage();
  }

  function clearSession() {
    setError("");
    setMessages([STARTER_MESSAGE]);
    setDraft("");
    inputRef.current?.focus();
  }

  return (
    <main className="app-shell">
      <aside className="crm-rail" aria-label="CRM overview">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Home size={19} />
          </div>
          <div>
            <p>Jay's Intelligence</p>
            <span>Real Estate CRM AI</span>
          </div>
        </div>

        <div className="session-chip">User {userId}</div>

        <section className="signal-group">
          <div className="signal-item">
            <CalendarClock size={17} />
            <div>
              <strong>Next Closing</strong>
              <span>John Carter · May 18</span>
            </div>
          </div>
          <div className="signal-item">
            <ClipboardList size={17} />
            <div>
              <strong>Open Tasks</strong>
              <span>2 follow-ups pending</span>
            </div>
          </div>
          <div className="signal-item">
            <CheckCircle2 size={17} />
            <div>
              <strong>Appointments</strong>
              <span>Buyer Consultation · May 9</span>
            </div>
          </div>
        </section>

        <button className="reset-button" type="button" onClick={clearSession}>
          <Plus size={16} />
          New Session
        </button>
      </aside>

      <section className="chat-panel" aria-label="Jay's Intelligence chat">
        <header className="chat-header">
          <div>
            <h1>Jay's Intelligence</h1>
            <p>Transaction management, follow-ups, client communication, and deal tracking.</p>
          </div>
          <span className="status-pill">Live CRM Tools</span>
        </header>

        <div className="quick-actions" aria-label="Quick actions">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => submitMessage(action)}
              disabled={isLoading}
            >
              {action}
            </button>
          ))}
        </div>

        <div className="messages" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={`message-row ${message.role}`}>
              <MessageIcon role={message.role} />
              <div className="message-bubble">{message.content}</div>
            </div>
          ))}
          {isLoading && <LoadingBubble />}
          <div ref={messagesEndRef} />
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form className="composer" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitMessage();
              }
            }}
            placeholder="Ask about deals, tasks, appointments, or follow-ups..."
            rows={1}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || draft.trim().length === 0}>
            {isLoading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
            <span>Send</span>
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;

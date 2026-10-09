import { useEffect, useRef, useState } from "react";
import {
  Search,
  Backpack,
  MapPin,
  ShieldCheck,
  Sparkles,
  SendHorizontal,
} from "lucide-react";
import "./agentPage.css";

// Match cards use the same fields as the server's get_item result
// (see server/src/tools.ts), so real items can replace these later.
type FoundItem = {
  id: string;
  item_type: string;
  colors: string[];
  area: string;
  found_at: string;
};

type Message = {
  role: "user" | "assistant";
  text: string;
  items?: FoundItem[];
};

// Placeholder summary. Fill category from the category page, and color and
// location from the details the agent collects during the chat.
const reportSummary: {
  category: string;
  color: { label: string; swatch: string } | null;
  location: string | null;
} = {
  category: "Bookbag",
  color: null,
  location: null,
};

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function daysAgo(isoDate: string) {
  const days = Math.floor((Date.now() - Date.parse(isoDate)) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  // Add these actions when the other pages are ready.
  // const handleBack = () => {};
  // const handleOpenMatch = (itemId) => {};
  // const handleSeeAllMatches = () => {};

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((current) => [...current, { role: "user", text }]);
    // Send the conversation to the agent here and add its reply to messages.
  };

  return (
    <div className="agent-page">
      <header className="agent-header">
        <div className="agent-logo">
          <span className="agent-logo-icon">
            <Search size={17} aria-hidden="true" />
          </span>
          <span>FoundYou</span>
        </div>

        <button
          type="button"
          className="agent-back-button"
          aria-disabled="true"
          // onClick={handleBack}
        >
          Back
        </button>
      </header>

      <div className="agent-layout">
        <aside className="agent-sidebar" aria-label="Your report so far">
          <h2 className="agent-sidebar-title">Your report so far</h2>

          <div className="agent-summary">
            <div className="agent-summary-row">
              <span className="agent-summary-icon highlighted">
                <Backpack size={18} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div>
                <div className="agent-summary-value">{reportSummary.category}</div>
                <div className="agent-summary-label">Category</div>
              </div>
            </div>

            <div className="agent-summary-row">
              <span
                className={`agent-color-swatch ${reportSummary.color ? "" : "empty"}`}
                style={reportSummary.color ? { background: reportSummary.color.swatch } : undefined}
                aria-hidden="true"
              />
              <div>
                <div className={`agent-summary-value ${reportSummary.color ? "" : "empty"}`}>
                  {reportSummary.color?.label ?? "Not yet known"}
                </div>
                <div className="agent-summary-label">Color — from chat</div>
              </div>
            </div>

            <div className="agent-summary-row">
              <span className="agent-summary-icon">
                <MapPin size={18} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div>
                <div className={`agent-summary-value ${reportSummary.location ? "" : "empty"}`}>
                  {reportSummary.location ?? "Not yet known"}
                </div>
                <div className="agent-summary-label">Location — from chat</div>
              </div>
            </div>
          </div>

          <p className="agent-privacy-note">
            <ShieldCheck size={16} strokeWidth={1.5} aria-hidden="true" />
            <span>
              The agent only searches reports already submitted by other
              students — nothing is shared until you verify a match.
            </span>
          </p>
        </aside>

        <main className="agent-chat">
          <div className="agent-chat-header">
            <span className="agent-avatar large">
              <Sparkles size={18} aria-hidden="true" />
            </span>
            <div>
              <div className="agent-name">FoundYou Agent</div>
              <div className="agent-status">
                <span className="agent-status-dot" aria-hidden="true" />
                Searching campus reports
              </div>
            </div>
          </div>

          <div className="agent-messages" aria-live="polite">
            {messages.length === 0 && (
              <p className="agent-empty-state">
                Describe what you lost — color, any unique details, and where
                you last had it — and the agent will search campus reports.
              </p>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`agent-message ${message.role}`}>
                {message.role === "assistant" && (
                  <span className="agent-avatar" aria-hidden="true" />
                )}

                <div className="agent-message-content">
                  <p className="agent-bubble">{message.text}</p>

                  {message.items?.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="agent-match-card"
                      aria-disabled="true"
                      // onClick={() => handleOpenMatch(item.id)}
                    >
                      <span className="agent-match-image">
                        <Backpack size={24} strokeWidth={1.4} aria-hidden="true" />
                      </span>
                      <span className="agent-match-text">
                        <span className="agent-match-title">
                          {capitalize(item.colors.join(" "))} {item.item_type}
                        </span>
                        <span className="agent-match-detail">
                          Found near {item.area} · {daysAgo(item.found_at)}
                        </span>
                      </span>
                      {/* The backend does not rank matches yet, so this label is fixed for now. */}
                      <span className="agent-match-badge">Strong match</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <form
            className="agent-input-bar"
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
          >
            <label className="agent-sr-only" htmlFor="agent-input">
              Type your answer
            </label>
            <input
              id="agent-input"
              className="agent-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your answer…"
              autoComplete="off"
            />
            <button type="submit" className="agent-send-button" aria-label="Send">
              <SendHorizontal size={18} aria-hidden="true" />
            </button>
          </form>

          <div className="agent-see-all">
            <button
              type="button"
              className="agent-see-all-button"
              aria-disabled="true"
              // onClick={handleSeeAllMatches}
            >
              See all possible matches instead
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

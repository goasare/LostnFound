import { useRef, useEffect, useState } from "react";

type ToolCall = { name: string; arguments: unknown; result: any };
type RawMsg = { role: string; content: string | null; [k: string]: unknown };
type Shown = { role: "user" | "assistant"; text: string };

const CARD_FIELDS = ["item_type", "colors", "brand", "description", "area", "location_detail", "found_at"] as const;
const MAX_CARDS = 3;

export function App() {
  const [shown, setShown] = useState<Shown[]>([]);
  const [raw, setRaw] = useState<RawMsg[]>([]);
  const [calls, setCalls] = useState<ToolCall[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView(); }, [shown, busy]);

  const cards = calls.filter((c) => c.name === "get_item" && c.result?.item).map((c) => c.result.item).slice(-MAX_CARDS);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setError("");
    setBusy(true);
    const history = [...raw, { role: "user", content: text }];
    setShown((s) => [...s, { role: "user", text }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setRaw([...history, ...data.newMessages]);
      setCalls((c) => [...c, ...data.toolCalls]);
      setShown((s) => [...s, { role: "assistant", text: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setShown([]); setRaw([]); setCalls([]); setError("");
  }

  return (
    <div style={{ display: "flex", gap: 16, padding: 16, fontFamily: "sans-serif", height: "100vh", boxSizing: "border-box" }}>
      <div style={{ flex: 2, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>FoundYou test chat</h2>
          <button onClick={reset}>New conversation</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", border: "1px solid #ccc", padding: 8, margin: "8px 0" }}>
          {shown.map((m, i) => (
            <p key={i} style={{ margin: "6px 0" }}>
              <b>{m.role === "user" ? "You" : "Assistant"}:</b> {m.text}
            </p>
          ))}
          {cards.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {cards.map((it: any) => (
                <div key={it.id} style={{ border: "1px solid #999", padding: 8, width: 220 }}>
                  <div style={{ background: "#ddd", height: 100, display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
                    placeholder image
                  </div>
                  {CARD_FIELDS.map((f) => (
                    <div key={f}><small><b>{f}:</b> {Array.isArray(it[f]) ? it[f].join(", ") : String(it[f] ?? "-")}</small></div>
                  ))}
                  <button disabled style={{ marginTop: 6 }}>Message</button>
                </div>
              ))}
            </div>
          )}
          {busy && <p><i>Assistant is thinking...</i></p>}
          {error && <p style={{ color: "crimson" }}>Error: {error}</p>}
          <div ref={endRef} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message" style={{ flex: 1, padding: 6 }} />
          <button type="submit" disabled={busy}>Send</button>
        </form>
      </div>
      <div style={{ flex: 1, overflowY: "auto", border: "1px solid #ccc", padding: 8, minWidth: 0 }}>
        <h3 style={{ marginTop: 0 }}>Debug: tool calls</h3>
        {calls.length === 0 && <small>No tool calls yet.</small>}
        {calls.map((c, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <b>{i + 1}. {c.name}</b>
            <pre style={{ margin: 0, fontSize: 11, whiteSpace: "pre-wrap" }}>args: {JSON.stringify(c.arguments, null, 1)}</pre>
            <pre style={{ margin: 0, fontSize: 11, whiteSpace: "pre-wrap" }}>result: {JSON.stringify(c.result, null, 1)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

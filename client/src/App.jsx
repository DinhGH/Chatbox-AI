/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CHAT_ENDPOINT = `${API_BASE}/api/chat`;

const formatMessage = (text) => {
  // Replace **bold** and *bold* with <strong> tags
  let formatted = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<strong>$1</strong>");

  // Format numbered lists (1. 2. 3. etc.)
  formatted = formatted.replace(
    /(\d+)\.\s+(.+?)(?=\d+\.|\n\n|$)/gs,
    (match, num, content) => {
      return `<div style="margin-bottom: 0.5rem;"><span style="font-weight: 600; margin-right: 0.5rem;">${num}.</span>${content.trim()}</div>`;
    }
  );

  // Format bullet points (- or •)
  formatted = formatted.replace(
    /^[•-]\s+(.+)$/gm,
    '<div style="margin-left: 1rem; margin-bottom: 0.5rem;">• $1</div>'
  );

  // Preserve line breaks
  formatted = formatted.replace(/\n/g, "<br/>");

  return formatted;
};

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Xin chào! Tôi là trợ lý AI của bạn. Hãy hỏi tôi bất kỳ câu hỏi nào!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const text = input;
    setInput("");
    setError("");

    const newHistory = [...messages, { role: "user", content: text }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();
      const reply = data?.reply || "Xin lỗi, hiện tôi không thể trả lời.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError("⚠️ Lỗi kết nối đến server. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "👋 Xin chào! Tôi là trợ lý AI của bạn. Hãy hỏi tôi bất kỳ câu hỏi nào!",
      },
    ]);
    setInput("");
    setError("");
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-2xl h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/50 bg-zinc-950">
        {/* HEADER */}
        <header className="bg-linear-to-r from-zinc-900 to-black px-6 py-4 border-b border-zinc-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#2e2e2e] rounded-lg flex items-center justify-center text-xl font-bold text-black">
                <img src="/vite.png" alt="DinhAI Logo" className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">DinhAI Pro</h1>
                <p className="text-xs text-zinc-400">Fast & Clear</p>
              </div>
            </div>
            <button
              onClick={startNewChat}
              className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-100 transition disabled:opacity-40"
              disabled={loading}
              title="Bắt đầu cuộc trò chuyện mới"
            >
              ➕ Mới
            </button>
          </div>
        </header>

        {/* CHAT MESSAGES */}
        <main className="flex-1 overflow-y-auto px-5 py-6 space-y-4 bg-zinc-950">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center font-semibold text-zinc-300 text-xs">
                  🤖
                </div>
              )}

              <div
                className={`max-w-xs lg:max-w-md px-5 py-3 rounded-xl shadow-lg leading-relaxed text-sm
                ${
                  msg.role === "user"
                    ? "bg-white text-black rounded-br-sm"
                    : "bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-bl-sm"
                }`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />

              {msg.role === "user" && (
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-base">
                  👤
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center font-semibold text-zinc-300 text-xs">
                AI
              </div>
              <div className="px-5 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm">
                <span className="animate-pulse">Đang suy nghĩ...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </main>

        {/* ERROR */}
        {error && (
          <div className="px-6 py-3 text-sm bg-red-950/50 border border-red-900/50 text-red-200">
            {error}
          </div>
        )}

        {/* INPUT */}
        <form
          onSubmit={sendMessage}
          className="p-4 bg-linear-to-r from-black to-zinc-900 border-t border-zinc-700/50"
        >
          <div className="flex gap-3">
            <input
              ref={inputRef}
              className="flex-1 px-5 py-3 rounded-lg bg-zinc-900 border border-zinc-700 outline-none text-sm text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600 focus:border-transparent"
              placeholder="Nhập tin nhắn..."
              value={input}
              autoFocus
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 rounded-lg bg-white text-black font-semibold shadow-lg hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "⏳" : "Gửi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ChatUI.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Paperclip, Send, X } from "lucide-react";
import MessageBubble from "./MessageBubble";

type Message = {
  role: "user" | "assistant";
  content: string;
  image?: string;
};

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() && !image) return;

    const newMessage: Message = {
      role: "user",
      content: input,
      image: image ? URL.createObjectURL(image) : undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    const formData = new FormData();
    formData.append("message", input);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/chat", { method: "POST", body: formData });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setImage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#08090D] text-[#F0ECE4] overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-5 py-4 sm:px-8 border-b border-[#FFB347]/15 bg-[#08090D]/90 backdrop-blur-md flex-shrink-0 z-10">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD580] to-[#FF6B35] shadow-[0_0_20px_rgba(255,179,71,0.55)] flex-shrink-0 animate-pulse" />
        <div>
          <h1 className="text-sm font-bold tracking-widest text-[#FFF3CD]">SOLAR AI</h1>
          <p className="text-[10px] text-white/40 font-mono tracking-wider">heliosphere · v2.1</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-white/40 font-mono">
          <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
          online
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 lg:px-[max(2rem,calc((100%-860px)/2))] flex flex-col gap-4 scroll-smooth">

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD580] to-[#FF6B35] shadow-[0_0_40px_rgba(255,179,71,0.4),0_0_80px_rgba(255,107,53,0.2)] animate-pulse" />
            <h2 className="text-xl font-bold text-[#FFF3CD] tracking-tight">Ask the Solar AI</h2>
            <p className="text-sm text-white/40 font-mono max-w-xs leading-relaxed">
              Powered by stellar intelligence. Ask anything — about the sun, space, or beyond.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
        )}

        {/* Loading dots */}
        {loading && (
          <div className="flex items-start gap-3 animate-[fadeInUp_0.3s_ease]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FFD580] to-[#FF6B35] shadow-[0_0_12px_rgba(255,179,71,0.4)] flex-shrink-0" />
            <div className="flex items-center gap-1.5 px-4 py-3 bg-[#14171F] border border-[#FFB347]/15 rounded-tl-sm rounded-tr-2xl rounded-br-2xl rounded-bl-2xl">
              {[0, 200, 400].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Image Preview ── */}
      {image && (
        <div className="flex items-center gap-3 px-5 py-2 sm:px-8 bg-[#FFB347]/5 border-t border-[#FFB347]/15 flex-shrink-0 z-10">
          <img
            src={URL.createObjectURL(image)}
            alt="preview"
            className="w-9 h-9 rounded-lg object-cover border border-[#FFB347]/20"
          />
          <span className="flex-1 text-xs text-[#FFB347] font-mono truncate">{image.name}</span>
          <button
            onClick={() => setImage(null)}
            className="text-white/40 hover:text-[#FF6B35] transition-colors p-1 rounded flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Input Bar ── */}
      <div className="border-t border-[#FFB347]/15 px-4 py-3 sm:px-8 sm:py-4 lg:px-[max(2rem,calc((100%-860px)/2))] bg-[#08090D]/90 backdrop-blur-md flex-shrink-0 z-10">
        <div className="flex items-end gap-2 bg-[#14171F] border border-[#FFB347]/15 rounded-2xl px-3 py-2.5 focus-within:border-[#FFB347]/40 focus-within:shadow-[0_0_0_3px_rgba(255,179,71,0.07)] transition-all">

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            id="imageUpload"
            className="hidden"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />

          {/* Upload button */}
          <label
            htmlFor="imageUpload"
            className="flex-shrink-0 mb-0.5 p-1.5 rounded-lg text-white/40 hover:text-[#FFB347] hover:bg-[#FFB347]/10 cursor-pointer transition-all"
            title="Attach image"
          >
            <Paperclip size={18} />
          </label>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the solar AI..."
            className="flex-1 bg-transparent outline-none text-[#F0ECE4] text-sm leading-relaxed resize-none max-h-[140px] min-h-[24px] py-1 placeholder:text-white/30 font-sans"
          />

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={loading || (!input.trim() && !image)}
            className="flex-shrink-0 mb-0.5 w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#FFB347] to-[#FF6B35] text-[#08090D] shadow-[0_0_16px_rgba(255,179,71,0.3)] hover:scale-105 hover:shadow-[0_0_24px_rgba(255,179,71,0.5)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
            title="Send"
          >
            <Send size={15} />
          </button>
        </div>

        <p className="hidden sm:block text-center text-[10px] text-white/25 font-mono mt-2 tracking-wide">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
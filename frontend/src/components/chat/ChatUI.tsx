"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";
import MessageBubble from "./MessageBubble";

type Message = {
  role: "user" | "assistant";
  content: string;
  image?: string;
};

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(""); // FIXED ERROR
  const [image, setImage] = useState<File | null>(null);

  const sendMessage = async () => {
    if (!input && !image) return;

    const newMessage: Message = {
      role: "user",
      content: input,
      image: image ? URL.createObjectURL(image) : undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Send to backend
    const formData = new FormData();
    formData.append("message", input);
    if (image) formData.append("image", image);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply },
    ]);

    setImage(null);
  };

  return (
    <div className="flex flex-col h-full">

      {/* CHAT MESSAGES */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
      </div>

      {/* IMAGE PREVIEW */}
      {image && (
        <div className="px-6 pb-2 text-sm text-white/70">
          Image attached: {image.name}
        </div>
      )}

      {/* INPUT BAR */}
      <div className="border-t border-white/10 p-4 flex items-center gap-3">

        {/* Hidden input */}
        <input
          type="file"
          accept="image/*"
          id="imageUpload"
          className="hidden"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        {/* Upload Button */}
        <label
  htmlFor="imageUpload"
  className="flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/10 cursor-pointer transition"
>
  <Paperclip size={18} />
</label>

        {/* Text Input */}
        <input
          className="
            flex-1
            bg-white/[0.05]
            border border-white/10
            rounded-xl
            px-4
            py-3
            outline-none
            text-white
          "
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the solar AI..."
        />

        {/* Send Button */}
        <button
          onClick={sendMessage}
          className="
            bg-white
            text-black
            px-5
            py-2
            rounded-xl
            font-medium
            hover:opacity-90
          "
        >
          Send
        </button>

      </div>
    </div>
  );
}
type Props = {
  message: {
    role: "user" | "assistant";
    content: string;
    image?: string;
  };
};

export default function MessageBubble({ message }: Props) {
  return (
    <div
      className={`flex ${
        message.role === "user"
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className="
        max-w-[65%]
        bg-white/[0.06]
        border border-white/10
        px-5
        py-3
        rounded-2xl
        backdrop-blur-md
        "
      >
        {message.image && (
          <img
            src={message.image}
            className="mb-2 rounded-lg max-h-[220px]"
          />
        )}

        <p className="text-white/90">{message.content}</p>
      </div>
    </div>
  );
}
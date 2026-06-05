import AppHeader from "@/components/AppHeader";
import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendMessage } from "@/lib/aiApi";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistant() {
    const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your Star Poultry AI assistant. Ask me about revenue, expenses, profit, customers, or orders.",
    },
  ]);

  const [input, setInput] = useState("");
  const suggestions = [
  "Revenue this month",
  "Current profit",
  "Top customers",
  "Pending orders",
];
const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = input;

  setMessages((prev) => [
    ...prev,
    {
      role: "user",
      content: userMessage,
    },
  ]);

  setInput("");

  try {
    const data = await sendMessage(userMessage);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data.response,
      },
    ]);
  } catch (error) {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Failed to contact backend AI.",
      },
    ]);
  }
};
  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="container py-10 md:py-16">
        <div className="glass-strong rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-8 h-8 text-accent" />
            <h1 className="font-display text-4xl md:text-5xl">
              AI <span className="text-gradient-gold">Assistant</span>
            </h1>
          </div>

          <p className="text-muted-foreground text-lg">
            Your poultry business intelligence assistant.
          </p>

          <div className="mt-8 space-y-6">

  {/* Suggested Questions */}
  <div>
    <p className="text-sm text-muted-foreground mb-3">
      Suggested Questions
    </p>

    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          variant="outline"
          size="sm"
          onClick={() => setInput(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  </div>

  {/* Chat Messages */}
  <div className="rounded-2xl border border-border/40 p-4 h-[450px] overflow-y-auto space-y-4 bg-background/30">

    {messages.map((message, index) => (
      <div
        key={index}
        className={`flex ${
          message.role === "user"
            ? "justify-end"
            : "justify-start"
        }`}
      >
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            message.role === "user"
              ? "bg-gradient-gold text-accent-foreground"
              : "glass"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {message.role === "assistant" ? (
              <Bot className="w-4 h-4" />
            ) : (
              <User className="w-4 h-4" />
            )}

            <span className="text-xs font-medium">
              {message.role === "assistant"
                ? "AI Assistant"
                : "You"}
            </span>
          </div>

          <p className="text-sm">
            {message.content}
          </p>
        </div>
      </div>
    ))}

  </div>

  {/* Input Area */}
  <div className="flex gap-3">
    <Input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Ask about revenue, profit, customers..."
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSend();
        }
      }}
    />

    <Button
      onClick={handleSend}
      className="bg-gradient-gold text-accent-foreground hover:opacity-90"
    >
      <Send className="w-4 h-4" />
    </Button>
  </div>

</div>
        </div>
      </main>
    </div>
  );
}
import AppHeader from "@/components/AppHeader";
import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, Check, X, AlertTriangle, Calendar, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendMessage, confirmAction, cancelAction } from "@/lib/aiApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";


type Message = {
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
};

interface ExpenseDraft {
  type: "expense_draft";
  draftId: string;
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  description?: string;
  warning?: string;
}

function tryParseDraft(content: string): ExpenseDraft | null {
  try {
    const trimmed = content.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const parsed = JSON.parse(trimmed);
      if (parsed && parsed.type === "expense_draft") {
        return parsed as ExpenseDraft;
      }
    }
  } catch (e) {
    // Silent fail
  }
  return null;
}


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


const messagesEndRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);

  const [actionLoading, setActionLoading] = useState(false);

  const handleConfirmAction = async (messageIndex: number) => {
    setActionLoading(true);
    try {
      const res = await confirmAction();
      if (res.success) {
        setMessages((prev) => {
          const updated = [...prev];
          const draft = tryParseDraft(updated[messageIndex].content);
          const title = draft ? draft.title : "Expense";
          const amount = draft ? draft.amount : 0;
          updated[messageIndex] = {
            role: "assistant",
            content: ` **Expense Confirmed**: "${title}" of **₹${amount.toLocaleString('en-IN')}** has been successfully recorded in the database.`,
          };
          return updated;
        });
      }
    } catch (error: any) {
      console.error("Failed to confirm action", error);
      alert(error.message || "Failed to confirm action");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAction = async (messageIndex: number) => {
    setActionLoading(true);
    try {
      const res = await cancelAction();
      if (res.success) {
        setMessages((prev) => {
          const updated = [...prev];
          const draft = tryParseDraft(updated[messageIndex].content);
          const title = draft ? draft.title : "Expense";
          updated[messageIndex] = {
            role: "assistant",
            content: ` **Draft Cancelled**: The expense draft for "${title}" has been cancelled.`,
          };
          return updated;
        });
      }
    } catch (error: any) {
      console.error("Failed to cancel action", error);
      alert(error.message || "Failed to cancel action");
    } finally {
      setActionLoading(false);
    }
  };

const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = input;

  setMessages((prev) => [
    ...prev,
    {
      role: "user",
      content: userMessage,
    },
    {
      role: "assistant",
      content: "",
      loading: true,
    },
  ]);

  setInput("");

  try {
    const data = await sendMessage(userMessage);

    setMessages((prev) => {
      const updated = [...prev];

      updated[updated.length - 1] = {
        role: "assistant",
        content: data.response,
      };

      return updated;
    });

  } catch (error) {

    setMessages((prev) => {
      const updated = [...prev];

      updated[updated.length - 1] = {
        role: "assistant",
        content: "Failed to contact backend AI.",
      };

      return updated;
    });

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

          {message.loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">
                Thinking...
              </span>
            </div>
          ) : tryParseDraft(message.content) ? (
            (() => {
              const draft = tryParseDraft(message.content)!;
              return (
                <div className="space-y-3 min-w-[280px]">
                  <div className="flex items-center gap-2 border-b border-border/30 pb-2 mb-2">
                    <Bot className="w-5 h-5 text-accent animate-pulse" />
                    <span className="font-semibold text-sm text-accent">Confirm Expense Draft</span>
                  </div>
                  
                  {draft.warning && (
                    <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 text-xs text-amber-300 animate-fadeIn">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <span>{draft.warning}</span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Title</span>
                      <span className="text-sm font-medium text-foreground">{draft.title}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Category</span>
                        <span className="text-xs font-medium bg-background/50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-0.5 border border-border/40 text-foreground">
                          <Tag className="w-3 h-3 text-muted-foreground" />
                          {draft.category}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Date</span>
                        <span className="text-xs font-medium text-foreground inline-flex items-center gap-1 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {draft.expenseDate}
                        </span>
                      </div>
                    </div>
                    
                    {draft.description && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Description</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{draft.description}</p>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-border/20 mt-2 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Amount</span>
                        <span className="text-lg font-bold text-accent">
                          ₹{draft.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleCancelAction(index)}
                          className="text-xs h-7 px-2 border-border/50 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleConfirmAction(index)}
                          className="text-xs h-7 px-2.5 bg-gradient-gold text-accent-foreground hover:opacity-90 transition-all duration-200"
                        >
                          {actionLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <Check className="w-3 h-3 mr-1" />
                          )}
                          Confirm
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="prose prose-invert max-w-none text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold mb-3 text-accent">
                      {children}
                    </h1>
                  ),

                  h2: ({ children }) => (
                    <h2 className="text-lg font-semibold mt-4 mb-2">
                      {children}
                    </h2>
                  ),

                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 space-y-1">
                      {children}
                    </ul>
                  ),

                  table: ({ children }) => (
                    <table className="w-full border border-border rounded-lg overflow-hidden my-4">
                      {children}
                    </table>
                  ),

                  thead: ({ children }) => (
                    <thead className="bg-muted">
                      {children}
                    </thead>
                  ),

                  th: ({ children }) => (
                    <th className="border border-border px-3 py-2 text-left">
                      {children}
                    </th>
                  ),

                  td: ({ children }) => (
                    <td className="border border-border px-3 py-2">
                      {children}
                    </td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    ))}
    <div ref={messagesEndRef} />
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